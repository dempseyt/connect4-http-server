import { InviteStatus } from "./invite-service-types.d";

export type InviteReceivedMessage = {
  inviter: string;
  invitee: string;
  exp: number;
  uuid: string;
  status: InviteStatus.PENDING;
};
