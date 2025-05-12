"use client";

import React, { useState, FormEvent } from "react";
import { Icon } from "@iconify/react";
import PasswordInput from "../inputs/PasswordInput";

export type ReAuthModalProps = {
  isOpen: boolean;
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onReauthenticate: (password: string) => void;
};

export default function ReAuthModal({
  isOpen,
  loading = false,
  errorMessage,
  onClose,
  onReauthenticate,
}: ReAuthModalProps) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loading) {
      onReauthenticate(password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Please re-authenticate
        </h2>

        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <PasswordInput
          value={password}
          onChange={setPassword}
          required
          disabled={loading}
          className="mt-2"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-lime-green hover:bg-lime-green/90 inline-flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading && (
              <Icon icon="mdi:loading" className="mr-2 h-5 w-5 animate-spin" />
            )}
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}
