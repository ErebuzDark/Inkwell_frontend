import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export function useAniListCharacters(title, type = 'MANGA') {
  const isManga = type.toLowerCase() === 'manga';
  const category = isManga ? 'manga' : 'anime';

  return useQuery({
    queryKey: ['characters', title, type],
    queryFn: async () => {
      if (!title) return null;

      try {
        const searchRes = await axios.get(`${JIKAN_BASE_URL}/${category}`, {
          params: { q: title, limit: 1 }
        });

        const malId = searchRes.data?.data?.[0]?.mal_id;
        if (!malId) return [];

        const charRes = await axios.get(`${JIKAN_BASE_URL}/${category}/${malId}/characters`);
        
        return (charRes.data?.data || []).slice(0, 12).map(item => ({
          role: item.role,
          node: {
            id: item.character.mal_id,
            name: { full: item.character.name },
            image: { large: item.character.images?.jpg?.image_url }
          }
        }));
      } catch (err) {
        console.error('Jikan API Error:', err);
        return [];
      }
    },
    enabled: !!title,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCharacterAbout(charId) {
  return useQuery({
    queryKey: ['character-about', charId],
    queryFn: async () => {
      if (!charId) return null;
      const res = await axios.get(`${JIKAN_BASE_URL}/characters/${charId}/full`);
      return res.data?.data;
    },
    enabled: !!charId,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
