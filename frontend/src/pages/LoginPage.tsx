import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { BsEyeSlash } from 'react-icons/bs';
import { colors } from '../theme/colors';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with illustration */}
      <div className="w-1/2 bg-[#EEF5FF] p-12 flex flex-col">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <img src="./Logo.svg" alt="GED Logo" className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold text-[#045DA8]">Gestion</h1>
            <h2 className="text-lg text-[#646A85]">Electronique Documents</h2>
          </div>
        </div>

        {/* Illustration and welcome text */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <img 
            src="./loginIllustration.png" 
            alt="Login Illustration" 
            className="w-[80%] max-w-[500px] mb-8"
          />
          <h3 className="text-2xl font-bold text-[#045DA8] text-center">
            Bienvenue dans Votre espace
            <br />
            documentaire intelligent
          </h3>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-1/2 bg-white p-12 flex items-center justify-center">
        <div className="w-full max-w-[400px]">
          <h2 className="text-3xl font-bold text-[#045DA8] mb-12">CONNEXION</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email input */}
            <div className="relative">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#646A85] text-xl" />
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="Adresse e-mail"
                className="form-input w-full pl-12 pr-4 py-3 rounded-lg bg-[#EEF5FF] border-none focus:ring-2 focus:ring-[#045DA8]/20"
              />
            </div>

            {/* Password input */}
            <div className="relative">
              <RiLockPasswordLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#646A85] text-xl" />
              <input
                {...register('password', { required: true })}
                type="password"
                placeholder="Mot de passe"
                className="form-input w-full pl-12 pr-12 py-3 rounded-lg bg-[#EEF5FF] border-none focus:ring-2 focus:ring-[#045DA8]/20"
              />
              <BsEyeSlash className="absolute right-4 top-1/2 -translate-y-1/2 text-[#646A85] text-xl cursor-pointer" />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#045DA8] text-white font-medium py-3 rounded-lg hover:bg-[#045DA8]/90 transition-colors"
            >
              Se connecter
            </button>

            {/* Forgot password link */}
            <div className="text-center">
              <a href="#" className="text-[#646A85] hover:text-[#045DA8] transition-colors">
                Mot de passe oublié ?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
