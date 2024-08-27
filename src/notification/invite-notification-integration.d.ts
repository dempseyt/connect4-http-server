import { InviteStatus } from "@/invite/invite-service-types";

export type InviteReceivedMessage = {
  inviter: string;
  invitee: string;
  exp: number;
  uuid: string;
  status: InviteStatus.PENDING;
};
