export interface UserRepository {
  create: (user: UserRegisterDetails) => Promise<PersistedUser>;
  findByEmail: (
    email: string
  ) => Promise<Array<UserRegisterDetails & { uuid: Uuid }>>;
}

export type UserCredentials = {
  email: string;
  password: string;
};

export type Uuid = `${string}-${string}-${string}-${string}`;

export type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
};

export type UserRegisterDetails = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type PersistedUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  uuid: `${string}-${string}-${string}-${string}`;
};
