import { InviteStatus } from "./invite-service-types.d";

export type CreateInviteDetails = {
  inviter: string;
  invitee: string;
  exp: number;
};

type PersistedInvite = CreateInviteDetails & {
  uuid: string;
  status: InviteStatus;
};

export interface InviteRepository {
  create: (createInviteDetails: CreateInviteDetails) => PersistedInvite;
}
