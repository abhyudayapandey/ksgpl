"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMyProfile, signInWithPassword, signOut as sharedSignOut, type Profile } from "@ksgpl/shared";
import { getSupabase } from "./supabase";

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    const db = getSupabase();
    const p = await getMyProfile(db);
    setProfile(p);
  }

  useEffect(() => {
    const db = getSupabase();
    refreshProfile().finally(() => setLoading(false));

    const { data: sub } = db.auth.onAuthStateChange(() => {
      refreshProfile();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(email: string, password: string) {
    const db = getSupabase();
    await signInWithPassword(db, email, password);
    await refreshProfile();
  }

  async function signOut() {
    const db = getSupabase();
    await sharedSignOut(db);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ profile, loading, isAdmin: profile?.role === "admin", signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
