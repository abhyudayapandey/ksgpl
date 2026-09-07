"use client";

import { useState } from "react";
import { isValidCountryCode, isValidEmail, isValidPhoneNumber } from "@ksgpl/shared";
import { useVisitor, type VisitorFormInput } from "@/lib/useVisitor";

export function VisitorGate() {
  const { submit } = useVisitor();
  const [form, setForm] = useState<VisitorFormInput>({
    name: "",
    companyName: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    email: "",
  });
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">KSGPL Catalog</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Tell us a bit about yourself to view the product catalog.
          </p>
        </div>
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
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value.replace(/[^\d]/g, "") })
                }
                inputMode="numeric"
                placeholder="9876543210"
                className="border rounded-md px-3 py-2 flex-1"
              />
            </div>
            {(errors.phoneCountryCode || errors.phoneNumber) && (
              <span className="text-xs text-red-600">
                {errors.phoneCountryCode ?? errors.phoneNumber}
              </span>
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
        </form>
      </div>
    </div>
  );
}
