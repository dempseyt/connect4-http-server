import {
  CreateUserParams,
  PersistedUser,
  UserRepository,
} from "./user-repository";

export default class InMemoryUserRepository implements UserRepository {
  private users = new Map();
  constructor() {
    this.users = new Map();
  }

  async create(user: CreateUserParams): Promise<PersistedUser> {
    const userUuid = crypto.randomUUID();
    await this.users.set(userUuid, user);
    const { firstName, lastName, email } = user;
    return {
      firstName,
      lastName,
      email,
      uuid: userUuid,
    };
  }
}
