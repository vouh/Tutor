# Firestore Schema

## Learners

`/learners/{email}`

The learner document id is the normalized lowercase email address.

```ts
{
  uid: string;
  fullName: string;
  displayName: string;
  email: string;
  age: number;
  hasLaptop: boolean;
  interestReason: string;
  enrolledCourses: string[];
  enrolledAt: Timestamp;
  paymentsLog: Array<{
    id: string;
    date: Timestamp;
    amount: number;
    status: "paid" | "pending" | "failed";
    note?: string;
  }>;
  sessionToken: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

`/learners/{email}/progress/{courseId}/modules/{moduleId}`

```ts
{
  completed: true;
  completedAt: Timestamp;
}
```

## Compatibility Collections

The app also mirrors learner data into existing collections:

`/users/{uid}` stores Firebase Auth profile data and `enrolledCourses`.

`/enrollments/{uid}_{courseId}` stores course access:

```ts
{
  userId: string;
  userEmail: string;
  courseId: string;
  enrolledAt: Timestamp;
  status: "active" | "pending" | "revoked";
}
```

`/courses/{courseId}` and `/modules/{moduleId}` remain the admin-managed course and module collections.
