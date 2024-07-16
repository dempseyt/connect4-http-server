interface UserRepository {
  create: (user: CreateUserParams) => Promise<PersistedUser>;
}

type CreateUserParams = {
  firstName: string;
  lastName: string;
  email: string;
};

type PersistedUser = {
  firstName: string;
  lastName: string;
  email: string;
  uuid: `${string}-${string}-${string}-${string}`;
};
