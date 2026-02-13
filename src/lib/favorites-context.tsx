"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface FavoritesContextType {
  favoriteIds: Set<string>;
  toggleFavorite: (companyId: string) => void;
  isFavorite: (companyId: string) => boolean;
  count: number;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: new Set(),
  toggleFavorite: () => {},
  isFavorite: () => false,
  count: 0,
  loading: true,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load favorites when user changes
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    async function loadFavorites() {
      const { data } = await supabase
        .from("watchlist")
        .select("company_id")
        .eq("user_id", user!.id);

      if (data) {
        setFavoriteIds(new Set(data.map((r) => r.company_id)));
      }
      setLoading(false);
    }

    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(
    (companyId: string) => {
      if (!user) return;

      const isCurrentlyFavorite = favoriteIds.has(companyId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFavorite) {
          next.delete(companyId);
        } else {
          next.add(companyId);
        }
        return next;
      });

      // Persist to Supabase
      if (isCurrentlyFavorite) {
        supabase
          .from("watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("company_id", companyId)
          .then(({ error }) => {
            if (error) {
              // Revert on error
              setFavoriteIds((prev) => new Set([...prev, companyId]));
            }
          });
      } else {
        supabase
          .from("watchlist")
          .insert({ user_id: user.id, company_id: companyId })
          .then(({ error }) => {
            if (error) {
              // Revert on error
              setFavoriteIds((prev) => {
                const next = new Set(prev);
                next.delete(companyId);
                return next;
              });
            }
          });
      }
    },
    [user, favoriteIds]
  );

  const isFavorite = useCallback(
    (companyId: string) => favoriteIds.has(companyId),
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        toggleFavorite,
        isFavorite,
        count: favoriteIds.size,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
