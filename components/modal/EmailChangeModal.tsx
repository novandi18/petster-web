"use client";

import React, { useState, FormEvent } from "react";
import { Icon } from "@iconify/react";
import EmailInput from "../inputs/EmailInput";

export type EmailChangeModalProps = {
  isOpen: boolean;
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSave: (newEmail: string) => void;
};

export default function EmailChangeModal({
  isOpen,
  loading = false,
  errorMessage,
  onClose,
  onSave,
}: EmailChangeModalProps) {
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (newEmail !== confirmEmail) {
      setLocalError("Emails do not match");
      return;
    }
    onSave(newEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Change Email Address
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          After saving, you will receive a confirmation email to complete your
          email change, and then you will be logged out.
        </p>

        {(localError || errorMessage) && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {localError || errorMessage}
          </p>
        )}

        <EmailInput
          label="New Email"
          value={newEmail}
          onChange={setNewEmail}
          required
          disabled={loading}
          className="mt-2"
        />
        <EmailInput
          label="Confirm New Email"
          value={confirmEmail}
          onChange={setConfirmEmail}
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
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
