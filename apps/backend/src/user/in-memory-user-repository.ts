import { Uuid } from "@/global";
import {
  PersistedUser,
  UserRegisterDetails,
  UserRepository,
} from "@/user/types.d";

export default class InMemoryUserRepository implements UserRepository {
  private users: Map<Uuid, PersistedUser>;
  constructor() {
    this.users = new Map();
  }

  async create(user: UserRegisterDetails): Promise<PersistedUser> {
    const userUuid = crypto.randomUUID();
    await this.users.set(userUuid, { ...user, uuid: userUuid });
    return Promise.resolve({ ...user, uuid: userUuid });
  }

  async findByEmail(email: string): Promise<PersistedUser[]> {
    return Promise.resolve(
      Array.from(this.users.values()).filter((user) => user.email === email),
    );
  }
}
