import argon2 from "argon2";
import { isEmpty } from "ramda";
import { User, UserCredentials, UserRepository } from "./user-repository";

export class UserAlreadyExistsError extends Error {}
export class AuthenticationFailedError extends Error {}

type Uuid = `${string}-${string}-${string}-${string}`;

export interface UserServiceInterface {
  create: (userDetails: User) => Promise<User & { uuid: Uuid }>;
  authenticate: (userCredentials: UserCredentials) => Promise<void>;
}

class UserService implements UserServiceInterface {
  private userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async create(userDetails: User) {
    if (isEmpty(await this.userRepository.findByEmail(userDetails.email))) {
      return await this.userRepository.create({
        ...userDetails,
        password: await argon2.hash(userDetails.password),
      });
    } else {
      throw new UserAlreadyExistsError("A user with that email already exists");
    }
  }

  async authenticate({ email, password }: UserCredentials) {
    const userDetails = (await this.userRepository.findByEmail(email))[0];
    if (userDetails !== undefined) {
      const isValidPassword = await argon2.verify(
        userDetails.password,
        password
      );
      if (!isValidPassword) {
        throw new AuthenticationFailedError("Authentication failed");
      }
    } else {
      throw new AuthenticationFailedError("Authentication failed");
    }
  }
}

export default UserService;
