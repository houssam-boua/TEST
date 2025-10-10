import React from "react";
import { LoginForm } from "../components/forms/login-form";

const LoginPage = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/5">
      <div className="w-full max-w-lg">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
