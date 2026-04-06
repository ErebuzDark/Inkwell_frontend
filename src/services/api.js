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

export const animeApi = {
  list: (params = {}) => api.get('anime', { params }),
  genres: () => api.get('anime/genres'),
  trending: (page = 1) => api.get('anime/trending', { params: { page } }),
  search: (q, page = 1) => api.get('anime/search', { params: { q, page } }),
  detail: (id) => api.get(`anime/info/${id}`),
  watch: (episodeId) => api.get(`anime/watch/${episodeId}`),
};

// Helper for UTF-8 Safe Base64 encoding (window.btoa only supports ASCII)
const safeBtoa = (str) => {
  try {
    return window.btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    console.warn('SafeBtoa failed:', e);
    return '';
  }
};

/**
 * Utility to construct a proxy URL for any media (images, videos, etc.)
 */
export const getProxyUrl = (url, headers = null) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  
  // Resolve host
  let backendBase = import.meta.env.VITE_API_BASE_URL;
  if (!backendBase || backendBase === '/api') {
    backendBase = window.location.origin.replace('5173', '3001');
  }
  
  // Ensure absolute URL for proxy endpoint
  const proxyEndpoint = `${backendBase.replace(/\/$/, '').replace(/\/api$/, '')}/api/proxy`;
  
  // Headers should be base64 encoded for the proxy using safeBtoa for mobile compatibility
  const headersBase64 = headers ? safeBtoa(JSON.stringify(headers)) : '';
  
  return `${proxyEndpoint}?url=${encodeURIComponent(url)}&headers=${headersBase64}`;
};