export type CreateInviteDetails = {
  inviter: string;
  invitee: string;
};

export enum InviteStatus {
  PENDING = "PENDING",
}

export type InviteDetails = {
  inviter: string;
  invitee: string;
  uuid: string;
  exp: number;
  status: InviteStatus;
};

export enum InviteEvents {
  INVITATION_CREATED = "INVITATION_CREATED",
}

export type InviteServiceEventHandler = <T extends InviteDetails>(
  message: T
) => Promise<unknown>;

export type InviteServiceEventHandlers = Record<
  InviteEvents,
  InviteServiceEventHandler
>;
