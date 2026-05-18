import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logoutLearner } from "@/lib/learnerData";

export type AuthProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string;
  role: "student" | "admin";
  enrolledCourses: string[];
  totalSpent: number;
  notificationsEnabled: boolean;
};

type AuthContextValue = {
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureUserProfile(nextUser: User, phone = "") {
  const userRef = doc(db, "users", nextUser.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: nextUser.uid,
      email: nextUser.email || "",
      displayName: nextUser.displayName || nextUser.email?.split("@")[0] || "Student",
      photoURL: nextUser.photoURL || null,
      phone,
      role: "student",
      enrolledCourses: [],
      totalSpent: 0,
      notificationsEnabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(
    userRef,
    {
      email: nextUser.email || snapshot.data().email || "",
      displayName: nextUser.displayName || snapshot.data().displayName || nextUser.email?.split("@")[0] || "Student",
      photoURL: nextUser.photoURL ?? snapshot.data().photoURL ?? null,
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function mapProfile(user: User | null, data: Record<string, unknown> | null): AuthProfile | null {
  if (!user || !data) return null;

  return {
    uid: user.uid,
    email: String(data.email || user.email || ""),
    displayName: String(data.displayName || user.displayName || user.email?.split("@")[0] || "Student"),
    photoURL: (data.photoURL as string | null | undefined) ?? user.photoURL ?? null,
    phone: String(data.phone || ""),
    role: data.role === "admin" ? "admin" : "student",
    enrolledCourses: Array.isArray(data.enrolledCourses) ? (data.enrolledCourses as string[]) : [],
    totalSpent: Number(data.totalSpent || 0),
    notificationsEnabled: data.notificationsEnabled !== false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void setPersistence(auth, browserLocalPersistence).catch(() => undefined);

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", nextUser.uid);
        const snapshot = await getDoc(userRef);
        if (!snapshot.exists()) {
          await ensureUserProfile(nextUser);
        }
        const latestSnapshot = snapshot.exists() ? snapshot : await getDoc(userRef);
        setProfile(mapProfile(nextUser, latestSnapshot.exists() ? latestSnapshot.data() : null));
      } catch {
        setProfile(
          mapProfile(nextUser, {
            email: nextUser.email,
            displayName: nextUser.displayName,
            photoURL: nextUser.photoURL,
            phone: "",
            role: "student",
            enrolledCourses: [],
            totalSpent: 0,
            notificationsEnabled: true,
          })
        );
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    login: async (email: string, password: string) => {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    signup: async ({ name, email, phone, password }) => {
      await setPersistence(auth, browserLocalPersistence);
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, {
        displayName: name.trim(),
      });
      await ensureUserProfile(credential.user, phone.trim());
      setProfile({
        uid: credential.user.uid,
        email: credential.user.email || email.trim(),
        displayName: name.trim(),
        photoURL: credential.user.photoURL || null,
        phone: phone.trim(),
        role: "student",
        enrolledCourses: [],
        totalSpent: 0,
        notificationsEnabled: true,
      });
    },
    logout: async () => {
      await logoutLearner();
    },
  }), [loading, profile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
