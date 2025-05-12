"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

export type FieldDropdownProps = {
  label: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
};

export default function FieldDropdown({
  label,
  options,
  value,
  onChange,
  required = false,
  className = "",
}: FieldDropdownProps) {
  const [selected, setSelected] = useState<string>(options[0]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && options.includes(value)) {
      setSelected(value);
    }
  }, [value, options]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSelect = (opt: string) => {
    setSelected(opt);
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className={`${className} relative`} ref={ref}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="focus:ring-lime-green mt-1 flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 text-left text-gray-700 focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-black dark:text-white"
      >
        <span>{selected}</span>
        <Icon
          icon="mdi:chevron-down"
          className={`h-5 w-5 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          } text-gray-500 dark:text-gray-400`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-900">
          <ul className="max-h-60 overflow-auto py-1 text-sm text-gray-900 dark:text-gray-200">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className="flex w-full cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
