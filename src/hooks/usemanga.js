import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { mangaApi, chapterApi, searchApi } from '../services/api.js';

export function useMangaList() {
  return useInfiniteQuery({
    queryKey: ['manga', 'list'],
    queryFn: ({ pageParam = 1 }) => mangaApi.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
}

export function useMangaDetail(id) {
  return useQuery({
    queryKey: ['manga', 'detail', id],
    queryFn: () => mangaApi.detail(id),
    enabled: !!id,
  });
}

export function useLatestUpdates() {
  return useQuery({
    queryKey: ['manga', 'latest'],
    queryFn: () => mangaApi.latest(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: ['manga', 'trending'],
    queryFn: () => mangaApi.trending(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedManga(id) {
  return useQuery({
    queryKey: ['manga', 'related', id],
    queryFn: () => mangaApi.related(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => mangaApi.genres(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useRatings() {
  return useQuery({
    queryKey: ['ratings'],
    queryFn: () => mangaApi.ratings(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useChapterPages(chapterId) {
  return useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => chapterApi.pages(chapterId),
    enabled: !!chapterId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSearch(query, filters = {}) {
  const hasQuery = !!(query?.trim() || Object.entries(filters).some(([k, v]) => {
    if (k === 'genres' || k === 'excludeGenres') return Array.isArray(v) && v.length > 0;
    return Boolean(v);
  }));

  return useInfiniteQuery({
    queryKey: ['search', query, filters],
    queryFn: ({ pageParam = 1 }) => searchApi.search(query, { ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    enabled: hasQuery,
    staleTime: 30 * 1000,
  });
}
