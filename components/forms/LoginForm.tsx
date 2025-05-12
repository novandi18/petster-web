"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import EmailInput from "../inputs/EmailInput";
import PasswordInput from "../inputs/PasswordInput";

export type LoginFormProps = {
  onSubmit: (data: { email: string; password: string }) => void;
  className?: string;
  loading?: boolean; // <-- baru
  errorMessage?: string; // <-- baru
};

export default function LoginForm({
  onSubmit,
  className = "",
  loading = false,
  errorMessage,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Enter a valid email address.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && !loading) {
      onSubmit({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {errorMessage && (
        <p className="mb-2 text-center text-sm text-red-600">{errorMessage}</p>
      )}
      <EmailInput
        value={email}
        onChange={setEmail}
        onBlur={validate}
        error={errors.email}
        disabled={loading}
      />
      <PasswordInput
        value={password}
        onChange={setPassword}
        onBlur={validate}
        error={errors.password}
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-lime-green hover:bg-lime-green/90 mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl px-4 py-2 font-semibold text-black transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300"
      >
        {loading ? (
          <Icon icon="mdi:loading" className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Icon icon="mdi:login" className="mr-2 h-5 w-5" />
        )}
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
