import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkIsAdminEmail, createVisitorLead } from "@ksgpl/shared";
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
}

const VisitorContext = createContext<VisitorState | undefined>(undefined);

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitor] = useState<VisitorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setVisitor(JSON.parse(raw));
      })
      .catch(() => {
        // Storage unavailable — just show the gate form again.
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(input: VisitorFormInput) {
    const db = getSupabase();
    await createVisitorLead(db, {
      name: input.name,
      company_name: input.companyName,
      phone_country_code: input.phoneCountryCode,
      phone_number: input.phoneNumber,
      email: input.email,
    });
    const isAdminEmail = await checkIsAdminEmail(db, input.email);
    const full: VisitorInfo = { ...input, isAdminEmail };
    setVisitor(full);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    } catch {
      // Non-fatal — visitor just won't be remembered on next launch.
    }
  }

  return <VisitorContext.Provider value={{ visitor, loading, submit }}>{children}</VisitorContext.Provider>;
}

export function useVisitor(): VisitorState {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error("useVisitor must be used within VisitorProvider");
  return ctx;
}
