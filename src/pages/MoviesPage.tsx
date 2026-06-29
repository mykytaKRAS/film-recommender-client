import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { moviesApi, genresApi } from '../api';
import { MovieCard } from '../components/MovieCard';
import type { MovieFilters } from '../types';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating',     label: 'Rating' },
  { value: 'year',       label: 'Year' },
  { value: 'title',      label: 'Title' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italian' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
];

export function MoviesPage() {
  const [search, setSearch]         = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]        = useState<MovieFilters>({
    page: 1, pageSize: 24, sortBy: 'popularity',
  });

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: genresApi.getAll,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['movies', filters, search],
    queryFn: () =>
      search.length >= 2
        // Передаємо всі фільтри в пошук (переконайтеся, що api.ts приймає їх)
        ? moviesApi.search(search, filters) 
        : moviesApi.getAll(filters),
    placeholderData: (prev) => prev,
  });

  const setFilter = <K extends keyof MovieFilters>(key: K, value: MovieFilters[K] | undefined) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const clearFilters = () =>
    setFilters({ page: 1, pageSize: 24, sortBy: 'popularity' });

  const hasActiveFilters =
    filters.genreId || filters.yearFrom || filters.yearTo ||
    filters.minRating || filters.language;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={18} />
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-indigo-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Genre</label>
            <select
              value={filters.genreId ?? ''}
              onChange={(e) => setFilter('genreId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All genres</option>
              {genres?.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Year from</label>
            <input
              type="number" min="1900" max="2026" placeholder="1900"
              value={filters.yearFrom ?? ''}
              onChange={(e) => setFilter('yearFrom', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Year to</label>
            <input
              type="number" min="1900" max="2026" placeholder="2026"
              value={filters.yearTo ?? ''}
              onChange={(e) => setFilter('yearTo', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Min rating</label>
            <input
              type="number" min="0" max="10" step="0.5" placeholder="0"
              value={filters.minRating ?? ''}
              onChange={(e) => setFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Language</label>
            <select
              value={filters.language ?? ''}
              onChange={(e) => setFilter('language', e.target.value || undefined)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All</option>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Sort by</label>
            <select
              value={filters.sortBy ?? 'popularity'}
              onChange={(e) => setFilter('sortBy', e.target.value as MovieFilters['sortBy'])}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <X size={14} /> Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {data && (
        <p className="text-gray-500 text-sm mb-4">
          {data.totalCount.toLocaleString()} movies found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data?.items.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            disabled={!data.hasPrev}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-white disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            disabled={!data.hasNext}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-white disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}