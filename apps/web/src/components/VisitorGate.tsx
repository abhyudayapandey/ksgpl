"use client";

import { useState } from "react";
import { isValidCountryCode, isValidEmail, isValidPhoneNumber } from "@ksgpl/shared";
import { useVisitor, type VisitorFormInput } from "@/lib/useVisitor";

function NewUserForm({
  form,
  setForm,
  onSwitchToExisting,
}: {
  form: VisitorFormInput;
  setForm: (form: VisitorFormInput) => void;
  onSwitchToExisting: () => void;
}) {
  const { submit } = useVisitor();
  const [errors, setErrors] = useState<Partial<Record<keyof VisitorFormInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const next: Partial<Record<keyof VisitorFormInput, string>> = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.companyName.trim()) next.companyName = "Required";
    if (!isValidCountryCode(form.phoneCountryCode)) next.phoneCountryCode = "e.g. +91";
    if (!isValidPhoneNumber(form.phoneNumber)) next.phoneNumber = "Enter a valid phone number";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submit(form);
    } catch (err: any) {
      setSubmitError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
        {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Company name
        <input
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
        {errors.companyName && <span className="text-xs text-red-600">{errors.companyName}</span>}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone number
        <div className="flex gap-2">
          <input
            value={form.phoneCountryCode}
            onChange={(e) => setForm({ ...form, phoneCountryCode: e.target.value })}
            placeholder="+91"
            className="border rounded-md px-3 py-2 w-20"
          />
          <input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.replace(/[^\d]/g, "") })}
            inputMode="numeric"
            placeholder="9876543210"
            className="border rounded-md px-3 py-2 flex-1"
          />
        </div>
        {(errors.phoneCountryCode || errors.phoneNumber) && (
          <span className="text-xs text-red-600">{errors.phoneCountryCode ?? errors.phoneNumber}</span>
        )}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
        {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
      </label>
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand text-white rounded-md px-4 py-2 font-medium disabled:opacity-50 mt-1"
      >
        {submitting ? "Please wait…" : "View Catalog"}
      </button>
      <button
        type="button"
        onClick={onSwitchToExisting}
        className="text-sm text-brand-dark underline self-start"
      >
        Existing user?
      </button>
    </form>
  );
}

function ExistingUserForm({
  onSwitchToNew,
  onNotFound,
}: {
  onSwitchToNew: () => void;
  onNotFound: (email: string) => void;
}) {
  const { lookupExisting, submit } = useVisitor();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Enter a valid email");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const found = await lookupExisting(email);
      if (!found) {
        onNotFound(email);
        return;
      }
      await submit({
        name: found.name,
        companyName: found.company_name,
        phoneCountryCode: found.phone_country_code,
        phoneNumber: found.phone_number,
        email,
      });
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md px-3 py-2"
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand text-white rounded-md px-4 py-2 font-medium disabled:opacity-50 mt-1"
      >
        {submitting ? "Please wait…" : "Continue"}
      </button>
      <button type="button" onClick={onSwitchToNew} className="text-sm text-brand-dark underline self-start">
        New here? Enter your details
      </button>
    </form>
  );
}

export function VisitorGate() {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<VisitorFormInput>({
    name: "",
    companyName: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    email: "",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">KSGPL Catalog</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {mode === "new"
              ? "Tell us a bit about yourself to view the product catalog."
              : "Enter the email you used before to continue."}
          </p>
        </div>
        {notice && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
            {notice}
          </p>
        )}
        {mode === "new" ? (
          <NewUserForm
            form={form}
            setForm={setForm}
            onSwitchToExisting={() => {
              setNotice(null);
              setMode("existing");
            }}
          />
        ) : (
          <ExistingUserForm
            onSwitchToNew={() => {
              setNotice(null);
              setMode("new");
            }}
            onNotFound={(email) => {
              setForm((f) => ({ ...f, email }));
              setNotice("We don't recognize that email yet. Please fill in your details below.");
              setMode("new");
            }}
          />
        )}
      </div>
    </div>
  );
}
