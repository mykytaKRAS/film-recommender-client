import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { MovieSummary } from '../types';

const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w300';
const PLACEHOLDER = 'https://placehold.co/500x750/111827/ffffff?text=No+Image';

interface Props {
  movie: MovieSummary;
}

export function MovieCard({ movie }: Props) {
  const poster = movie.posterPath
    ? `${TMDB_IMAGE}${movie.posterPath}`
    : PLACEHOLDER;

  return (
    <Link to={`/movies/${movie.id}`} className="group block">
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
          />
        </div>
        <div className="p-3">
          <h3 className="text-white font-medium text-sm truncate">{movie.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-500 text-xs">{movie.releaseYear ?? '—'}</span>
            {movie.avgRating && (
              <span className="flex items-center gap-1 text-amber-400 text-xs">
                <Star size={11} fill="currentColor" />
                {movie.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          {movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}