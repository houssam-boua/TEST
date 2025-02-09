import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ErrorAlert, SuccessAlert } from "../components/shared/Alerts";
import { getUserData, login } from "../api/api";
import { Loading } from "../components/common/Loading";
import "../index.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordShowed, setIsPasswordShowed] = useState("password");
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => {
    setIsPasswordShowed(prev => prev === "password" ? "text" : "password");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setIsError(true);
      setMessage("Please fill all the fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(email, password);
      setIsError(false);
      setMessage("Login successful");
      setIsSuccess(true);

      const userData = getUserData();
      if (userData.password_confirmation === "0") {
        navigate(`/confirm-password/${userData.id}`);
      } else {
        navigate(location.state?.from || "/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsError(true);
      setMessage("Invalid credentials or login error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side */}
      <div className="w-1/2 bg-white p-8 flex flex-col">
        <div className="mb-8">
          <img src="/Logo.svg" alt="GED" className="w-[200px]" />
        </div>
        <div className="flex-grow flex flex-col items-center justify-center">
          <img 
            src="/loginIllustration.png" 
            alt="Login illustration" 
            className="w-[400px] mb-8"
          />
          <h1 className="text-[#0066CC] text-3xl font-bold text-center">
            Bienvenue dans Votre espace<br />documentaire intelligent
          </h1>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-1/2 bg-secondary flex items-center justify-center p-16">
        <div className="w-full max-w-md">
          <h2 className="text-[#0066CC] text-3xl font-bold mb-12 text-center">CONNEXION</h2>
          <form className="space-y-8" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="relative">
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 bg-transparent border-secondary-content border-2 rounded-lg text-secondary-text focus:outline-none"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            {/* Password Field */}
<div className="relative">
  <input
    id="password"
    type={isPasswordShowed}
    className="w-full px-4 py-3 bg-transparent border-secondary-content border-2 rounded-lg text-gray-700 focus:outline-none"
    placeholder="Mot de passe"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <button
    type="button"
    onClick={togglePassword}
    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost"
  >
    {isPasswordShowed === "password" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      </svg>
    )}
  </button>
</div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0066CC] text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? <Loading /> : "Se connecter"}
            </button>
          </form>

          {/* Alert Messages */}
          {isError && <ErrorAlert message={message} />}
          {isSuccess && <SuccessAlert message={message} />}
        </div>
      </div>
    </div>
  );
};

export default Login;