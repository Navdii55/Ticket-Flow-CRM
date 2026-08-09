import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiArrowLeft, FiSend } from "react-icons/fi";

import { toast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import { createTicket } from "@/services/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { CreateTicketPayload } from "@/types";
import { cn } from "@/lib/utils";



type Errors = Partial<Record<keyof CreateTicketPayload, string>>;

const empty: CreateTicketPayload = {
  customerName: "",
  email: "",
  subject: "",
  description: "",
};

function validate(values: CreateTicketPayload): Errors {
  const errors: Errors = {};
  if (!values.customerName.trim()) errors.customerName = "Customer name is required.";
  else if (values.customerName.trim().length < 2)
    errors.customerName = "Please enter at least 2 characters.";

  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";

  if (!values.subject.trim()) errors.subject = "Subject is required.";
  else if (values.subject.trim().length < 5)
    errors.subject = "Subject should be at least 5 characters.";

  if (!values.description.trim()) errors.description = "Description is required.";
  else if (values.description.trim().length < 20)
    errors.description = "Please add at least 20 characters of detail.";

  return errors;
}

const fieldClass = (invalid?: boolean) =>
  cn(
    "w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus:ring-2",
    invalid
      ? "border-destructive focus:border-destructive focus:ring-destructive/25"
      : "border-border focus:border-primary focus:ring-ring/25",
  );

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function CreateTicketPage() {
  const navigate = useNavigate();
  usePageMeta(
    "Create Ticket — HelpDesk CRM",
    "Log a new customer support ticket with contact details and issue context.",
  );
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CreateTicketPayload>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (key: keyof CreateTicketPayload, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket created", `${ticket.id} is now in the Open queue.`);
      navigate(`/tickets/${ticket.id}`);
    },
    onError: (error: Error) => {
      toast.error("Could not create ticket", error.message);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    mutation.mutate({
      customerName: values.customerName.trim(),
      email: values.email.trim(),
      subject: values.subject.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <FiArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture the customer's details and what went wrong. It lands in the Open queue.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Customer name" htmlFor="customerName" error={errors.customerName}>
            <input
              id="customerName"
              value={values.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              placeholder="Amelia Hart"
              className={fieldClass(!!errors.customerName)}
            />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="amelia@company.com"
              className={fieldClass(!!errors.email)}
            />
          </Field>
        </div>

        <Field label="Subject" htmlFor="subject" error={errors.subject}>
          <input
            id="subject"
            value={values.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Short summary of the issue"
            className={fieldClass(!!errors.subject)}
          />
        </Field>

        <Field label="Description" htmlFor="description" error={errors.description}>
          <textarea
            id="description"
            rows={6}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What happened, what was expected, and any steps to reproduce…"
            className={cn(fieldClass(!!errors.description), "resize-y")}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {values.description.trim().length} characters
          </p>
        </Field>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="h-11 rounded-xl border border-border px-5 text-sm font-medium transition hover:bg-muted"
          >
            Clear form
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
            ) : (
              <FiSend className="size-4" />
            )}
            {mutation.isPending ? "Submitting…" : "Submit ticket"}
          </button>
        </div>
      </form>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Clear this form?"
        description="Everything you've typed will be discarded."
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="h-10 rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-muted"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={() => {
                setValues(empty);
                setErrors({});
                setConfirmReset(false);
                toast.info("Form cleared");
              }}
              className="h-10 rounded-lg bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition hover:opacity-90"
            >
              Clear form
            </button>
          </>
        }
      />
    </div>
  );
}

export default CreateTicketPage;
