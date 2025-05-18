
import React from "react";

export interface Toast {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

export type ToastFunction = ((props: Toast) => void) & {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
};
