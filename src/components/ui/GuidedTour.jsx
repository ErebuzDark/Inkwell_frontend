import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAppStore } from '../../store/appStore.js';
import { Bot, X, ChevronRight, Check } from 'lucide-react';

// Custom Tooltip with Mascot
const TooltipWithMascot = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}) => {
  return (
    <div
      {...tooltipProps}
      className="bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-2xl shadow-2xl p-4 w-72 sm:w-80 flex gap-4 items-start relative font-body"
    >
      {/* Mascot Icon */}
      <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white shadow-lg shadow-accent/20">
        <Bot size={24} />
      </div>

      <div className="flex-1">
        {/* Title */}
        {step.title && (
          <h3 className="font-display font-bold text-lg text-ink-900 dark:text-ink-100 mb-1">
            {step.title}
          </h3>
        )}

        {/* Content */}
        <p className="text-sm text-ink-600 dark:text-ink-400 mb-4 leading-relaxed">
          {step.content}
        </p>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-mono text-ink-400">
            Step {index + 1}
          </span>
          <div className="flex items-center gap-2">
            {/* Skip / Close */}
            <button
              {...closeProps}
              className="text-xs font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200 transition-colors"
            >
              Skip
            </button>
            {/* Next / Finish */}
            <button
              {...primaryProps}
              className="btn-primary py-1.5 px-3 rounded-md text-xs"
            >
              {isLastStep ? (
                <>
                  Got it <Check size={12} />
                </>
              ) : (
                <>
                  Next <ChevronRight size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GuidedTour() {
  const { hasSeenTour, setHasSeenTour } = useAppStore();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour if the user hasn't seen it and we are on the homepage
    if (!hasSeenTour && window.location.pathname === '/') {
      // Small delay to ensure DOM elements are fully painted
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const steps = [
    {
      target: 'body',
      title: 'Welcome to Inkwell!',
      content: "I'm Inky, your guide. Let me show you around so you can get the best reading experience right from the start.",
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-nav-browse',
      title: 'Explore the Library',
      content: 'Browse our massive collection of manga, manhwa, and manhua. Use powerful filters to find exactly what you want.',
      placement: 'bottom',
    },
    {
      target: '#tour-nav-search',
      title: 'Quick Search',
      content: 'Looking for a specific title? Hit the search bar anywhere to jump straight to it.',
      placement: 'bottom',
    },
    {
      target: '#tour-nav-theme',
      title: 'Read in Comfort',
      content: 'Instantly toggle between beautifully tuned light and true-dark modes to suit your environment.',
      placement: 'bottom-end',
    },
    {
      target: '#tour-latest',
      title: 'Latest Updates',
      content: 'Never miss a chapter. The newest releases from your favorite scanlators appear right here.',
      placement: 'top',
    },
    {
      target: '#tour-trending',
      title: 'Trending Now',
      content: "Discover what the community can't put down. These are the hottest titles of the month.",
      placement: 'top',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setHasSeenTour(true);
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      tooltipComponent={TooltipWithMascot}
      styles={{
        options: {
          zIndex: 10000, // Stay above navbar
          arrowColor: 'var(--color-ink-950)', // Matches tooltip background
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
        }
      }}
    />
  );
}
