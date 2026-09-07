"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  checkIsAdminEmail,
  createVisitorLead,
  getVisitorLeadByEmail,
  type ExistingVisitorLead,
} from "@ksgpl/shared";
import { getSupabase } from "./supabase";

const STORAGE_KEY = "ksgpl_visitor";

export interface VisitorFormInput {
  name: string;
  companyName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
}

export interface VisitorInfo extends VisitorFormInput {
  isAdminEmail: boolean;
}

interface VisitorState {
  visitor: VisitorInfo | null;
  loading: boolean;
  submit: (input: VisitorFormInput) => Promise<void>;
  lookupExisting: (email: string) => Promise<ExistingVisitorLead | null>;
  signOut: () => void;
}

const VisitorContext = createContext<VisitorState | undefined>(undefined);

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitor] = useState<VisitorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setVisitor(JSON.parse(raw));
    } catch {
      // localStorage unavailable — just show the gate form again.
    }
    setLoading(false);
  }, []);

  async function submit(input: VisitorFormInput) {
    const db = getSupabase();
    const email = input.email.trim().toLowerCase();
    await createVisitorLead(db, {
      name: input.name,
      company_name: input.companyName,
      phone_country_code: input.phoneCountryCode,
      phone_number: input.phoneNumber,
      email,
    });
    const isAdminEmail = await checkIsAdminEmail(db, email);
    const full: VisitorInfo = { ...input, email, isAdminEmail };
    setVisitor(full);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    } catch {
      // Non-fatal — visitor just won't be remembered on next visit.
    }
  }

  async function lookupExisting(email: string): Promise<ExistingVisitorLead | null> {
    const db = getSupabase();
    return getVisitorLeadByEmail(db, email.trim().toLowerCase());
  }

  function signOut() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Non-fatal.
    }
    setVisitor(null);
  }

  return (
    <VisitorContext.Provider value={{ visitor, loading, submit, lookupExisting, signOut }}>
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor(): VisitorState {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error("useVisitor must be used within VisitorProvider");
  return ctx;
}
