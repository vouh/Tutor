import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getCourse, getModules as getAdminModules, type CourseRecord, type ModuleRecord } from "@/lib/adminData";

export type LearnerRecord = {
  id?: string;
  uid: string;
  fullName: string;
  displayName: string;
  email: string;
  age: number;
  hasLaptop: boolean;
  interestReason: string;
  enrolledCourses: string[];
  enrolledAt?: Timestamp;
  paymentsLog: Array<{
    id: string;
    date: Timestamp;
    amount: number;
    status: "paid" | "pending" | "failed";
    note?: string;
  }>;
  sessionToken: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type EnrollmentInput = {
  courseId: string;
  fullName: string;
  email: string;
  password: string;
  age: number;
  hasLaptop: boolean;
  interestReason: string;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createSessionToken() {
  return crypto.randomUUID();
}

function getLearnerRef(email: string) {
  return doc(db, "learners", normalizeEmail(email));
}

async function persistLearnerSession(email: string, token: string) {
  localStorage.setItem("learner_session", JSON.stringify({ email: normalizeEmail(email), token }));
  await updateDoc(getLearnerRef(email), {
    sessionToken: token,
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

async function writeEnrollment(user: User, courseId: string, email: string) {
  await setDoc(doc(db, "enrollments", `${user.uid}_${courseId}`), {
    userId: user.uid,
    userEmail: normalizeEmail(email),
    courseId,
    enrolledAt: serverTimestamp(),
    status: "active",
  }, { merge: true });
}

export async function enrollLearner(input: EnrollmentInput) {
  const email = normalizeEmail(input.email);
  const existingLearner = await getDoc(getLearnerRef(email)).catch(() => null);
  if (existingLearner?.exists()) {
    throw new Error("An account with this email already exists. Please log in.");
  }

  await setPersistence(auth, browserLocalPersistence);
  const credential = await createUserWithEmailAndPassword(auth, email, input.password);
  await updateProfile(credential.user, { displayName: input.fullName.trim() });

  const token = createSessionToken();
  const learnerPayload = {
    uid: credential.user.uid,
    fullName: input.fullName.trim(),
    displayName: input.fullName.trim(),
    email,
    age: Number(input.age),
    hasLaptop: Boolean(input.hasLaptop),
    interestReason: input.interestReason.trim(),
    enrolledCourses: [input.courseId],
    enrolledAt: serverTimestamp(),
    paymentsLog: [],
    sessionToken: token,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await Promise.all([
    setDoc(getLearnerRef(email), learnerPayload),
    setDoc(doc(db, "users", credential.user.uid), {
      uid: credential.user.uid,
      email,
      displayName: input.fullName.trim(),
      name: input.fullName.trim(),
      role: "student",
      enrolledCourses: [input.courseId],
      totalSpent: 0,
      notificationsEnabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    }, { merge: true }),
    writeEnrollment(credential.user, input.courseId, email),
  ]);

  localStorage.setItem("learner_session", JSON.stringify({ email, token }));
  return { user: credential.user, learner: learnerPayload };
}

export async function loginLearner(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const token = createSessionToken();

  const learnerSnapshot = await getDoc(getLearnerRef(email));
  if (!learnerSnapshot.exists()) {
    await setDoc(getLearnerRef(email), {
      uid: credential.user.uid,
      fullName: credential.user.displayName || email.split("@")[0],
      displayName: credential.user.displayName || email.split("@")[0],
      email,
      age: 0,
      hasLaptop: false,
      interestReason: "",
      enrolledCourses: [],
      paymentsLog: [],
      sessionToken: token,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await persistLearnerSession(email, token);
  }

  localStorage.setItem("learner_session", JSON.stringify({ email, token }));
  return credential.user;
}

export async function verifySession() {
  const stored = localStorage.getItem("learner_session");
  if (!stored || !auth.currentUser?.email) return null;

  try {
    const session = JSON.parse(stored) as { email?: string; token?: string };
    const email = normalizeEmail(session.email || auth.currentUser.email || "");
    if (!email || !session.token || normalizeEmail(auth.currentUser.email || "") !== email) return null;
    const snapshot = await getDoc(getLearnerRef(email));
    if (!snapshot.exists()) return null;
    const learner = { id: snapshot.id, ...snapshot.data() } as LearnerRecord;
    return learner.sessionToken === session.token ? learner : null;
  } catch {
    return null;
  }
}

export async function logoutLearner() {
  const stored = localStorage.getItem("learner_session");
  localStorage.removeItem("learner_session");
  if (stored) {
    try {
      const session = JSON.parse(stored) as { email?: string };
      if (session.email) {
        await updateDoc(getLearnerRef(session.email), {
          sessionToken: null,
          updatedAt: serverTimestamp(),
        });
      }
    } catch {
      // Local session cleanup should still continue.
    }
  }
  await signOut(auth);
}

export async function getLearnerByEmail(email: string) {
  const snapshot = await getDoc(getLearnerRef(email));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as LearnerRecord) : null;
}

export async function getEnrolledCourses(learner: LearnerRecord) {
  const courses = await Promise.all((learner.enrolledCourses || []).map((courseId) => getCourse(courseId)));
  return courses.filter(Boolean) as CourseRecord[];
}

export async function getCourseModules(courseId: string): Promise<ModuleRecord[]> {
  return getAdminModules(courseId);
}

export const getModules = getCourseModules;

export async function markModuleComplete(email: string, courseId: string, moduleId: string) {
  await setDoc(doc(db, "learners", normalizeEmail(email), "progress", courseId, "modules", moduleId), {
    completed: true,
    completedAt: serverTimestamp(),
  }, { merge: true });

  if (auth.currentUser?.uid) {
    await setDoc(doc(db, "progress", auth.currentUser.uid, "courses", courseId), {
      completedModuleIds: arrayUnion(moduleId),
      updatedAt: serverTimestamp(),
      userId: auth.currentUser.uid,
      courseId,
    }, { merge: true });
  }
}

export async function getCompletedModuleIds(email: string, courseId: string) {
  const snapshot = await getDocs(query(collection(db, "learners", normalizeEmail(email), "progress", courseId, "modules"), where("completed", "==", true), orderBy("completedAt", "asc")));
  return snapshot.docs.map((document) => document.id);
}
