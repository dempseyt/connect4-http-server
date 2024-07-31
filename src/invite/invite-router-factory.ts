import express, { RequestHandler } from "express";
import InviteService from "./invite-service";

const authorisationMiddleware: RequestHandler = (req, res, next) =>
  res.locals.claims?.email
    ? next()
    : res.status(401).send({
        errors: ["You must be logged in to send an invite"],
      });

const createInviteRequestHandlerFactory =
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

const inviteRouterFactory = (inviteService: InviteService) => {
  const inviteRouter = express.Router();
  inviteRouter.use(authorisationMiddleware);
  inviteRouter.post("/", createInviteRequestHandlerFactory(inviteService));
  return inviteRouter;
};

export default inviteRouterFactory;
