import express, { RequestHandler } from "express";
import { pipe } from "ramda";
import InviteService from "./invite-service";

const authorisationMiddleware: RequestHandler = (req, res, next) =>
  res.locals.claims?.email
    ? next()
    : res.status(401).send({
        errors: ["You must be logged in to send an invite"],
      });

const inviteAuthorisationMiddleware: RequestHandler = (req, res, next) =>
  req.body.inviter === res.locals.claims.email
    ? next()
    : res.status(403).send({
        errors: ["You can not send an invite as another user"],
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

const inviteRouterFactory = (inviteService: InviteService) =>
  pipe(
    (router) => router.use(authorisationMiddleware),
    (router) =>
      router.post(
        "/",
        inviteAuthorisationMiddleware,
        createCreateInviteRequestHandlerFactory(inviteService)
      )
  )(express.Router());

export default inviteRouterFactory;
