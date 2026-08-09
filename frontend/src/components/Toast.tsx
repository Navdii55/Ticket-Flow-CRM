import { Toaster, toast as sonnerToast } from "sonner";

/** Single place that owns toast styling + behaviour for the whole app. */
export function ToastHost() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border bg-card text-card-foreground shadow-elevated",
          description: "text-muted-foreground",
          success: "border-success",
          error: "border-destructive",
        },
      }}
    />
  );
}

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),
  info: (message: string, description?: string) =>
    sonnerToast(message, { description }),
};
