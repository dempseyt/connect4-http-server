import express, { RequestHandler } from "express";
import InviteService from "./invite-service";

const authorisationMiddleware: RequestHandler = (req, res, next) =>
  res.locals.claims?.email
    ? next()
    : res.status(401).send({
        errors: ["You must be logged in to send an invite"],
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

const createInviteAuthorisationMiddleware: RequestHandler = (
  req,
  res,
  next
) => {
  const { inviter } = req.body;
  if (inviter === res.locals.claims.email) {
    next();
  }
  res.status(401).send({
    errors: ["You can not send an invite as another user"],
  });
};

const inviteRouterFactory = (inviteService: InviteService) => {
  const inviteRouter = express.Router();
  inviteRouter.use(authorisationMiddleware);
  inviteRouter.post(
    "/",
    createInviteAuthorisationMiddleware,
    createCreateInviteRequestHandlerFactory(inviteService)
  );
  return inviteRouter;
};

export default inviteRouterFactory;
