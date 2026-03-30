/**
 * DataSourceBadge — shows whether data came from the scraper or MangaDex.
 * Pass `source` string: 'scraper' | 'mangadex' | undefined
 */
export default function DataSourceBadge({ source }) {
    if (!source) return null;

    const isScraper = source === 'scraper';

    return (
        <span
            title={
                isScraper
                    ? 'Data fetched live from MangaReader.to'
                    : 'Scraper unavailable — served via MangaDex API'
            }
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border
        ${isScraper
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${isScraper ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            {isScraper ? 'Live scrape' : 'MangaDex'}
        </span>
    );
}