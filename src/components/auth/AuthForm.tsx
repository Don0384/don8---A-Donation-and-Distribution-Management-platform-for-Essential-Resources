
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  isLogin: boolean;
  isLoading: boolean;
  formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    adminCode?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isDonor: boolean;
  isAdmin: boolean;
  title: string;
}

const AuthForm = ({
  isLogin,
  isLoading,
  formData,
  handleChange,
  handleSubmit,
  isDonor,
  isAdmin,
  title
}: AuthFormProps) => {
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address <span className="text-red-500">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password <span className="text-red-500">*</span>
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1"
        />
      </div>

      {!isLogin && (
        <>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Admin verification code field - only shown for admin signup */}
          {isAdmin && (
            <div>
              <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700">
                Admin Verification Code <span className="text-red-500">*</span>
              </label>
              <Input
                id="adminCode"
                name="adminCode"
                type="password"
                value={formData.adminCode || ""}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="Enter admin verification code"
              />
            </div>
          )}
        </>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${
          isAdmin
            ? "bg-gray-800 hover:bg-gray-900 focus:ring-gray-800"
            : isDonor
              ? "bg-donor-primary hover:bg-donor-hover focus:ring-donor-primary"
              : "bg-receiver-primary hover:bg-receiver-hover focus:ring-receiver-primary"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isLogin ? "Logging in..." : "Signing up..."}
          </>
        ) : (
          <>{isLogin ? "Login" : "Sign up"}</>
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
