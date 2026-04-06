import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

// Handle Flutter WebView environment for local data fetching
if (window.location.port === '8080') {
  // Over USB with adb reverse, localhost on phone bridges to localhost on Mac!
  baseUrl = 'http://localhost:3001/api';
}

if (!baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
  baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
}

const api = axios.create({
  baseURL: baseUrl,
  timeout: 20000,
});

// Attach data-source from response header onto the returned data
api.interceptors.response.use(
  (res) => {
    const source = res.headers['x-data-source'];
    const data = res.data;
    if (source && data && typeof data === 'object') {
      data._source = source;
    }
    return data;
  },
  (err) => {
    const message = err.response?.data?.error || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const mangaApi = {
  list: (page = 1) => api.get('manga', { params: { page } }),
  detail: (id) => api.get(`/manga/${id}`),
  latest: () => api.get('/manga/latest'),
  trending: () => api.get('/manga/trending'),
  related: (id) => api.get(`/manga/${id}/related`),
  genres: () => api.get('/manga/genres'),
  ratings: () => api.get('/manga/ratings'),
};

export const chapterApi = {
  pages: (id) => api.get(`chapters/${id}`),
};

export const searchApi = {
  search: (q, filters = {}) => api.get('search', {
    params: {
      q,
      ...filters,
      // Convert arrays to CSV for multi-tag support
      ...(filters.genres && Array.isArray(filters.genres)
        ? { genres: filters.genres.join(',') }
        : {}),
      ...(filters.excludeGenres && Array.isArray(filters.excludeGenres)
        ? { excludeGenres: filters.excludeGenres.join(',') }
        : {}),
    },
  }),
};