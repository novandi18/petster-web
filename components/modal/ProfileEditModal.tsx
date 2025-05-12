"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Icon } from "@iconify/react";
import TextInput from "@/components/inputs/TextInput";
import PhoneInput from "@/components/inputs/PhoneInput";

export type ProfileEditModalProps = {
  isOpen: boolean;
  initialName: string;
  initialAddress: string;
  initialPhone: string;
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSave: (data: {
    name: string;
    address: string;
    phoneNumber: string;
  }) => void;
};

export default function ProfileEditModal({
  isOpen,
  initialName,
  initialAddress,
  initialPhone,
  loading = false,
  errorMessage,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const [name, setName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setAddress(initialAddress);
      setPhoneNumber(initialPhone);
    }
  }, [isOpen, initialName, initialAddress, initialPhone]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loading) {
      onSave({ name, address, phoneNumber });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Edit Profile
        </h2>

        {errorMessage && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <TextInput
          label="Full Name"
          value={name}
          onChange={setName}
          required
          disabled={loading}
          className="mb-4"
        />

        <PhoneInput
          value={phoneNumber}
          onChange={setPhoneNumber}
          required
          disabled={loading}
          className="mb-4"
        />

        <TextInput
          label="Address"
          value={address}
          onChange={setAddress}
          required
          disabled={loading}
          className="mb-6"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-lime-green hover:bg-lime-green/90 inline-flex cursor-pointer items-center rounded-lg px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading && (
              <Icon icon="mdi:loading" className="mr-2 h-5 w-5 animate-spin" />
            )}
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
