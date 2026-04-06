import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { animeApi } from '../services/api.js';

export function useAnimeList(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['anime', 'list', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await animeApi.list({ ...filters, page: pageParam });
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnimeGenres() {
  return useQuery({
    queryKey: ['anime', 'genres'],
    queryFn: async () => {
      const res = await animeApi.genres();
      return res;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useAnimeTrending(page = 1) {
  return useQuery({
    queryKey: ['anime', 'trending', page],
    queryFn: async () => {
      const res = await animeApi.trending(page);
      return res;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnimeSearch(q) {
  return useInfiniteQuery({
    queryKey: ['anime', 'search', q],
    queryFn: async ({ pageParam = 1 }) => {
      if (!q) return { results: [], currentPage: 1, hasNextPage: false };
      const res = await animeApi.search(q, pageParam);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    enabled: !!q,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnimeDetail(id) {
  return useQuery({
    queryKey: ['anime', 'detail', id],
    queryFn: async () => {
      const res = await animeApi.detail(id);
      return res;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnimeWatch(episodeId) {
  return useQuery({
    queryKey: ['anime', 'watch', episodeId],
    queryFn: async () => {
      const res = await animeApi.watch(episodeId);
      return res;
    },
    enabled: !!episodeId,
    staleTime: 5 * 60 * 1000,
  });
}
