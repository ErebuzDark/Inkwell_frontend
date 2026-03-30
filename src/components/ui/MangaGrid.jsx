import MangaCard from './MangaCard.jsx';

export default function MangaGrid({ titles = [], columns = 'default' }) {
  const colClass =
    columns === 'compact'
      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';

  return (
    <div className={`grid ${colClass}`}>
      {titles.map((manga) => (
        <MangaCard key={manga.id} manga={manga} />
      ))}
    </div>
  );
}
