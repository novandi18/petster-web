import { useState, useEffect, useRef, ReactNode } from "react";
import { Icon } from "@iconify/react";

interface DropdownProps {
  children: ReactNode;
  className?: string;
  iconClassName?: string;
  menuClassName?: string;
}

export default function Dropdown({
  children,
  className = "",
  iconClassName = "",
  menuClassName = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 ${iconClassName}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Icon
          icon="mdi:dots-horizontal"
          className="h-5 w-5"
          aria-hidden="true"
        />
        <span className="sr-only">Open menu</span>
      </button>

      {isOpen && (
        <div
          className={`ring-opacity-5 absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-800 dark:ring-gray-700 ${menuClassName}`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
