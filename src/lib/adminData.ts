import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type ModuleType = "text" | "pdf" | "video";

export interface CourseRecord {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  instructions?: string;
  category: string;
  level: CourseLevel;
  thumbnailUrl: string;
  moduleCount: number;
  price: number;
  isFree: boolean;
  publishedAt: Timestamp | null;
  isPublished: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ModuleRecord {
  id?: string;
  title: string;
  description: string;
  assignment?: string;
  type: ModuleType;
  courseId: string;
  order: number;
  isFree: boolean;
  content: string;
  pdfUrl: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PaymentRecord {
  id?: string;
  userId: string;
  userEmail?: string;
  courseId: string;
  moduleId: string;
  amount: number;
  mpesaReceiptNumber: string;
  status: "pending" | "completed" | "failed";
  paidAt: Timestamp | null;
  checkoutRequestId?: string;
  phoneNumber?: string;
}

export interface UserRecord {
  id?: string;
  uid?: string;
  email?: string;
  fullName?: string;
  displayName?: string;
  name?: string;
  phone?: string;
  age?: number;
  hasLaptop?: boolean;
  interestReason?: string;
  createdAt?: Timestamp;
  enrolledAt?: Timestamp;
  totalSpent?: number;
  enrolledCourses?: string[];
  paymentsLog?: LearnerPaymentEntry[];
  sessionToken?: string | null;
  notificationsEnabled?: boolean;
}

export interface LearnerPaymentEntry {
  id: string;
  date: Timestamp;
  amount: number;
  status: "paid" | "pending" | "failed";
  note?: string;
}

export interface UserCourseRecord {
  courseId: string;
  courseName: string;
  enrolledAt?: Timestamp | null;
  status?: string;
}

export interface UserDetailsRecord extends UserRecord {
  enrolledCourses: UserCourseRecord[];
  certificatesCount: number;
}

export interface NotificationRecord {
  id?: string;
  title: string;
  message: string;
  audience: "all" | "selected";
  targetUserIds: string[];
  createdAt?: Timestamp;
  createdBy?: string;
  createdByEmail?: string;
  expiresAt?: Timestamp | null;
}

export interface CourseProgressRecord {
  id?: string;
  completedModuleIds: string[];
  percentComplete: number;
  updatedAt?: Timestamp;
}

export interface ActivityItem {
  id: string;
  type: "course" | "module" | "user" | "payment";
  title: string;
  subtitle: string;
  timestamp: string;
}

const coursesRef = collection(db, "courses");
const modulesRef = collection(db, "modules");
const paymentsRef = collection(db, "payments");
const usersRef = collection(db, "users");
const learnersRef = collection(db, "learners");
const notificationsRef = collection(db, "notifications");

function createCourseSlug(title: string, courseId: string) {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseSlug || "course"}-${courseId.slice(0, 8)}`;
}

function asDate(value: Timestamp | Date | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

function asTimestamp(value: Timestamp | Date | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  return Timestamp.fromDate(new Date(value));
}

async function uploadFile(file: File, path: string, onProgress?: (progress: number) => void) {
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  return await new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (err) => {
        console.error("[adminData] uploadFile failed", err);
        reject(err);
      },
      async () => {
        resolve(await getDownloadURL(task.snapshot.ref));
      }
    );
  });
}

export async function uploadModulePdf(courseId: string, moduleId: string, file: File, onProgress?: (progress: number) => void) {
  return uploadFile(file, `courses/${courseId}/modules/${moduleId}-${Date.now()}-${file.name}`, onProgress);
}

export async function resizeImageToDataUrl(file: File, maxEdge = 1200, quality = 0.82) {
  const reader = new FileReader();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = dataUrl;
  });

  let { width, height } = image;
  if (width > maxEdge || height > maxEdge) {
    const scale = Math.min(maxEdge / width, maxEdge / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function getCourses() {
  const snapshot = await getDocs(query(coursesRef, orderBy("createdAt", "desc")));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as CourseRecord));
}

export async function getCourse(courseId: string) {
  const snapshot = await getDoc(doc(db, "courses", courseId));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as CourseRecord) : null;
}

export async function saveCourse(course: Partial<CourseRecord> & { title: string; description: string; category: string; level: CourseLevel; price: number; isFree: boolean; isPublished: boolean; thumbnailUrl: string; moduleCount: number; instructions?: string; publishedAt?: Timestamp | Date | string | null; }) {
  const courseId = course.id || doc(coursesRef).id;
  const courseRef = doc(db, "courses", courseId);
  const existing = course.id ? await getDoc(courseRef) : null;
  const slug = course.slug || createCourseSlug(course.title, courseId);

  const payload = {
    slug,
    title: course.title,
    description: course.description,
    instructions: course.instructions || "",
    category: course.category,
    level: course.level,
    thumbnailUrl: course.thumbnailUrl || "",
    moduleCount: Number(course.moduleCount || 0),
    price: Number(course.price || 0),
    isFree: Boolean(course.isFree),
    isPublished: Boolean(course.isPublished),
    publishedAt: course.isPublished ? asTimestamp(course.publishedAt) || serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  };

  await setDoc(courseRef, existing?.exists() ? payload : {
    ...payload,
    createdAt: serverTimestamp(),
  }, { merge: true });
  return courseId;
}

export async function deleteCourse(courseId: string) {
  const courseSnapshot = await getDoc(doc(db, "courses", courseId));
  const courseData = courseSnapshot.exists() ? (courseSnapshot.data() as CourseRecord) : null;
  const modulesSnapshot = await getDocs(query(modulesRef, where("courseId", "==", courseId)));

  await Promise.all([
    courseData?.thumbnailUrl ? deleteStoredFile(courseData.thumbnailUrl) : Promise.resolve(),
    ...modulesSnapshot.docs.map((moduleDocument) => {
      const moduleData = moduleDocument.data() as ModuleRecord;
      return moduleData.pdfUrl ? deleteStoredFile(moduleData.pdfUrl) : Promise.resolve();
    }),
  ]);

  const batch = writeBatch(db);
  batch.delete(doc(db, "courses", courseId));

  modulesSnapshot.forEach((moduleDocument) => batch.delete(moduleDocument.ref));

  const paymentsSnapshot = await getDocs(query(paymentsRef, where("courseId", "==", courseId)));
  paymentsSnapshot.forEach((paymentDocument) => batch.delete(paymentDocument.ref));

  await batch.commit();
}

export async function toggleCoursePublished(courseId: string, isPublished: boolean) {
  await updateDoc(doc(db, "courses", courseId), {
    isPublished,
    publishedAt: isPublished ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

export async function getModules(courseId?: string) {
  const moduleQuery = courseId
    ? query(modulesRef, where("courseId", "==", courseId), orderBy("order", "asc"))
    : query(modulesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(moduleQuery);
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as ModuleRecord));
}

export async function getModule(moduleId: string) {
  const snapshot = await getDoc(doc(db, "modules", moduleId));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as ModuleRecord) : null;
}

export async function saveModule(moduleData: Partial<ModuleRecord> & { title: string; description: string; assignment?: string; type: ModuleType; courseId: string; order: number; isFree: boolean; content: string; pdfUrl: string; }) {
  const moduleId = moduleData.id || doc(modulesRef).id;
  const moduleRef = doc(db, "modules", moduleId);
  const existing = moduleData.id ? await getDoc(moduleRef) : null;

  const payload = {
    title: moduleData.title,
    description: moduleData.description,
    assignment: moduleData.assignment || "",
    type: moduleData.type,
    courseId: moduleData.courseId,
    order: moduleData.order,
    isFree: Boolean(moduleData.isFree),
    content: moduleData.content,
    pdfUrl: moduleData.pdfUrl,
    updatedAt: serverTimestamp(),
  };

  await setDoc(moduleRef, existing?.exists() ? payload : {
    ...payload,
    createdAt: serverTimestamp(),
  }, { merge: true });
  return moduleId;
}

export async function deleteModule(moduleId: string) {
  const snapshot = await getDoc(doc(db, "modules", moduleId));
  if (snapshot.exists()) {
    const moduleData = snapshot.data() as ModuleRecord;
    if (moduleData.pdfUrl) {
      await deleteStoredFile(moduleData.pdfUrl);
    }
  }
  await deleteDoc(doc(db, "modules", moduleId));
}

export async function reorderModules(courseId: string, orderedModuleIds: string[]) {
  const batch = writeBatch(db);
  orderedModuleIds.forEach((moduleId, index) => {
    batch.update(doc(db, "modules", moduleId), { order: index + 1, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

export async function getUsers() {
  const snapshot = await getDocs(query(usersRef, orderBy("createdAt", "desc")));
  const userRecords = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as UserRecord));

  try {
    const learnerSnapshot = await getDocs(query(learnersRef, orderBy("createdAt", "desc")));
    const byEmail = new Map(userRecords.map((user) => [String(user.email || "").toLowerCase(), user]));
    learnerSnapshot.docs.forEach((document) => {
      const learner = { id: document.id, ...document.data() } as UserRecord;
      const existing = byEmail.get(String(learner.email || document.id).toLowerCase());
      if (existing) {
        Object.assign(existing, { ...learner, id: existing.id || learner.id, uid: existing.uid || learner.uid });
      } else {
        userRecords.push(learner);
      }
    });
  } catch {
    // Older deployments may not have a learners collection yet.
  }

  return userRecords;
}

export async function getUserDetails(userId: string): Promise<UserDetailsRecord | null> {
  const userSnapshot = await getDoc(doc(db, "users", userId));
  if (!userSnapshot.exists()) {
    return null;
  }

  const userData = { id: userSnapshot.id, ...userSnapshot.data() } as UserRecord;
  let learnerData: UserRecord | null = null;
  if (userData.email) {
    const learnerSnapshot = await getDoc(doc(db, "learners", userData.email.toLowerCase()));
    learnerData = learnerSnapshot.exists() ? ({ id: learnerSnapshot.id, ...learnerSnapshot.data() } as UserRecord) : null;
  }
  const enrollmentSnapshot = await getDocs(
    query(collection(db, "enrollments"), where("userId", "==", userId), where("status", "==", "active"))
  );

  const enrolledCourses: UserCourseRecord[] = [];
  for (const enrollmentDocument of enrollmentSnapshot.docs) {
    const enrollmentData = enrollmentDocument.data() as { courseId: string; enrolledAt?: Timestamp | null; status?: string };
    const courseSnapshot = await getDoc(doc(db, "courses", enrollmentData.courseId));
    enrolledCourses.push({
      courseId: enrollmentData.courseId,
      courseName: courseSnapshot.exists() ? String(courseSnapshot.data().title || enrollmentData.courseId) : enrollmentData.courseId,
      enrolledAt: enrollmentData.enrolledAt || null,
      status: enrollmentData.status,
    });
  }

  const certificateSnapshot = await getDocs(query(collection(db, "certificates"), where("userId", "==", userId)));

  return {
    ...userData,
    ...learnerData,
    id: userData.id,
    uid: userData.uid || userData.id,
    enrolledCourses,
    certificatesCount: certificateSnapshot.size,
  };
}

export async function deleteUserRecord(user: UserRecord) {
  if (!user.id && !user.email) return;

  const batch = writeBatch(db);
  if (user.id) {
    batch.delete(doc(db, "users", user.id));
    const enrollmentSnapshot = await getDocs(query(collection(db, "enrollments"), where("userId", "==", user.id)));
    enrollmentSnapshot.forEach((enrollmentDocument) => batch.delete(enrollmentDocument.ref));
  }
  if (user.email) {
    batch.delete(doc(db, "learners", user.email.toLowerCase()));
  }
  await batch.commit();
}

export async function addLearnerPayment(email: string, entry: Omit<LearnerPaymentEntry, "id" | "date"> & { date?: Timestamp }) {
  await updateDoc(doc(db, "learners", email.toLowerCase()), {
    paymentsLog: arrayUnion({
      id: crypto.randomUUID(),
      date: entry.date || Timestamp.now(),
      amount: Number(entry.amount || 0),
      status: entry.status,
      note: entry.note || "",
    }),
    updatedAt: serverTimestamp(),
  });
}

export async function grantLearnerCourse(user: UserRecord, courseId: string) {
  if (!user.email) throw new Error("Learner email is required");
  await setDoc(doc(db, "learners", user.email.toLowerCase()), {
    enrolledCourses: arrayUnion(courseId),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  if (user.id) {
    await setDoc(doc(db, "enrollments", `${user.id}_${courseId}`), {
      userId: user.id,
      userEmail: user.email,
      courseId,
      enrolledAt: serverTimestamp(),
      status: "active",
    }, { merge: true });
    await setDoc(doc(db, "users", user.id), {
      enrolledCourses: arrayUnion(courseId),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

export async function revokeLearnerCourse(user: UserRecord, courseId: string) {
  if (!user.email) throw new Error("Learner email is required");
  await setDoc(doc(db, "learners", user.email.toLowerCase()), {
    enrolledCourses: arrayRemove(courseId),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  if (user.id) {
    await setDoc(doc(db, "enrollments", `${user.id}_${courseId}`), {
      status: "revoked",
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(db, "users", user.id), {
      enrolledCourses: arrayRemove(courseId),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

export async function getNotifications() {
  const snapshot = await getDocs(query(notificationsRef, orderBy("createdAt", "desc")));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as NotificationRecord));
}

export async function createNotification(notification: Omit<NotificationRecord, "id" | "createdAt">) {
  return addDoc(notificationsRef, {
    ...notification,
    createdAt: serverTimestamp(),
  });
}

export async function getPayments() {
  const snapshot = await getDocs(query(paymentsRef, orderBy("paidAt", "desc")));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as PaymentRecord));
}

export async function getPaymentForModule(userId: string, courseId: string, moduleId: string) {
  const snapshot = await getDocs(
    query(
      paymentsRef,
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      where("moduleId", "==", moduleId),
      where("status", "==", "completed")
    )
  );

  return snapshot.docs.length > 0 ? ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PaymentRecord) : null;
}

export async function getCoursePayment(userId: string, courseId: string) {
  const snapshot = await getDocs(
    query(
      paymentsRef,
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      where("status", "==", "completed")
    )
  );

  return snapshot.docs.length > 0 ? ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PaymentRecord) : null;
}

export async function savePayment(payment: PaymentRecord) {
  return addDoc(paymentsRef, {
    ...payment,
    paidAt: payment.paidAt || serverTimestamp(),
  });
}

export async function getCourseProgress(userId: string, courseId: string): Promise<CourseProgressRecord | null> {
  const snapshot = await getDoc(doc(db, "progress", userId, "courses", courseId));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as CourseProgressRecord) : null;
}

export async function markModuleComplete(userId: string, courseId: string, moduleId: string, totalModules: number) {
  const progressRef = doc(db, "progress", userId, "courses", courseId);
  const snapshot = await getDoc(progressRef);
  const completedModuleIds = snapshot.exists() ? (snapshot.data().completedModuleIds || []) : [];
  const nextCompleted = Array.from(new Set([...completedModuleIds, moduleId]));
  const percentComplete = totalModules > 0 ? Math.round((nextCompleted.length / totalModules) * 100) : 0;

  await setDoc(progressRef, {
    completedModuleIds: nextCompleted,
    percentComplete,
    updatedAt: serverTimestamp(),
    userId,
    courseId,
  }, { merge: true });
}

export async function getDashboardSummary() {
  const [courses, modules, users, payments] = await Promise.all([getCourses(), getModules(), getUsers(), getPayments()]);
  const completedPayments = payments.filter((payment) => payment.status === "completed");
  const totalRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const activities: ActivityItem[] = [
    ...courses.slice(0, 3).map((course) => ({
      id: `course-${course.id}`,
      type: "course" as const,
      title: course.title,
      subtitle: course.isPublished ? "Published course" : "Draft course",
      timestamp: asDate(course.updatedAt || course.createdAt)?.toLocaleString() || "Just now",
    })),
    ...modules.slice(0, 3).map((module) => ({
      id: `module-${module.id}`,
      type: "module" as const,
      title: module.title,
      subtitle: `${module.type.toUpperCase()} module`,
      timestamp: asDate(module.updatedAt || module.createdAt)?.toLocaleString() || "Just now",
    })),
    ...users.slice(0, 3).map((user) => ({
      id: `user-${user.id}`,
      type: "user" as const,
      title: user.displayName || user.name || user.email || "New user",
      subtitle: user.email || "Registered user",
      timestamp: asDate(user.createdAt)?.toLocaleString() || "Just now",
    })),
    ...completedPayments.slice(0, 3).map((payment) => ({
      id: `payment-${payment.id}`,
      type: "payment" as const,
      title: `KES ${Number(payment.amount || 0).toLocaleString()}`,
      subtitle: payment.mpesaReceiptNumber || "M-Pesa payment",
      timestamp: asDate(payment.paidAt)?.toLocaleString() || "Just now",
    })),
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 10);

  return {
    totalCourses: courses.filter((course) => course.isPublished).length,
    totalModules: modules.length,
    totalUsers: users.length,
    totalRevenue,
    activities,
  };
}

export { asDate };

export async function deleteStoredFile(url: string) {
  if (!url.includes("firebase")) return;
  await deleteObject(ref(storage, url)).catch(() => undefined);
}

export const deleteStoredThumbnail = deleteStoredFile;
