import { MouseEvent, useState } from "react";
import { SyncLoader } from "react-spinners";

type SignupDetails = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type SignupHandler = (
  signupDetails: SignupDetails
) => Promise<"SUCCESS" | "FAILED" | void>;

type LoginRedirectHandler = () => Promise<void>;

type SignupFormProps = {
  signupHandler?: SignupHandler;
  loginRedirectHandler?: LoginRedirectHandler;
};

function isEmailValid(email: string) {
  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  return email.match(emailRegex);
}

function signupValidator(
  { firstName, lastName, email, password }: SignupDetails,
  setErrorMsg: (errorMsg: string) => void
) {
  if (firstName === "" && lastName === "" && email === "" && password === "") {
    setErrorMsg("All fields are required");
    return false;
  } else if (firstName === "") {
    setErrorMsg("Please enter your first name");
    return false;
  } else if (lastName === "") {
    setErrorMsg("Pleas enter your last name");
    return false;
  } else if (email === "") {
    setErrorMsg("Please enter your email");
    return false;
  } else if (password === "") {
    setErrorMsg("Please enter your password");
    return false;
  } else {
    if (!isEmailValid(email)) {
      setErrorMsg("Please enter a valid email");
      return false;
    }
    return true;
  }
}

const SignupForm = ({
  signupHandler = async () => {},
  loginRedirectHandler = () => Promise.resolve(),
}: SignupFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleLastNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLastName(event.target.value);
  }
  function handleFirstNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFirstName(event.target.value);
  }
  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }
  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  return (
    <form className="flex flex-col justify-center items-center gap-1">
      <input
        required
        className="border-2"
        type="text"
        placeholder="First name"
        onChange={handleFirstNameChange}
      />
      <input
        required
        className="border-2"
        type="text"
        placeholder="Last name"
        onChange={handleLastNameChange}
      />
      <input
        required
        className="border-2"
        type="email"
        placeholder="Email"
        onChange={handleEmailChange}
      />
      <input
        required
        className="border-2"
        type="password"
        placeholder="Password"
        onChange={handlePasswordChange}
      />
      {isSuccess ? (
        <p className="text-green-500">Success</p>
      ) : errorMsg !== "" ? (
        <p className="text-red-600">{errorMsg}</p>
      ) : (
        ""
      )}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white max-w-fit font-bold py-2 px-4 rounded cursor-pointer"
        type="submit"
        onClick={async (event: MouseEvent) => {
          event.preventDefault();
          signupValidator(
            { firstName, lastName, email, password },
            setErrorMsg
          );
          setIsLoading(true);
          const signupResponse = await signupHandler({
            firstName,
            lastName,
            email,
            password,
          });
          setIsLoading(false);
          if (signupResponse === "FAILED") {
            setErrorMsg("Sign up failed... please try again");
          } else if (signupResponse === "SUCCESS") {
            setIsSuccess(true);
          }
        }}
      >
        {isLoading ? (
          <SyncLoader color={"#ffffff"} size={5} loading={isLoading} />
        ) : (
          "Sign Up"
        )}
      </button>
      <a
        onClick={async (event: MouseEvent) => {
          event.preventDefault();
          await loginRedirectHandler();
        }}
        className="text-blue-800 cursor-pointer hover:text-blue-300"
      >
        Already have an account? Login
      </a>
    </form>
  );
};

export default SignupForm;
