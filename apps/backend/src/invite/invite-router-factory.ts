import SessionService from "@/session/session-service";
import express, { RequestHandler } from "express";
import { mergeRight, pipe } from "ramda";
import InviteService from "./invite-service";
import registerInviteAcceptanceMiddleware from "./register-invite-acceptance-middleware";
import registerInviteCreationMiddleware from "./register-invite-creation-middleware";

const authorisationMiddleware: RequestHandler = (req, res, next) =>
  res.locals.claims?.email
    ? next()
    : res.status(401).send({
        errors: ["You must be logged in to send an invite"],
      });

const createCreateInviteRequestHandlerFactory =
  (inviteService: InviteService): RequestHandler =>
  async ({ body: { invitee, inviter } }, res) =>
    inviteService
      .create({ invitee, inviter })
      .then(({ inviter, invitee, exp, uuid }) =>
        res.status(201).send({ invite: { inviter, invitee, exp, uuid } })
      )
      .catch((err) => res.status(403).send({ errors: [err.message] }));

const createGetInviteMiddleware =
  (inviteService: InviteService): RequestHandler =>
  async (req, res) =>
    await inviteService
      .getUsersInvites(res.locals.claims.email)
      .then((invites) =>
        res.status(200).send({
          invites: invites.map((inviteDetails) =>
            mergeRight(inviteDetails, {
              _links: {
                accept: {
                  href: `/invite/${inviteDetails.uuid}/accept`,
                  method: "POST",
                },
                decline: {
                  href: `/invite/${inviteDetails.uuid}/decline`,
                  method: "POST",
                },
              },
            })
          ),
        })
      );

const inviteRouterFactory = (
  inviteService: InviteService,
  sessionService: SessionService
) => {
  const inviteRouter = express.Router();

  // inviteRouter.use(authorisationMiddleware);
  // inviteRouter.get("/inbox", createGetInviteMiddleware(inviteService));
  // inviteRouter.post(
  //   "/",
  //   inviteAuthorisationMiddleware,
  //   createCreateInviteRequestHandlerFactory(inviteService)
  // );
  // inviteRouter.post("/:inviteUuid/accept");
  // inviteRouter.get("/:inviteUuid");
  // registerInviteCreationMiddleware(inviteRouter, inviteService);
  // registerInviteAcceptanceMiddleware(
  //   inviteRouter,
  //   inviteService,
  //   sessionService
  // );

  return pipe(
    (router) => router.use(authorisationMiddleware),
    (router) => router.get("/inbox", createGetInviteMiddleware(inviteService)),
    (router) => registerInviteCreationMiddleware(router, inviteService),
    (router) =>
      registerInviteAcceptanceMiddleware(router, inviteService, sessionService),
    (router) =>
      router.get(
        "/:inviteUuid",
        createCreateInviteRequestHandlerFactory(inviteService)
      )
  )(inviteRouter);
};

export default inviteRouterFactory;
