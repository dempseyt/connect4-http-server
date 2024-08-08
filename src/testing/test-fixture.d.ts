export type UserDetails = {
  email: string;
  password: string;
};

export type UserCredentials = {
  email: string;
  password: string;
};

export type SendInviteDetails = {
  inviter: string;
  invitee: string;
  authorization: string;
};

export type GetInviteDetails = {
  email: string;
  authorization: string;
};
