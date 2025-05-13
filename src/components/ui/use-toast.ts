
import { useToast as useHookToast, toast as hookToast, sonnerCompatToast as hookSonnerCompatToast } from "@/hooks/use-toast";

export const useToast = useHookToast;
export const toast = hookToast;
export const sonnerCompatToast = hookSonnerCompatToast;

// For backward compatibility
export { useToast, toast, sonnerCompatToast };
