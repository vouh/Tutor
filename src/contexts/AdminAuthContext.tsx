import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AdminAuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

function getAllowedEmails() {
  const configured = import.meta.env.VITE_ADMIN_EMAILS;
  return typeof configured === "string"
    ? configured.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)
    : [];
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      const allowedEmails = getAllowedEmails();
      if (nextUser && allowedEmails.length > 0 && !allowedEmails.includes((nextUser.email || "").toLowerCase())) {
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AdminAuthContextValue>(() => ({
    user,
    loading,
    login: async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    logout: async () => {
      await signOut(auth);
    },
  }), [loading, user]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
