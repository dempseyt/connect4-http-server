import { PersistedUser, User, UserRepository, Uuid } from "./user-repository";

export default class InMemoryUserRepository implements UserRepository {
  private users: Map<Uuid, PersistedUser>;
  constructor() {
    this.users = new Map();
  }

  async create(user: User): Promise<PersistedUser> {
    const userUuid = crypto.randomUUID();
    await this.users.set(userUuid, { ...user, uuid: userUuid });
    return Promise.resolve({ ...user, uuid: userUuid });
  }

  async findByEmail(email: string) {
    return Promise.resolve(
      Array.from(this.users.values()).filter((user) => user.email === email)
    );
  }
}
