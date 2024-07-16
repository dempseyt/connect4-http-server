export interface UserRepository {
  create: (user: CreateUserParams) => Promise<PersistedUser>;
}

export type CreateUserParams = {
  firstName: string;
  lastName: string;
  email: string;
};

export type PersistedUser = {
  firstName: string;
  lastName: string;
  email: string;
  uuid: `${string}-${string}-${string}-${string}`;
};
