"use client";

import LoginForm from "@/components/LoginForm";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  async function signupRedirectHandler() {
    router.push("/signup");
  }
  return (
    <div>
      <LoginForm signupRedirectHandler={signupRedirectHandler} />
    </div>
  );
};

export default LoginPage;
