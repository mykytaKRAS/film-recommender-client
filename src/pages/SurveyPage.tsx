// src/pages/SurveyPage.tsx
// Нова інтерактивна анкета з 4 кроками

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { genresApi, moviesApi, surveyApi } from '../api';
import type { Genre, MovieSummary } from '../types';
import toast from 'react-hot-toast';

// ── Типи ─────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

interface SurveyState {
  genreWeights:    Record<number, number>;
  movieReactions:  Record<string, 'like' | 'dislike' | 'skip'>;
  language:        string;
  avoidContent:    string[];
  era:             string;
  vibe:            string;
}

// ── Константи ─────────────────────────────────────────────────

const AVOID_OPTIONS = [
  { id: 'horror',    label: 'Horror & jump scares', emoji: '👻' },
  { id: 'violence',  label: 'Extreme violence',     emoji: '💀' },
  { id: 'sad',       label: 'Very sad endings',      emoji: '😢' },
  { id: 'explicit',  label: 'Sexual content',        emoji: '🔞' },
  { id: 'nothing',   label: 'Nothing — I\'m open',   emoji: '✨' },
];

const ERA_OPTIONS = [
  { id: 'classic',  label: 'Classic',   sub: '70s & 80s',      emoji: '🎞' },
  { id: 'nostalgic',label: 'Nostalgic', sub: '90s & 2000s',    emoji: '📼' },
  { id: 'modern',   label: 'Modern',    sub: '2010s — now',    emoji: '🎬' },
  { id: 'any',      label: 'Any era',   sub: 'No preference',  emoji: '🌍' },
];

const VIBE_OPTIONS = [
  { id: 'intellectual', label: 'Intellectual',  sub: 'Mind-bending & thought-provoking', emoji: '🧠' },
  { id: 'entertainment',label: 'Entertainment', sub: 'Fun, exciting, easy to watch',     emoji: '🍿' },
  { id: 'emotional',    label: 'Emotional',     sub: 'Moving & deeply human',            emoji: '❤️' },
  { id: 'intense',      label: 'Intense',       sub: 'Thrilling & suspenseful',          emoji: '😰' },
  { id: 'inspiring',    label: 'Inspiring',     sub: 'Uplifting & meaningful',           emoji: '✨' },
  { id: 'artistic',     label: 'Artistic',      sub: 'Unconventional storytelling',      emoji: '🎭' },
];

const LANG_OPTIONS = [
  { id: 'en', label: 'English',           flag: '🇺🇸' },
  { id: 'any', label: 'Any language',     flag: '🌐' },
  { id: 'foreign', label: 'Foreign films', flag: '🌍' },
];

// Фільми для кроку 2 — представники різних жанрів
const SAMPLE_MOVIE_TITLES = [
  'The Dark Knight', 'Forrest Gump', 'Interstellar',
  'The Grand Budapest Hotel', 'Parasite', 'Spirited Away',
  'The Shawshank Redemption', 'La La Land', 'Saving Private Ryan', 'Joker',
];

