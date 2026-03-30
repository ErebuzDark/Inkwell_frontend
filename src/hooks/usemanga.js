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

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => mangaApi.genres(),
    staleTime: 60 * 60 * 1000,
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

export function useSearch(query, filters) {
  const hasQuery = query?.trim().length > 0 || Object.values(filters || {}).some(Boolean);
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
