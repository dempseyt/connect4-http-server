export type BackendUrl = string;
export type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
export type SignupServiceDetails = {
  backendUrl: BackendUrl;
  userDetails: UserDetails;
};
export interface SignupServiceInterface {
  registerRequest: (userDetails: UserDetails) => Promise<void>;
}
