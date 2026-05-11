import { useState } from 'react';
import { Modal, Spin, Typography } from 'antd';
import { useAniListCharacters, useCharacterAbout } from '../../hooks/useAniList';
import { User, Info, ExternalLink } from 'lucide-react';

const { Paragraph, Title, Text } = Typography;

export default function CharacterSection({ title, type = 'MANGA' }) {
  const { data: characters, isLoading, isError } = useAniListCharacters(title, type);
  const [selectedCharId, setSelectedCharId] = useState(null);
  const { data: detail, isLoading: isDetailLoading } = useCharacterAbout(selectedCharId);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-ink-200 dark:bg-ink-800 rounded-lg" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shrink-0 space-y-2">
              <div className="w-24 h-32 bg-ink-200 dark:bg-ink-800 rounded-xl" />
              <div className="h-3 w-20 bg-ink-100 dark:bg-ink-900 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !characters || characters.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-ink-900 dark:text-ink-50 flex items-center gap-2">
          <User size={20} className="text-accent" />
          Characters
        </h2>
        <span className="text-xs font-mono text-ink-400 dark:text-ink-500 uppercase tracking-widest">
          via MyAnimeList
        </span>
      </div>

      <div className="relative group">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {characters.map(({ node, role }) => (
            <div
              key={node.id}
              className="shrink-0 w-28 group/char cursor-pointer"
              onClick={() => setSelectedCharId(node.id)}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 shadow-sm group-hover/char:shadow-xl group-hover/char:-translate-y-1 transition-all duration-300">
                <img
                  src={node.image.large}
                  alt={node.name.full}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/char:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 group-hover/char:opacity-100 transition-opacity duration-300 flex items-end p-2">
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter truncate">
                    {role}
                  </span>
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <h3 className="text-xs font-bold text-ink-800 dark:text-ink-200 truncate group-hover/char:text-accent transition-colors">
                  {node.name.full}
                </h3>
                <p className="text-[10px] text-ink-400 dark:text-ink-500 font-medium">
                  {role === 'MAIN' ? 'Main' : 'Supporting'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-ink-50 dark:from-ink-950 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity sm:block hidden" />
      </div>

      {/* Character Detail Modal */}
      <Modal
        open={!!selectedCharId}
        onCancel={() => setSelectedCharId(null)}
        footer={null}
        width={700}
        centered
        className="character-modal"
      >
        {isDetailLoading ? (
          <div className="h-96 flex items-center justify-center">
            <Spin size="large" />
          </div>
        ) : detail && (
          <div className="flex flex-col md:flex-row max-h-[80vh] overflow-hidden bg-white dark:bg-ink-950">
            {/* Left/Top: Image */}
            <div className="w-full md:w-56 flex justify-center shrink-0 p-4">
              <img
                src={detail.images?.jpg?.image_url}
                alt={detail.name}
                className="w-auto h-[200px]! rounded-lg overflow-hidden"
              />
            </div>

            {/* Right/Bottom: Info */}
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-ink-950">
              {/* Header (Sticky) */}
              <div className="p-6 pb-4 border-b border-ink-100 dark:border-ink-800 shrink-0">
                <div className="flex items-center justify-between mb-1 pr-8">
                  <Title level={3} className="!m-0 !text-ink-900 dark:!text-ink-50 !font-display !font-black !text-xl">
                    {detail.name}
                  </Title>
                  {detail.url && (
                    <a href={detail.url} target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-accent transition-colors">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                {detail.name_kanji && (
                  <Text className="text-sm text-ink-400 font-medium">{detail.name_kanji}</Text>
                )}
              </div>

              {/* Scrollable Bio */}
              <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-accent">
                    <Info size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Biography</span>
                  </div>

                  <Paragraph
                    className="text-ink-600 dark:text-ink-400 !leading-relaxed font-body whitespace-pre-wrap !text-sm"
                  >
                    {detail.about || "No biography available for this character."}
                  </Paragraph>
                </div>

                {detail.favorites > 0 && (
                  <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                    <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                      MAL Favorites: {detail.favorites.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
