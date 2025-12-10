import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Course {
  id?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  thumbnailUrl: string;
  contentUrl: string;
  contentType: 'pdf' | 'video';
  students: number;
  rating: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id?: string;
  uid: string;
  email: string;
  name: string;
  phone: string;
  purchasedCourses: string[];
  totalSpent: number;
  createdAt: Timestamp;
}

export interface Transaction {
  id?: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  mpesaCode: string;
  phoneNumber: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
}

// Collection references
const coursesRef = collection(db, 'courses');
const usersRef = collection(db, 'users');
const transactionsRef = collection(db, 'transactions');

// ============ COURSES ============

export const getAllCourses = async (): Promise<Course[]> => {
  const snapshot = await getDocs(query(coursesRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const getActiveCourses = async (): Promise<Course[]> => {
  const q = query(coursesRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const getCoursesByCategory = async (category: string): Promise<Course[]> => {
  const q = query(
    coursesRef, 
    where('status', '==', 'active'),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const docSnap = await getDoc(doc(db, 'courses', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Course;
  }
  return null;
};

export const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(coursesRef, {
    ...course,
    students: 0,
    rating: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateCourse = async (id: string, data: Partial<Course>): Promise<void> => {
  await updateDoc(doc(db, 'courses', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteCourse = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'courses', id));
};

// ============ USERS ============

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(query(usersRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const getUserById = async (id: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, 'users', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
};

export const getUserByUid = async (uid: string): Promise<User | null> => {
  const q = query(usersRef, where('uid', '==', uid), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }
  return null;
};

export const createUser = async (user: Omit<User, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(usersRef, {
    ...user,
    purchasedCourses: [],
    totalSpent: 0,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, 'users', id), data);
};

export const addPurchasedCourse = async (userId: string, courseId: string, amount: number): Promise<void> => {
  const user = await getUserById(userId);
  if (user) {
    await updateDoc(doc(db, 'users', userId), {
      purchasedCourses: [...user.purchasedCourses, courseId],
      totalSpent: user.totalSpent + amount,
    });
  }
};

// ============ TRANSACTIONS ============

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const snapshot = await getDocs(query(transactionsRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
};

export const getRecentTransactions = async (count: number = 10): Promise<Transaction[]> => {
  const q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
};

export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
  const q = query(transactionsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(transactionsRef, {
    ...transaction,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateTransactionStatus = async (id: string, status: Transaction['status']): Promise<void> => {
  await updateDoc(doc(db, 'transactions', id), { status });
};

// ============ STATS ============

export const getDashboardStats = async () => {
  const [courses, users, transactions] = await Promise.all([
    getAllCourses(),
    getAllUsers(),
    getAllTransactions(),
  ]);

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthTransactions = transactions.filter(t => {
    const now = new Date();
    const txnDate = t.createdAt.toDate();
    return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
  });

  const thisMonthRevenue = thisMonthTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalRevenue,
    thisMonthRevenue,
    totalUsers: users.length,
    totalCourses: courses.filter(c => c.status === 'active').length,
    recentTransactions: transactions.slice(0, 10),
  };
};
