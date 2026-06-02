import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "./firebase";

export type SearchResultType = "page" | "course";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  snippet: string;
  path: string;
  score: number;
}

const PAGE_INDEX: Omit<SearchResult, "score">[] = [
  {
    id: "page-home",
    type: "page",
    title: "Home",
    snippet: "Discover top learning experiences and featured courses.",
    path: "/",
  },
  {
    id: "page-courses",
    type: "page",
    title: "Courses",
    snippet: "Browse all available courses and learning paths.",
    path: "/courses",
  },
  {
    id: "page-contact",
    type: "page",
    title: "Contact",
    snippet: "Reach support and get help with your learning journey.",
    path: "/contact",
  },
  {
    id: "page-dashboard",
    type: "page",
    title: "Dashboard",
    snippet: "Track progress, enrollments, and completed courses.",
    path: "/dashboard",
  },
  {
    id: "page-terms",
    type: "page",
    title: "Terms",
    snippet: "Read terms and conditions for platform usage.",
    path: "/terms",
  },
  {
    id: "page-privacy",
    type: "page",
    title: "Privacy",
    snippet: "Understand how your data is collected and protected.",
    path: "/privacy",
  },
];

const scoreText = (haystack: string, queryText: string): number => {
  const text = haystack.toLowerCase();
  const queryValue = queryText.toLowerCase().trim();

  if (!queryValue) return 0;
  if (text === queryValue) return 100;
  if (text.startsWith(queryValue)) return 50;
  if (text.includes(queryValue)) return 20;

  const words = queryValue.split(/\s+/).filter(Boolean);
  return words.reduce((acc, word) => (text.includes(word) ? acc + 8 : acc), 0);
};

const rankResult = (title: string, snippet: string, queryText: string): number => {
  return scoreText(title, queryText) * 2 + scoreText(snippet, queryText);
};

const getPageMatches = (queryText: string): SearchResult[] => {
  return PAGE_INDEX.map((item) => {
    const score = rankResult(item.title, item.snippet, queryText);
    return { ...item, score };
  }).filter((item) => item.score > 0);
};

const getCourseMatches = async (queryText: string): Promise<SearchResult[]> => {
  const coursesRef = collection(db, "courses");
  const coursesSnapshot = await getDocs(query(coursesRef, where("isPublished", "==", true), limit(120)));

  return coursesSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .map((course) => {
      const title = String(course.title ?? "");
      const description = String(course.description ?? "");
      const summary = String(course.summary ?? "");
      const instructions = String(course.instructions ?? "");
      const level = String(course.level ?? "");
      const category = String(course.category ?? "");

      const snippet = summary || description || instructions || `Category: ${category}`;
      const score = rankResult(`${title} ${category} ${level}`, `${snippet} ${description} ${instructions}`, queryText);

      if (score === 0) return null;

      return {
        id: `course-${course.id}`,
        type: "course" as const,
        title,
        snippet,
        path: `/course/${course.slug || course.id}`,
        score,
      };
    })
    .filter((item): item is SearchResult => Boolean(item));
};

export const searchContent = async (queryText: string): Promise<SearchResult[]> => {
  const trimmed = queryText.trim();
  if (!trimmed) return [];

  const pageMatches = getPageMatches(trimmed);

  try {
    const courseMatches = await getCourseMatches(trimmed);
    return [...pageMatches, ...courseMatches]
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  } catch {
    // If Firestore fails, still return page-level results.
    return pageMatches.sort((a, b) => b.score - a.score).slice(0, 12);
  }
};