// ── Progress Bar ──────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  const steps = ['Genres', 'Movies', 'Preferences', 'Vibe'];
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {steps.map((label, i) => {
          const num   = (i + 1) as Step;
          const done  = step > num;
          const active = step === num;
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done   ? 'bg-indigo-500 text-white'         :
                  active ? 'bg-white text-gray-900 ring-2 ring-indigo-500' :
                           'bg-gray-800 text-gray-500'
                }`}>
                  {done ? '✓' : num}
                </div>
                <span className={`mt-1 text-xs ${active ? 'text-white' : 'text-gray-600'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 transition-all duration-500 ${
                  step > num ? 'bg-indigo-500' : 'bg-gray-800'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Крок 1 — Жанри ───────────────────────────────────────────

function Step1Genres({
  genres,
  weights,
  onChange,
}: {
  genres: Genre[];
  weights: Record<number, number>;
  onChange: (id: number, val: number) => void;
}) {
  const EMOJI: Record<string, string> = {
    'Action': '💥', 'Adventure': '🗺', 'Animation': '🎨',
    'Comedy': '😂', 'Crime': '🔪', 'Documentary': '📽',
    'Drama': '🎭', 'Family': '👨‍👩‍👧', 'Fantasy': '🐉',
    'History': '📜', 'Horror': '👻', 'Music': '🎵',
    'Mystery': '🔍', 'Romance': '💕', 'Science Fiction': '🚀',
    'Thriller': '😱', 'War': '⚔️', 'Western': '🤠',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">What genres excite you?</h2>
      <p className="text-gray-400 text-sm mb-8">
        Tap a genre to select it, or drag the slider to set how much you love it.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {genres.filter(g => g.name !== 'Unknown').map(genre => {
          const w       = weights[genre.id] ?? 0;
          const active  = w > 0;
          const emoji   = EMOJI[genre.name] ?? '🎬';

          return (
            <div
              key={genre.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                active
                  ? 'border-indigo-500 bg-indigo-950/40'
                  : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
              }`}
            >
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => onChange(genre.id, w > 0 ? 0 : 0.7)}
              >
                <span className="text-2xl select-none">{emoji}</span>
                <span className={`font-medium text-sm flex-1 ${active ? 'text-white' : 'text-gray-400'}`}>
                  {genre.name}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  active ? 'border-indigo-400 bg-indigo-500' : 'border-gray-600'
                }`}>
                  {active && <span className="text-white text-xs">✓</span>}
                </div>
              </div>

              {active && (
                <div className="px-4 pb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Like it</span>
                    <span className="text-indigo-400 font-medium">
                      {Math.round(w * 100)}%
                    </span>
                    <span>Love it</span>
                  </div>
                  <input
                    type="range" min="0.1" max="1" step="0.1"
                    value={w}
                    onChange={e => onChange(genre.id, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-gray-600 text-xs mt-4 text-center">
        {Object.values(weights).filter(v => v > 0).length} genres selected
      </p>
    </div>
  );
}

// ── Крок 2 — Оцінювання фільмів ──────────────────────────────

function Step2Movies({
  movies,
  reactions,
  onReact,
}: {
  movies: MovieSummary[];
  reactions: Record<string, 'like' | 'dislike' | 'skip'>;
  onReact: (id: string, r: 'like' | 'dislike' | 'skip') => void;
}) {
  const TMDB = 'https://image.tmdb.org/t/p/w185';
  const PLACEHOLDER = 'https://via.placeholder.com/185x278?text=?';

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Quick reactions</h2>
      <p className="text-gray-400 text-sm mb-8">
        Would you watch these? Your gut feeling is enough — seen it or not.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {movies.map(movie => {
          const reaction = reactions[movie.id];
          const poster   = movie.posterPath ? `${TMDB}${movie.posterPath}` : PLACEHOLDER;

          return (
            <div key={movie.id} className="flex flex-col gap-2">
              <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                reaction === 'like'    ? 'border-green-500 shadow-lg shadow-green-500/20' :
                reaction === 'dislike' ? 'border-red-500 shadow-lg shadow-red-500/20'    :
                                          'border-gray-800'
              }`}>
                <img
                  src={poster}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                />

                {/* Overlay при виборі */}
                {reaction && reaction !== 'skip' && (
                  <div className={`absolute inset-0 flex items-center justify-center text-4xl ${
                    reaction === 'like' ? 'bg-green-500/30' : 'bg-red-500/30'
                  }`}>
                    {reaction === 'like' ? '👍' : '👎'}
                  </div>
                )}
              </div>

              <p className="text-gray-400 text-xs text-center leading-tight truncate" title={movie.title}>
                {movie.title}
              </p>

              {/* Кнопки реакції */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => onReact(movie.id, reaction === 'like' ? 'skip' : 'like')}
                  className={`flex-1 py-1.5 rounded-lg text-sm transition-all ${
                    reaction === 'like'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-green-900/50 hover:text-green-400'
                  }`}
                >
                  👍
                </button>
                <button
                  onClick={() => onReact(movie.id, reaction === 'dislike' ? 'skip' : 'dislike')}
                  className={`flex-1 py-1.5 rounded-lg text-sm transition-all ${
                    reaction === 'dislike'
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-red-900/50 hover:text-red-400'
                  }`}
                >
                  👎
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-gray-600 text-xs mt-6 text-center">
        {Object.values(reactions).filter(r => r !== 'skip').length} / {movies.length} rated
        {Object.values(reactions).filter(r => r !== 'skip').length === 0 && (
          <span className="text-gray-700"> — you can skip this step</span>
        )}
      </p>
    </div>
  );
}

// ── Крок 3 — Preferences ─────────────────────────────────────

function Step3Preferences({
  language,
  avoidContent,
  era,
  onLanguage,
  onAvoid,
  onEra,
}: {
  language: string;
  avoidContent: string[];
  era: string;
  onLanguage: (v: string) => void;
  onAvoid: (v: string) => void;
  onEra: (v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Set your preferences</h2>
        <p className="text-gray-400 text-sm">Help us filter out what you don't want to see.</p>
      </div>

      {/* Мова */}
      <div>
        <p className="text-gray-300 font-medium mb-3 text-sm">Language preference</p>
        <div className="flex gap-3 flex-wrap">
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => onLanguage(opt.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                language === opt.id
                  ? 'border-indigo-500 bg-indigo-950/40 text-white'
                  : 'border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <span>{opt.flag}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Що уникати */}
      <div>
        <p className="text-gray-300 font-medium mb-3 text-sm">Anything you prefer to avoid?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AVOID_OPTIONS.map(opt => {
            const selected = avoidContent.includes(opt.id);
            const isNothing = opt.id === 'nothing';
            return (
              <button
                key={opt.id}
                onClick={() => onAvoid(opt.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  selected
                    ? isNothing
                      ? 'border-green-500 bg-green-950/40 text-white'
                      : 'border-red-500/50 bg-red-950/20 text-white'
                    : 'border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                {opt.label}
                {selected && <span className="ml-auto text-xs opacity-60">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Епоха */}
      <div>
        <p className="text-gray-300 font-medium mb-3 text-sm">What era of cinema?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ERA_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => onEra(opt.id)}
              className={`p-4 rounded-xl border text-center transition-all ${
                era === opt.id
                  ? 'border-indigo-500 bg-indigo-950/40'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">{opt.emoji}</div>
              <div className={`text-sm font-medium ${era === opt.id ? 'text-white' : 'text-gray-400'}`}>
                {opt.label}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Крок 4 — Vibe ─────────────────────────────────────────────

function Step4Vibe({
  vibe,
  onVibe,
}: {
  vibe: string;
  onVibe: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">What's your usual vibe?</h2>
      <p className="text-gray-400 text-sm mb-8">
        What kind of experience are you usually looking for?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VIBE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => onVibe(vibe === opt.id ? '' : opt.id)}
            className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all duration-200 ${
              vibe === opt.id
                ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/10'
                : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
            }`}
          >
            <span className="text-3xl mt-0.5">{opt.emoji}</span>
            <div>
              <div className={`font-semibold text-sm ${vibe === opt.id ? 'text-white' : 'text-gray-300'}`}>
                {opt.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {opt.sub}
              </div>
            </div>
            {vibe === opt.id && (
              <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Головний компонент ────────────────────────────────────────

export function SurveyPage() {
  const navigate  = useNavigate();
  const [step, setStep]       = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [state, setState] = useState<SurveyState>({
    genreWeights:   {},
    movieReactions: {},
    language:       'any',
    avoidContent:   [],
    era:            'any',
    vibe:           '',
  });

  // Завантажуємо жанри
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn:  genresApi.getAll,
  });

  // Завантажуємо фільми для кроку 2
  const { data: sampleMoviesData } = useQuery({
    queryKey: ['sample-movies'],
    queryFn:  async () => {
      const results: MovieSummary[] = [];
      for (const title of SAMPLE_MOVIE_TITLES) {
        const found = await moviesApi.search(title, 1, 1);
        if (found.length > 0) results.push(found[0]);
        if (results.length >= 10) break;
      }
      return results;
    },
  });

  const sampleMovies = sampleMoviesData ?? [];

  // ── Handlers ───────────────────────────────────────────────

  const setGenreWeight = (id: number, val: number) =>
    setState(s => ({ ...s, genreWeights: { ...s.genreWeights, [id]: val } }));

  const setReaction = (id: string, r: 'like' | 'dislike' | 'skip') =>
    setState(s => ({ ...s, movieReactions: { ...s.movieReactions, [id]: r } }));

  const setLanguage = (v: string) =>
    setState(s => ({ ...s, language: v }));

  const toggleAvoid = (v: string) => {
    setState(s => {
      if (v === 'nothing')
        return { ...s, avoidContent: s.avoidContent.includes('nothing') ? [] : ['nothing'] };
      const filtered = s.avoidContent.filter(x => x !== 'nothing');
      return {
        ...s,
        avoidContent: filtered.includes(v)
          ? filtered.filter(x => x !== v)
          : [...filtered, v],
      };
    });
  };

  const setEra  = (v: string) => setState(s => ({ ...s, era: v }));
  const setVibe = (v: string) => setState(s => ({ ...s, vibe: v }));

  // ── Submit ─────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Базові ваги з жанрів (крок 1)
      const weights: Record<number, number> = { ...state.genreWeights };

      // Корекція ваг з реакцій на фільми (крок 2)
      for (const movie of sampleMovies) {
        const reaction = state.movieReactions[movie.id];
        if (!reaction || reaction === 'skip') continue;

        const factor = reaction === 'like' ? 0.3 : -0.2;

        for (const genreName of movie.genres) {
          const genre = genres.find(g => g.name === genreName);
          if (!genre) continue;
          const current = weights[genre.id] ?? 0;
          weights[genre.id] = Math.max(0, Math.min(1, current + factor));
        }
      }

      // Корекція мови
      if (state.language === 'foreign') {
        // Підвищуємо ваги для неанглійських фільмів через внутрішній параметр
        // (зберігаємо як спеціальний ключ якого немає у genre_id)
        // language_preference зберігається як від'ємний id
        weights[-1] = state.language === 'foreign' ? 1 :
                      state.language === 'en'      ? 0 : 0.5;
      }

      // Корекція ери
      if (state.era !== 'any') {
        weights[-2] = ['classic', 'nostalgic', 'modern', 'any'].indexOf(state.era) / 3;
      }

      // Корекція вайбу
      const vibeGenreMap: Record<string, string[]> = {
        intellectual:  ['Science Fiction', 'Mystery', 'Documentary'],
        entertainment: ['Action', 'Comedy', 'Adventure'],
        emotional:     ['Drama', 'Romance'],
        intense:       ['Thriller', 'Horror'],
        inspiring:     ['Drama', 'Family'],
        artistic:      ['Documentary', 'Animation'],
      };

      if (state.vibe && vibeGenreMap[state.vibe]) {
        for (const genreName of vibeGenreMap[state.vibe]) {
          const genre = genres.find(g => g.name === genreName);
          if (!genre) continue;
          weights[genre.id] = Math.min(1, (weights[genre.id] ?? 0) + 0.2);
        }
      }

      // Негативні сигнали з avoidContent
      if (state.avoidContent.includes('horror')) {
        const horror = genres.find(g => g.name === 'Horror');
        if (horror) weights[horror.id] = 0;
      }

      // Відправляємо — favoriteMovieIds з лайків
      const favoriteMovieIds = Object.entries(state.movieReactions)
        .filter(([, r]) => r === 'like')
        .map(([id]) => id);

      await surveyApi.submit(weights, favoriteMovieIds);

      toast.success('Preferences saved! Getting your recommendations...');
      navigate('/recommendations');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return Object.values(state.genreWeights).some(v => v > 0);
    if (step === 2) return true; // крок 2 необов'язковий
    if (step === 3) return state.era !== '';
    if (step === 4) return true;
    return false;
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">
            Build your taste profile
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Takes about 2 minutes · You can always update it later
          </p>
        </div>

        <ProgressBar step={step} />

        {/* Step content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <Step1Genres
              genres={genres}
              weights={state.genreWeights}
              onChange={setGenreWeight}
            />
          )}
          {step === 2 && (
            <Step2Movies
              movies={sampleMovies}
              reactions={state.movieReactions}
              onReact={setReaction}
            />
          )}
          {step === 3 && (
            <Step3Preferences
              language={state.language}
              avoidContent={state.avoidContent}
              era={state.era}
              onLanguage={setLanguage}
              onAvoid={toggleAvoid}
              onEra={setEra}
            />
          )}
          {step === 4 && (
            <Step4Vibe
              vibe={state.vibe}
              onVibe={setVibe}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-10">
          {step > 1 && (
            <button
              onClick={() => setStep(s => (s - 1) as Step)}
              className="px-6 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors text-sm"
            >
              ← Back
            </button>
          )}

          <button
            onClick={() => step === 4 ? handleSubmit() : setStep(s => (s + 1) as Step)}
            disabled={!canProceed() || loading}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              canProceed() && !loading
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? 'Saving...' :
             step === 4 ? '🎬 Get my recommendations' :
             step === 2 ? 'Continue →' :
             'Next →'}
          </button>

          {step < 4 && step !== 1 && (
            <button
              onClick={() => setStep(s => (s + 1) as Step)}
              className="px-6 py-3 rounded-xl text-gray-600 hover:text-gray-400 transition-colors text-sm"
            >
              Skip
            </button>
          )}
        </div>

        {/* Skip all */}
        {step === 1 && (
          <p className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-gray-500 text-xs transition-colors"
            >
              Skip survey and explore later
            </button>
          </p>
        )}
      </div>
    </div>
  );
}