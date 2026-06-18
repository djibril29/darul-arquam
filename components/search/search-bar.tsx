"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Hash, Search } from "lucide-react";

export function SearchBar({ placeholder = "Rechercher un nombre... ex: 1026" }: { placeholder?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/search?n=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3"
    >
      <Hash size={18} className="text-muted-foreground flex-shrink-0" />
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        aria-label="Lancer la recherche"
        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40"
      >
        <Search size={15} />
      </button>
    </form>
  );
}
