import { MouseEvent, useState } from "react";
import { SyncLoader } from "react-spinners";

type LoginDetails = {
  email: string;
  password: string;
};
type LoginHandler = (
  loginDetails: LoginDetails
) => Promise<"SUCCESS" | "FAILED" | void>;

type LoginFormProps = {
  loginHandler?: LoginHandler;
};

const LoginForm = ({ loginHandler = async () => {} }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function isEmailValid() {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    return email.match(emailRegex);
  }

  function isFormCorrectlyFilledIn() {
    return password !== "" && isEmailValid();
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    isFormCorrectlyFilledIn() ? setIsDisabled(false) : setIsDisabled(true);
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    isFormCorrectlyFilledIn() ? setIsDisabled(false) : setIsDisabled(true);
  }

  return (
    <div className="items-center border-2 p-10 flex justify-center">
      {isSuccess ? (
        <p className="text-green-700 font-bold">SUCCESS ✅</p>
      ) : (
        <form className="flex flex-col gap-2 ">
          <div className="flex flex-col">
            <label className="decoration-solid">Email: </label>
            <input
              required
              type="email"
              className="border-2"
              onChange={handleEmailChange}
              placeholder="Email"
            />
          </div>
          <div className="flex flex-col">
            <label>Password: </label>
            <input
              required
              type="password"
              className="border-2"
              onChange={handlePasswordChange}
              placeholder="Password"
            />
          </div>
          {errorMsg !== "" ? (
            <div>
              <p className="text-red-600">{errorMsg}</p>
            </div>
          ) : (
            ""
          )}
          <button
            type="submit"
            id="submit-btn"
            className={
              isDisabled
                ? "bg-slate-300 max-w-fit font-bold py-2 px-4 rounded"
                : "bg-blue-500 hover:bg-blue-700 text-white max-w-fit font-bold py-2 px-4 rounded cursor-pointer"
            }
            onClick={async (event: MouseEvent) => {
              event.preventDefault();
              if (email === "" && password === "") {
                setErrorMsg("Email and Password are required");
              } else if (email === "") {
                setErrorMsg("Email is required");
              } else if (password === "") {
                setErrorMsg("Password is required");
              } else if (!isEmailValid()) {
                setErrorMsg("Enter a Valid Email");
              } else {
                setIsLoading(true);
                const loginResult = await loginHandler({ email, password });
                if (loginResult === "FAILED") {
                  setErrorMsg("Login failed... Please try again");
                } else if (loginResult === "SUCCESS") {
                  setIsSuccess(true);
                } else {
                  setErrorMsg("Something went wrong... Please try again");
                }
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? (
              <SyncLoader color={"#ffffff"} size={5} loading={isLoading} />
            ) : (
              "Login"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
