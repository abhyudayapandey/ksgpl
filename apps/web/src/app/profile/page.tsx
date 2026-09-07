"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useVisitor } from "@/lib/useVisitor";

export default function ProfilePage() {
  const { visitor, signOut: visitorSignOut } = useVisitor();
  const { profile, signOut: authSignOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    if (profile) {
      await authSignOut();
    }
    visitorSignOut();
    router.push("/catalog");
  }

  if (!visitor) return null;

  return (
    <div className="max-w-sm mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Your details</h1>

      <div className="flex flex-col gap-3">
        <div>
          <div className="text-xs text-neutral-500">Name</div>
          <div className="text-neutral-900">{visitor.name}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Company name</div>
          <div className="text-neutral-900">{visitor.companyName}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Phone number</div>
          <div className="text-neutral-900">
            {visitor.phoneCountryCode} {visitor.phoneNumber}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Email</div>
          <div className="text-neutral-900">{visitor.email}</div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="self-start bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md px-4 py-2 text-sm font-medium mt-2"
      >
        Sign out
      </button>
    </div>
  );
}
