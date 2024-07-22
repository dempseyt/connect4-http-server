export interface UserRepository {
  create: (user: User) => Promise<PersistedUser>;
  findByEmail: (email: string) => Promise<Array<User & { uuid: Uuid }>>;
}

export type UserCredentials = {
  email: string;
  password: string;
};

export type Uuid = `${string}-${string}-${string}-${string}`;

export type User = {
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
