import { Uuid } from "@/global.d";

export type InviteReceivedMessage = {
  inviter: string;
  invitee: string;
  exp: number;
  uuid: Uuid;
  status: InviteStatus.PENDING;
};

export type InviteParticipants = {
  inviter: string;
  invitee: string;
};

export type CreateInviteDetails = {
  inviter: string;
  invitee: string;
  exp: number;
};

export type PersistedInvite = {
  inviter: string;
  invitee: string;
  exp: number;
  uuid: Uuid;
  status: InviteStatus;
};

export type InviteDetails = PersistedInvite;

export interface InviteRepository {
  create: (createInviteDetails: CreateInviteDetails) => PersistedInvite;
  getUsersInvites: (userEmail: string) => Promise<PersistedInvite[]>;
  getInviteDetails: (inviteUuid: Uuid) => Promise<PersistedInvite>;
  deleteInvite: (inviteUuid: Uuid) => Promise<{ isSuccess: boolean }>;
}

export enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export enum InviteEvents {
  INVITATION_CREATED = "INVITATION_CREATED",
  INVITATION_RECEIVED = "INVITATION_RECEIVED",
}

export type InviteServiceEventPublisher = <T extends InviteDetails>(
  message: T
) => Promise<unknown>;

export type InviteServiceEventPublishers = Record<
  InviteEvents.INVITATION_CREATED,
  InviteServiceEventPublisher
>;

export interface InviteServiceInterface {
  create: (createInviteDetails: CreateInviteDetails) => Promise<InviteDetails>;
  getUsersInvites: (userEmail: string) => Promise<PersistedInvite[]>;
  acceptInvite: (inviteUuid: Uuid) => Promise<Uuid>;
}
