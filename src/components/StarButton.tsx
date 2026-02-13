"use client";

import { Star } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";

interface StarButtonProps {
  companyId: string;
  size?: number;
}

export default function StarButton({ companyId, size = 18 }: StarButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(companyId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(companyId);
      }}
      className="shrink-0 transition-transform hover:scale-110"
      title={active ? "Aus Watchlist entfernen" : "Zur Watchlist hinzufügen"}
    >
      <Star
        size={size}
        className={
          active
            ? "fill-orange text-orange"
            : "fill-none text-muted/40 hover:text-muted"
        }
      />
    </button>
  );
}
