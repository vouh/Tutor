import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { searchContent, type SearchResult } from "../lib/search";

const SearchResults = () => {
  const [params] = useSearchParams();
  const queryText = params.get("q")?.trim() ?? "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      if (!queryText) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const nextResults = await searchContent(queryText);
      if (!isCancelled) {
        setResults(nextResults);
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [queryText]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Search Results
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Query: <strong>{queryText || "(empty)"}</strong>
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            {isLoading && (
              <p className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">Searching...</p>
            )}

            {!isLoading && results.length === 0 && (
              <p className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                No results found. Try another keyword.
              </p>
            )}

            {!isLoading && results.map((result) => (
              <Link
                key={result.id}
                to={result.path}
                className="block border-b border-slate-100 dark:border-slate-700 last:border-b-0 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900 dark:text-white">{result.title}</h2>
                  <span className="text-[10px] uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5">
                    {result.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result.snippet}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
