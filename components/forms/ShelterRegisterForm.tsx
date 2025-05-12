"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import TextInput from "@/components/inputs/TextInput";
import EmailInput from "@/components/inputs/EmailInput";
import PasswordInput from "@/components/inputs/PasswordInput";
import PhoneInput from "@/components/inputs/PhoneInput";

export type ShelterRegisterFormProps = {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
  }) => void;
  className?: string;
  loading?: boolean;
  errorMessage?: string;
};

export default function ShelterRegisterForm({
  onSubmit,
  className = "",
  loading = false,
  errorMessage,
}: ShelterRegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    address?: string;
  }>({});

  const isFormValid =
    name.trim() !== "" &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6 &&
    /^(\+62|0)8[1-9][0-9]{6,12}$/.test(phoneNumber) &&
    address.trim() !== "";

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Please enter a valid email.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!phoneNumber.trim() || !/^(\+62|0)8[1-9][0-9]{6,12}$/.test(phoneNumber))
      newErrors.phoneNumber = "Please enter a valid Indonesian phone number.";
    if (!address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && !loading) {
      onSubmit({ name, email, password, phoneNumber, address });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {errorMessage && (
        <p className="mb-2 text-center text-sm text-red-600">{errorMessage}</p>
      )}
      <TextInput
        label="Full Name"
        value={name}
        onChange={setName}
        onBlur={validate}
        errorMessage={errors.name}
        placeholder="Your full name"
        required
        disabled={loading}
      />
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
      <PhoneInput
        value={phoneNumber}
        onChange={setPhoneNumber}
        onBlur={validate}
        error={errors.phoneNumber}
        disabled={loading}
      />
      <TextInput
        label="Address"
        value={address}
        onChange={setAddress}
        onBlur={validate}
        errorMessage={errors.address}
        placeholder="Your address"
        required
        disabled={loading}
      />
      <button
        type="submit"
        disabled={!isFormValid || loading}
        className="bg-lime-green hover:bg-lime-green/90 mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 font-semibold text-black transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300"
      >
        {loading ? (
          <Icon icon="mdi:loading" className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Icon icon="mdi:account-plus" className="mr-2 h-5 w-5" />
        )}
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
