import createSocketServer from "@/create-socket-server";
import createInviteEventListener, {
  InviteCreatedEvent,
} from "@/invite/create-invite-event-listener";
import { InviteDetails, InviteEvents } from "@/invite/invite-service-types.d";
import createDispatchNotification from "@/notification/create-dispatch-notification";
import { createServer as createHTTPServer } from "http";
import { KeyLike } from "jose";
import { AddressInfo } from "net";
import { Subject } from "rxjs";
import { Server } from "socket.io";
import appFactory from "./app";
import { Notification } from "./notification/notification";
type ServerParameters = {
  stage: "test" | "production";
  keySet: {
    jwtPrivateKey: KeyLike;
    jwtPublicKey: KeyLike;
  };
};

const createServer = ({ stage, keySet }: ServerParameters) => {
  const httpServer = createHTTPServer().listen();
  const port = (httpServer.address() as AddressInfo).port;
  const authority = `localhost:${port}`;
  let socketServer: Server;
  let dispatchNotification: ReturnType<typeof createDispatchNotification>;

  const dispatchExternalEvent = (eventDetails: Notification) => {
    let type = eventDetails.type;
    if (type === InviteEvents.INVITATION_CREATED) {
      type = "invite_received";
    }
    dispatchNotification({
      ...eventDetails,
      type,
    });
    return Promise.resolve();
  };

  const inviteEventSubject = new Subject<InviteCreatedEvent>();
  createInviteEventListener(inviteEventSubject, dispatchExternalEvent);
  const app = appFactory({
    stage,
    keySet,
    internalEventPublisher: (type: InviteEvents, payload: InviteDetails) => {
      inviteEventSubject.next({ recipient: payload.invitee, type, payload });
      return Promise.resolve();
    },
    authority,
  });
  socketServer = createSocketServer(app, {
    privateKey: keySet.jwtPrivateKey,
    httpServer,
  });
  dispatchNotification = createDispatchNotification(socketServer);

  return { app, httpServer, socketServer, authority };
};

export default createServer;
