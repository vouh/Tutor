import React, { useEffect, useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchContent, type SearchResult } from "../lib/search";

interface SiteSearchProps {
  placeholder?: string;
  className?: string;
  darkMode?: boolean;
}

const SiteSearch = ({
  placeholder = "Search courses and pages...",
  className = "",
  darkMode = false,
}: SiteSearchProps) => {
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;
    const value = queryText.trim();

    if (!value) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = window.setTimeout(async () => {
      const nextResults = await searchContent(value);
      if (!isCancelled) {
        setResults(nextResults);
        setIsLoading(false);
      }
    }, 220);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [queryText]);

  const hasQuery = queryText.trim().length > 0;
  const showDropdown = isFocused && hasQuery;

  const inputClassName = useMemo(() => {
    if (darkMode) {
      return "bg-white/10 border border-white/20 text-white placeholder:text-white/60";
    }

    return "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400";
  }, [darkMode]);

  const dropdownClassName = darkMode
    ? "bg-slate-900/95 border-white/15 text-white"
    : "bg-white border-slate-200 text-slate-900";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = queryText.trim();
    if (!value) return;
    navigate(`/search?q=${encodeURIComponent(value)}`);
    setIsFocused(false);
  };

  const handleResultClick = (path: string) => {
    navigate(path);
    setIsFocused(false);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-center rounded-xl shadow-sm ${inputClassName}`}>
          <Search size={18} className="ml-3 shrink-0 opacity-70" />
          <input
            type="text"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setIsFocused(false), 120);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            className="mr-1.5 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Search
            <ArrowRight size={14} />
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className={`absolute z-[60] mt-2 max-h-80 w-full overflow-y-auto rounded-xl border shadow-2xl ${dropdownClassName}`}>
          {isLoading && (
            <div className="px-4 py-3 text-sm opacity-80">Searching...</div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="px-4 py-3 text-sm opacity-80">
              No matching results found.
            </div>
          )}

          {!isLoading && results.map((result) => (
            <button
              key={result.id}
              type="button"
              onMouseDown={() => handleResultClick(result.path)}
              className="flex w-full flex-col items-start gap-1 border-b border-current/10 px-4 py-3 text-left last:border-b-0 hover:bg-current/10"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>{result.title}</span>
                <span className="rounded bg-current/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide opacity-80">
                  {result.type}
                </span>
              </div>
              <p className="line-clamp-2 text-xs opacity-80">{result.snippet}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SiteSearch;
