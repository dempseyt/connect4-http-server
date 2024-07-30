import express, { RequestHandler } from "express";
import InviteService from "./invite-service";
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
  };

const inviteRouterFactory = (inviteService: InviteService) => {
  const inviteRouter = express.Router();
  inviteRouter.post("/", createInviteRequestHandlerFactory(inviteService));
  return inviteRouter;
};

export default inviteRouterFactory;
