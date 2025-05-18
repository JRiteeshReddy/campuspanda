
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import { Action } from "./toast-action";
import { addToRemoveQueue, reducer, toastTimeouts } from "./toast-reducer";
import { Toast, ToastFunction, ToastState, ToasterToast } from "./toast-types";

// Counter for generating unique IDs
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

// Store listeners and state in memory
const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

// Dispatch function to update state and notify listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });

  // Handle side effects for dismiss actions
  if (action.type === "DISMISS_TOAST") {
    const { toastId } = action;
    
    if (toastId) {
      addToRemoveQueue(toastId, dispatch);
    } else {
      memoryState.toasts.forEach((toast) => {
        addToRemoveQueue(toast.id, dispatch);
      });
    }
  }
}

// Hook for accessing toast functionality
export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast: createToast(),
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// Create the toast function with additional methods
function createToast(): ToastFunction {
  const toastFn = ((props: Toast) => {
    const id = props.id || genId();
    
    sonnerToast(props.title as string, {
      description: props.description,
      id,
    });
    
    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
      } as ToasterToast,
    });
  }) as ToastFunction;
  
  // Add success method
  toastFn.success = (message: string, description?: string) => {
    sonnerToast.success(message, { description });
    
    dispatch({
      type: "ADD_TOAST",
      toast: {
        id: genId(),
        title: message,
        description,
        variant: "default",
      } as ToasterToast,
    });
  };
  
  // Add error method
  toastFn.error = (message: string, description?: string) => {
    sonnerToast.error(message, { description });
    
    dispatch({
      type: "ADD_TOAST",
      toast: {
        id: genId(),
        title: message,
        description,
        variant: "destructive",
      } as ToasterToast,
    });
  };
  
  return toastFn;
}

// Export the standalone toast function
export const toast = createToast();

// Export the original sonner toast as an alternative
export const sonnerCompatToast = sonnerToast;
