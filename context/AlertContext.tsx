"use client";

import AlertToast, { AlertVariant } from "@/components/AlertToast";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AlertContextType {
  showAlert: (message: string, variant?: AlertVariant, icon?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<{
    message: string;
    variant: AlertVariant;
    icon?: string;
    id: number;
    isOpen: boolean;
  } | null>(null);

  const showAlert = (
    message: string,
    variant: AlertVariant = "info",
    icon?: string,
  ) => {
    const id = Date.now();
    setAlert({ message, variant, icon, id, isOpen: true });
  };

  const handleClose = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <AlertToast
          message={alert.message}
          variant={alert.variant}
          icon={alert.icon}
          isOpen={alert.isOpen}
          onClose={handleClose}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
