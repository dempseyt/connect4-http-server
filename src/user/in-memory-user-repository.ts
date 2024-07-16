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

interface InMemoryUserRepository {
  create: (user: CreateUserParams) => PersistedUser;
}

export default class InMemoryUserRepositoryFactory
  implements InMemoryUserRepository
{
  private users = new Map();
  constructor() {
    this.users = new Map();
  }

  create(user: CreateUserParams): PersistedUser {
    const userUuid = crypto.randomUUID();
    this.users.set(userUuid, user);
    const { firstName, lastName, email } = user;
    return {
      firstName,
      lastName,
      email,
      uuid: userUuid,
    };
  }
}
