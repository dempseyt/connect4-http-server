type Uuid = `${string}-${string}-${string}-${string}`;
type User = {
  firstName: string;
  lastName: string;
  email: string;
};

export interface UserServiceInterface {
  create: (userDetails: User) => Promise<User & { uuid: Uuid }>;
}

class UserService implements UserServiceInterface {
  #userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.#userRepository = userRepository;
  }

  async create(userDetails: User) {
    return await this.#userRepository.create(userDetails);
  }
}

export default UserService;
