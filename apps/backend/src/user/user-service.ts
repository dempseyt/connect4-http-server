import {
  AuthenticationFailedError,
  NoSuchUserError,
  UserAlreadyExistsError,
} from "@/user/errors";
import argon2 from "@node-rs/argon2";
import { isEmpty } from "ramda";
import {
  UserCredentials,
  UserDetails,
  UserRegisterDetails,
  UserRepository,
} from "./types";

type Uuid = `${string}-${string}-${string}-${string}`;

export interface UserServiceInterface {
  create: (
    userDetails: UserRegisterDetails,
  ) => Promise<UserRegisterDetails & { uuid: Uuid }>;
  authenticate: (
    userCredentials: UserCredentials,
  ) => Promise<{ message: string }>;
  getUserDetails: (userEmail: string) => Promise<UserDetails | void>;
  getDoesUserExist: (userEmail: string) => Promise<boolean>;
}

class UserService implements UserServiceInterface {
  private userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async create(userDetails: UserRegisterDetails) {
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
        password,
      );
      if (isValidPassword) {
        return {
          message: "Authentication succeeded",
        };
      } else {
        throw new AuthenticationFailedError("Authentication failed");
      }
    } else {
      throw new AuthenticationFailedError("Authentication failed");
    }
  }

  async getUserDetails(userEmail: string) {
    const persistedUsersWithProvidedEmail =
      await this.userRepository.findByEmail(userEmail);

    const persistedUser = persistedUsersWithProvidedEmail[0];
    if (persistedUser === undefined) {
      throw new NoSuchUserError("User does not exist");
    }
    const { uuid, firstName, lastName, email } = persistedUser;
    return {
      uuid,
      firstName,
      lastName,
      email,
    };
  }
  async getDoesUserExist(userEmail: string) {
    const persistedUsersWithProvidedEmail =
      await this.userRepository.findByEmail(userEmail);
    return persistedUsersWithProvidedEmail.length !== 0;
  }
}

export default UserService;
