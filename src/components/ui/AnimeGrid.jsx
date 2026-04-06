import AnimeCard from './AnimeCard.jsx';

export default function AnimeGrid({ animeList }) {
  if (!animeList || animeList.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {animeList.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
