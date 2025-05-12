"use client";

import React, { useState } from "react";

export type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  errorMessage?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  disabled?: boolean;
  className?: string;
};

export default function TextInput({
  label,
  value,
  onChange,
  onBlur,
  errorMessage,
  placeholder = "",
  required = false,
  minLength,
  maxLength,
  pattern,
  disabled = false,
  className = "",
}: TextInputProps) {
  const [error, setError] = useState<string | undefined>(errorMessage);

  const validate = () => {
    if (required && !value) {
      return "This field is required.";
    }
    if (minLength !== undefined && value.length < minLength) {
      return `Minimum length is ${minLength} characters.`;
    }
    if (maxLength !== undefined && value.length > maxLength) {
      return `Maximum length is ${maxLength} characters.`;
    }
    if (pattern && !pattern.test(value)) {
      return "Invalid format.";
    }
    return undefined;
  };

  const handleBlur = () => {
    const msg = validate();
    setError(msg);
    onBlur?.(value);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setError(undefined);
          onChange(e.target.value);
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="focus:ring-lime-green mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:ring focus:outline-none disabled:bg-gray-300 sm:text-sm dark:border-gray-600 dark:bg-black dark:text-white dark:disabled:bg-gray-900"
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern?.source}
        disabled={disabled}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
