import {
  BackendUrl,
  SignupServiceDetails,
  SignupServiceInterface,
  UserDetails,
} from "./type.d";

class SignupService implements SignupServiceInterface {
  #backendUrl: BackendUrl;
  #userDetails: UserDetails;

  constructor({ backendUrl, userDetails }: SignupServiceDetails) {
    this.#backendUrl = backendUrl;
    this.#userDetails = userDetails;
  }

  async registerRequest({
    firstName,
    lastName,
    email,
    password,
  }: UserDetails) {}
}

export default SignupService;
