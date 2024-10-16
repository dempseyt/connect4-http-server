"use client";
import SignupForm from "@/components/SignupForm";
import { useRouter } from "next/navigation";

const signupHandler = async ({ firstName, lastName, email, password }) => {
  userManagementService.register({firstName, lastName, email, password});
};

const SignupPage = () => {
  const router = useRouter();

  const loginRedirectHandler = async () => router.push("/login");

  return (
    <div>
      <SignupForm
        signupHandler={signupHandler}
        loginRedirectHandler={loginRedirectHandler}
      />
    </div>
  );
};

export default SignupPage;
