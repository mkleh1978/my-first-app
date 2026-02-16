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
  bulkAddFavorites: (companyIds: string[]) => Promise<number>;
  isFavorite: (companyId: string) => boolean;
  count: number;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: new Set(),
  toggleFavorite: () => {},
  bulkAddFavorites: async () => 0,
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

  const bulkAddFavorites = useCallback(
    async (companyIds: string[]): Promise<number> => {
      if (!user || companyIds.length === 0) return 0;

      const newIds = companyIds.filter((id) => !favoriteIds.has(id));
      if (newIds.length === 0) return 0;

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        for (const id of newIds) next.add(id);
        return next;
      });

      // Upsert in batches (Supabase max ~500 rows per insert)
      const BATCH = 500;
      let addedCount = 0;

      for (let i = 0; i < newIds.length; i += BATCH) {
        const batch = newIds.slice(i, i + BATCH).map((company_id) => ({
          user_id: user.id,
          company_id,
        }));

        const { error } = await supabase
          .from("watchlist")
          .upsert(batch, { onConflict: "user_id,company_id" });

        if (error) {
          // Revert on error
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            for (const id of newIds) next.delete(id);
            return next;
          });
          throw new Error(error.message);
        }

        addedCount += batch.length;
      }

      return addedCount;
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
        bulkAddFavorites,
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
