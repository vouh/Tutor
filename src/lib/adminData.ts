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
export type LessonBlockType = "paragraph" | "html" | "code" | "image" | "pdf" | "video" | "quiz";

export interface CourseRecord {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  summary?: string;
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

export interface LessonRecord {
  id?: string;
  title: string;
  slug?: string;
  order: number;
  type: ModuleType;
  estimatedTime?: number;
  isPreview: boolean;
  moduleId: string;
  courseId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LessonBlockRecord {
  id?: string;
  type: LessonBlockType;
  order: number;
  content?: string;
  language?: string;
  imageUrl?: string;
  fileUrl?: string;
  quizId?: string;
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
  requestedAmount?: number;
  mpesaReceiptNumber: string;
  status: "pending" | "completed" | "confirmed" | "failed";
  paidAt: Timestamp | null;
  checkoutRequestId?: string;
  phoneNumber?: string;
  requestId?: string;
  requestTitle?: string;
  paymentPercentage?: number;
  remainingBalance?: number;
}

export type PaymentRequestPurpose = "course" | "module" | "week" | "custom";

export interface PaymentRequestRecord {
  id?: string;
  title: string;
  message: string;
  amount: number;
  allowedPercentages?: number[];
  audience: "all" | "selected";
  targetUserIds: string[];
  courseId: string;
  courseName?: string;
  moduleId: string;
  moduleName?: string;
  purpose: PaymentRequestPurpose;
  dueDate?: Timestamp | null;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  createdByEmail?: string;
}

export interface UserRecord {
  id?: string;
  uid?: string;
  email?: string;
  fullName?: string;
  displayName?: string;
  name?: string;
  phone?: string;
  location?: string;
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
  status?: "pending" | "active" | "revoked" | string;
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

export interface ActivityRecord {
  id?: string;
  title: string;
  description: string;
  videoUrl?: string;
  meetUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdByEmail?: string;
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
const paymentRequestsRef = collection(db, "paymentRequests");
const usersRef = collection(db, "users");
const learnersRef = collection(db, "learners");
const notificationsRef = collection(db, "notifications");
const activitiesRef = collection(db, "activities");

function nestedModulesRef(courseId: string) {
  return collection(db, "courses", courseId, "modules");
}

function nestedModuleRef(courseId: string, moduleId: string) {
  return doc(db, "courses", courseId, "modules", moduleId);
}

function lessonsRef(courseId: string, moduleId: string) {
  return collection(db, "courses", courseId, "modules", moduleId, "lessons");
}

function lessonRef(courseId: string, moduleId: string, lessonId: string) {
  return doc(db, "courses", courseId, "modules", moduleId, "lessons", lessonId);
}

function blocksRef(courseId: string, moduleId: string, lessonId: string) {
  return collection(db, "courses", courseId, "modules", moduleId, "lessons", lessonId, "blocks");
}

function createSlug(title: string, fallbackId: string) {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseSlug || "lesson"}-${fallbackId.slice(0, 8)}`;
}

function moduleToBlocks(moduleData: Partial<ModuleRecord>): Array<Omit<LessonBlockRecord, "id" | "createdAt" | "updatedAt">> {
  const blocks: Array<Omit<LessonBlockRecord, "id" | "createdAt" | "updatedAt">> = [];

  if (moduleData.content?.trim()) {
    blocks.push({
      type: "html",
      order: blocks.length + 1,
      content: moduleData.content.trim(),
    });
  }

  if ((moduleData.type === "pdf" || moduleData.type === "video") && moduleData.pdfUrl?.trim()) {
    blocks.push({
      type: moduleData.type,
      order: blocks.length + 1,
      fileUrl: moduleData.pdfUrl.trim(),
    });
  }

  return blocks;
}

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

export async function saveCourse(course: Partial<CourseRecord> & { title: string; description: string; category: string; level: CourseLevel; price: number; isFree: boolean; isPublished: boolean; thumbnailUrl: string; moduleCount: number; summary?: string; instructions?: string; publishedAt?: Timestamp | Date | string | null; }) {
  const courseId = course.id || doc(coursesRef).id;
  const courseRef = doc(db, "courses", courseId);
  const existing = course.id ? await getDoc(courseRef) : null;
  const slug = course.slug || createCourseSlug(course.title, courseId);

  const payload = {
    slug,
    title: course.title,
    description: course.description,
    summary: course.summary || "",
    instructions: course.instructions || "",
    category: course.category,
    level: course.level,
    thumbnailUrl: course.thumbnailUrl || "",
    moduleCount: Number(course.moduleCount || 0),
    price: Number(course.price || 0),
    isFree: Boolean(course.isFree),
    isPublished: Boolean(course.isPublished),
    status: course.isPublished ? "active" : "draft",
    duration: "Self-paced",
    students: 0,
    rating: 4.9,
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
  await Promise.all(modulesSnapshot.docs.map((moduleDocument) => deleteNestedModule(courseId, moduleDocument.id)));
}

export async function toggleCoursePublished(courseId: string, isPublished: boolean) {
  await updateDoc(doc(db, "courses", courseId), {
    isPublished,
    status: isPublished ? "active" : "draft",
    publishedAt: isPublished ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

async function syncCourseModuleCount(courseId: string) {
  const snapshot = await getDocs(query(modulesRef, where("courseId", "==", courseId)));
  await updateDoc(doc(db, "courses", courseId), {
    moduleCount: snapshot.size,
    updatedAt: serverTimestamp(),
  });
}

async function syncNestedModuleFromLegacy(moduleData: ModuleRecord & { id: string }) {
  const primaryLessonId = "primary";
  const nestedRef = nestedModuleRef(moduleData.courseId, moduleData.id);
  const nestedSnapshot = await getDoc(nestedRef);
  const lessonSnapshot = await getDoc(lessonRef(moduleData.courseId, moduleData.id, primaryLessonId));
  const blocksSnapshot = await getDocs(blocksRef(moduleData.courseId, moduleData.id, primaryLessonId));
  const blocks = moduleToBlocks(moduleData);
  const batch = writeBatch(db);

  batch.set(nestedRef, {
    title: moduleData.title,
    description: moduleData.description || "",
    assignment: moduleData.assignment || "",
    type: moduleData.type,
    isFree: Boolean(moduleData.isFree),
    order: Number(moduleData.order || 0),
    sourceModuleId: moduleData.id,
    updatedAt: serverTimestamp(),
    ...(nestedSnapshot.exists() ? {} : { createdAt: serverTimestamp() }),
  }, { merge: true });

  batch.set(lessonRef(moduleData.courseId, moduleData.id, primaryLessonId), {
    title: moduleData.title,
    slug: createSlug(moduleData.title, moduleData.id),
    order: 1,
    type: moduleData.type,
    estimatedTime: 0,
    isPreview: Boolean(moduleData.isFree),
    moduleId: moduleData.id,
    courseId: moduleData.courseId,
    updatedAt: serverTimestamp(),
    ...(lessonSnapshot.exists() ? {} : { createdAt: serverTimestamp() }),
  }, { merge: true });

  blocksSnapshot.forEach((blockDocument) => batch.delete(blockDocument.ref));
  blocks.forEach((block) => {
    const blockDocument = doc(blocksRef(moduleData.courseId, moduleData.id, primaryLessonId));
    batch.set(blockDocument, {
      ...block,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

async function deleteNestedModule(courseId: string, moduleId: string) {
  const nestedLessonSnapshot = await getDocs(lessonsRef(courseId, moduleId));
  const batch = writeBatch(db);

  for (const lessonDocument of nestedLessonSnapshot.docs) {
    const blockSnapshot = await getDocs(blocksRef(courseId, moduleId, lessonDocument.id));
    blockSnapshot.forEach((blockDocument) => batch.delete(blockDocument.ref));
    batch.delete(lessonDocument.ref);
  }

  batch.delete(nestedModuleRef(courseId, moduleId));
  await batch.commit();
}

export async function getModules(courseId?: string) {
  const moduleQuery = courseId
    ? query(modulesRef, where("courseId", "==", courseId), orderBy("order", "asc"))
    : query(modulesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(moduleQuery);
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as ModuleRecord));
}

export async function getCourseModuleOutlines(courseId: string) {
  const snapshot = await getDocs(query(nestedModulesRef(courseId), orderBy("order", "asc")));

  if (snapshot.empty) {
    return getModules(courseId);
  }

  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      title: String(data.title || "Untitled module"),
      description: String(data.description || ""),
      assignment: String(data.assignment || ""),
      type: data.type === "pdf" || data.type === "video" ? data.type : "text",
      courseId,
      order: Number(data.order || 0),
      isFree: Boolean(data.isFree),
      content: "",
      pdfUrl: "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as ModuleRecord;
  });
}

export async function getLessonsForModule(courseId: string, moduleId: string) {
  const snapshot = await getDocs(query(lessonsRef(courseId, moduleId), orderBy("order", "asc")));

  if (!snapshot.empty) {
    return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as LessonRecord));
  }

  const moduleData = await getModule(moduleId);
  if (!moduleData) return [];

  return [{
    id: "primary",
    title: moduleData.title,
    slug: createSlug(moduleData.title, moduleId),
    order: 1,
    type: moduleData.type,
    estimatedTime: 0,
    isPreview: Boolean(moduleData.isFree),
    moduleId,
    courseId,
  }];
}

export async function getLessonBlocks(courseId: string, moduleId: string, lessonId = "primary") {
  const snapshot = await getDocs(query(blocksRef(courseId, moduleId, lessonId), orderBy("order", "asc")));

  if (!snapshot.empty) {
    return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as LessonBlockRecord));
  }

  const moduleData = await getModule(moduleId);
  return moduleData ? moduleToBlocks(moduleData).map((block, index) => ({ id: `legacy-${index + 1}`, ...block })) : [];
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
  await syncNestedModuleFromLegacy({
    id: moduleId,
    ...payload,
  } as ModuleRecord & { id: string });
  await syncCourseModuleCount(moduleData.courseId);
  return moduleId;
}

export async function deleteModule(moduleId: string) {
  const snapshot = await getDoc(doc(db, "modules", moduleId));
  let courseId = "";
  if (snapshot.exists()) {
    const moduleData = snapshot.data() as ModuleRecord;
    courseId = moduleData.courseId;
    if (moduleData.pdfUrl) {
      await deleteStoredFile(moduleData.pdfUrl);
    }
  }
  await deleteDoc(doc(db, "modules", moduleId));
  if (courseId) {
    await deleteNestedModule(courseId, moduleId);
    await syncCourseModuleCount(courseId);
  }
}

export async function reorderModules(courseId: string, orderedModuleIds: string[]) {
  const batch = writeBatch(db);
  orderedModuleIds.forEach((moduleId, index) => {
    batch.update(doc(db, "modules", moduleId), { order: index + 1, updatedAt: serverTimestamp() });
    batch.set(nestedModuleRef(courseId, moduleId), { order: index + 1, updatedAt: serverTimestamp() }, { merge: true });
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
  const enrollmentSnapshot = await getDocs(query(collection(db, "enrollments"), where("userId", "==", userId)));

  const enrolledCourses: UserCourseRecord[] = [];
  for (const enrollmentDocument of enrollmentSnapshot.docs) {
    const enrollmentData = enrollmentDocument.data() as { courseId: string; enrolledAt?: Timestamp | null; appliedAt?: Timestamp | null; status?: string };
    const courseSnapshot = await getDoc(doc(db, "courses", enrollmentData.courseId));
    enrolledCourses.push({
      courseId: enrollmentData.courseId,
      courseName: courseSnapshot.exists() ? String(courseSnapshot.data().title || enrollmentData.courseId) : enrollmentData.courseId,
      enrolledAt: enrollmentData.enrolledAt || enrollmentData.appliedAt || null,
      status: enrollmentData.status || "pending",
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

export async function updateUserProfileRecord(userId: string, updates: Partial<Pick<UserRecord, "displayName" | "fullName" | "name" | "email" | "phone" | "location" | "age">>) {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);
  const currentData = snapshot.exists() ? (snapshot.data() as UserRecord) : null;
  const currentEmail = String(currentData?.email || "").trim().toLowerCase();
  const nextEmail = String(updates.email || currentEmail).trim().toLowerCase();
  const nextName = String(updates.displayName || updates.fullName || updates.name || currentData?.displayName || currentData?.fullName || currentData?.name || "").trim();
  const nextPhone = String(updates.phone || currentData?.phone || "").trim();
  const nextLocation = String(updates.location || currentData?.location || "").trim();

  const payload = {
    ...updates,
    ...(nextName ? { displayName: nextName, fullName: nextName, name: nextName } : {}),
    ...(nextPhone ? { phone: nextPhone } : { phone: "" }),
    ...(nextLocation ? { location: nextLocation } : { location: "" }),
    ...(nextEmail ? { email: nextEmail } : {}),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, payload, { merge: true });

  const learnerEmail = nextEmail || currentEmail;
  if (learnerEmail) {
    await setDoc(
      doc(db, "learners", learnerEmail),
      {
        email: learnerEmail,
        ...(nextName ? { displayName: nextName, fullName: nextName, name: nextName } : {}),
        ...(nextPhone ? { phone: nextPhone } : { phone: "" }),
        ...(nextLocation ? { location: nextLocation } : { location: "" }),
        ...(typeof updates.age === "number" ? { age: updates.age } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  if (currentEmail && learnerEmail && currentEmail !== learnerEmail) {
    await deleteDoc(doc(db, "learners", currentEmail)).catch(() => undefined);
  }
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
      approvedAt: serverTimestamp(),
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

export async function deleteNotification(notificationId: string) {
  await deleteDoc(doc(notificationsRef, notificationId));
}

export async function getPayments() {
  const snapshot = await getDocs(query(paymentsRef, orderBy("paidAt", "desc")));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as PaymentRecord));
}

export async function getPaymentRequests() {
  const snapshot = await getDocs(query(paymentRequestsRef, orderBy("createdAt", "desc")));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as PaymentRequestRecord));
}

export async function createPaymentRequest(request: Omit<PaymentRequestRecord, "id" | "createdAt" | "updatedAt">) {
  return addDoc(paymentRequestsRef, {
    ...request,
    amount: Number(request.amount || 0),
    allowedPercentages: Array.isArray(request.allowedPercentages) && request.allowedPercentages.length > 0 ? request.allowedPercentages : [25, 50, 75, 100],
    targetUserIds: request.audience === "selected" ? request.targetUserIds : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updatePaymentRequestStatus(requestId: string, isActive: boolean) {
  await updateDoc(doc(paymentRequestsRef, requestId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePaymentRequest(requestId: string) {
  await deleteDoc(doc(paymentRequestsRef, requestId));
}

export async function getPaymentForModule(userId: string, courseId: string, moduleId: string) {
  const snapshot = await getDocs(
    query(
      paymentsRef,
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      where("moduleId", "==", moduleId),
      where("status", "in", ["completed", "confirmed"])
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
      where("status", "in", ["completed", "confirmed"])
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
  const completedPayments = payments.filter((payment) => payment.status === "completed" || payment.status === "confirmed");
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

export async function getActivities() {
  const snapshot = await getDocs(query(activitiesRef, orderBy("createdAt", "desc")));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as ActivityRecord));
}

export async function saveActivity(activity: Partial<ActivityRecord> & { title: string; description: string; }) {
  const activityId = activity.id || doc(activitiesRef).id;
  const activityDocRef = doc(db, "activities", activityId);
  const existing = activity.id ? await getDoc(activityDocRef) : null;

  const payload = {
    title: activity.title,
    description: activity.description,
    videoUrl: activity.videoUrl || "",
    meetUrl: activity.meetUrl || "",
    updatedAt: serverTimestamp(),
    createdByEmail: activity.createdByEmail || "",
  };

  await setDoc(activityDocRef, existing?.exists() ? payload : {
    ...payload,
    createdAt: serverTimestamp(),
  }, { merge: true });
  
  return activityId;
}

export async function deleteActivity(activityId: string) {
  await deleteDoc(doc(activitiesRef, activityId));
}
