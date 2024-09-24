import appFactory from "@/app";
import { InviteCreatedEvent } from "@/invite/create-invite-event-listener";
import TestFixture from "@/testing/test-fixture";
import { Express } from "express";
import { generateKeyPair } from "jose";
import { Subject } from "rxjs";
import { io as ioc, Socket } from "socket.io-client";

describe(`invite-notification-integration.ts`, () => {
  let app: Express;
  let testFixture: TestFixture;
  let inviteeSocket: Socket;
  let token;
  let internalEventPublisher;

  beforeAll(async () => {
    const jwtKeyPair = await generateKeyPair("RS256");
    const messageSubject = new Subject<InviteCreatedEvent>();
    internalEventPublisher = jest.fn((eventDetails: InviteCreatedEvent) => {
      return Promise.resolve(messageSubject.next(eventDetails));
    });
    app = appFactory({
      stage: "test",
      keySet: {
        jwtPrivateKey: jwtKeyPair.privateKey,
        jwtPublicKey: jwtKeyPair.publicKey,
      },
      internalEventPublisher,
      internalEventSubscriber: messageSubject,
    });
    testFixture = new TestFixture(app);
  });

  describe(`given a user is logged in`, () => {
    describe(`when another user sends them an invite`, () => {
      beforeEach(async () => {
        let connectionResolver;
        const connectionEstablishedPromise = new Promise((resolve) => {
          connectionResolver = resolve;
        });

        await testFixture.register({
          email: "inviter@mail.com",
          password: "password",
        });
        await testFixture.register({
          email: "invitee@mail.com",
          password: "password",
        });

        const inviteeLoginResponse = await testFixture.login({
          email: "invitee@mail.com",
          password: "password",
        });

        const {
          body: {
            notification: { uri: inviteeUri },
          },
          headers: { authorization: inviteeToken },
        } = inviteeLoginResponse;

        token = inviteeToken;

        inviteeSocket = ioc(inviteeUri, {
          auth: {
            token: inviteeToken.split(" ")[1],
          },
        });

        inviteeSocket.on("connection_established", () => {
          connectionResolver("");
        });

        await connectionEstablishedPromise;
      });

      it(`they receive a new notification`, async () => {
        expect.assertions(2);
        let inviteReceivedResolver;
        const inviteReceivedPromise = new Promise((resolve) => {
          inviteReceivedResolver = resolve;
        });
        inviteeSocket.on("INVITATION_RECEIVED", (inviteDetails) => {
          inviteReceivedResolver(inviteDetails);
        });

        const inviterLoginAuth = await testFixture.login({
          email: "inviter@mail.com",
          password: "password",
        });

        await testFixture.sendInvite({
          inviter: "inviter@mail.com",
          invitee: "invitee@mail.com",
          authorization: inviterLoginAuth.headers.authorization,
        });

        expect(internalEventPublisher).toHaveBeenCalledWith({
          payload: {
            inviter: "inviter@mail.com",
            invitee: "invitee@mail.com",
            exp: expect.any(Number),
            uuid: expect.toBeUuid(),
            status: "PENDING",
          },
          type: "INVITATION_CREATED",
          recipient: "invitee@mail.com",
        });

        return expect(inviteReceivedPromise).resolves.toEqual({
          inviter: "inviter@mail.com",
          invitee: "invitee@mail.com",
          exp: expect.any(Number),
          uuid: expect.toBeUuid(),
          status: "PENDING",
        });
      });
    });
  });
});
