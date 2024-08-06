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
  (req, res, next) => {
    const { invitee, inviter } = req.body;
    const { uuid, exp } = inviteService.create({ invitee, inviter });
    const invitationDetails = {
      uuid,
      inviter,
      invitee,
      exp,
    };
    res.status(201).send({ invite: invitationDetails });

    next();
  };

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
