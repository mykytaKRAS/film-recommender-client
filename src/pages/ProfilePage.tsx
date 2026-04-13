import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Star, BookMarked, Eye, Clock, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi, watchListApi, ratingsApi } from '../api';
import type { WatchStatus } from '../types';

const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w300';
const PLACEHOLDER = 'https://placehold.co/500x750/111827/ffffff?text=No+Image';

type Tab = 'watchlist' | 'ratings';
const STATUS_TABS: { value: WatchStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all',      label: 'All',      icon: <BookMarked size={14} /> },
  { value: 'want',     label: 'Want',     icon: <Clock size={14} /> },
  { value: 'watching', label: 'Watching', icon: <Eye size={14} /> },
  { value: 'watched',  label: 'Watched',  icon: <Star size={14} /> },
];

export function ProfilePage() {
  const [tab, setTab]       = useState<Tab>('watchlist');
  const [status, setStatus] = useState<WatchStatus | 'all'>('all');
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
  });

  const { data: watchList, isLoading: wlLoading } = useQuery({
    queryKey: ['watchlist', status],
    queryFn: () => watchListApi.getAll(status === 'all' ? undefined : status),
    enabled: tab === 'watchlist',
  });

  const { data: ratings, isLoading: ratingsLoading } = useQuery({
    queryKey: ['my-ratings'],
    queryFn: ratingsApi.getMy,
    enabled: tab === 'ratings',
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      watchListApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const removeFromWL = useMutation({
    mutationFn: (id: string) => watchListApi.remove(id),
    onSuccess: () => {
      toast.success('Removed');
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const deleteRating = useMutation({
    mutationFn: (id: string) => ratingsApi.delete(id),
    onSuccess: () => {
      toast.success('Rating deleted');
      qc.invalidateQueries({ queryKey: ['my-ratings'] });
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
          <User size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile?.username}</h1>
          <p className="text-gray-400 text-sm">{profile?.email}</p>
          <p className="text-gray-600 text-xs mt-1">
            Member since {profile ? new Date(profile.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        {([['watchlist', 'Watch List'], ['ratings', 'My Ratings']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Watch List */}
      {tab === 'watchlist' && (
        <div>
          {/* Status sub-tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {STATUS_TABS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors ${
                  status === s.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {s.icon} {s.label}
                {s.value === 'all' && watchList && (
                  <span className="ml-1 text-xs opacity-70">({watchList.length})</span>
                )}
              </button>
            ))}
          </div>

          {wlLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : watchList?.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <BookMarked size={40} className="mx-auto mb-3 opacity-40" />
              <p>No movies here yet</p>
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                Browse movies
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {watchList?.map((item) => {
                const poster = item.movie.posterPath
                  ? `${TMDB_IMAGE}${item.movie.posterPath}`
                  : PLACEHOLDER;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                  >
                    <Link to={`/movies/${item.movie.id}`} className="shrink-0">
                      <img
                        src={poster}
                        alt={item.movie.title}
                        className="w-12 h-18 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/movies/${item.movie.id}`}
                        className="text-white font-medium hover:text-indigo-300 transition-colors line-clamp-1"
                      >
                        {item.movie.title}
                      </Link>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {item.movie.releaseYear} · {item.movie.genres.slice(0, 2).join(', ')}
                      </p>

                      {/* Status selector */}
                      <div className="flex gap-1 mt-2">
                        {(['want', 'watching', 'watched'] as WatchStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus.mutate({ id: item.id, status: s })}
                            className={`px-2 py-0.5 rounded text-xs transition-colors ${
                              item.status === s
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-800 text-gray-500 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {item.movie.avgRating && (
                      <div className="flex items-center gap-1 text-amber-400 text-sm shrink-0">
                        <Star size={12} fill="currentColor" />
                        {item.movie.avgRating.toFixed(1)}
                      </div>
                    )}

                    <button
                      onClick={() => removeFromWL.mutate(item.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors shrink-0 self-start"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ratings */}
      {tab === 'ratings' && (
        <div>
          {ratingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : ratings?.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <Star size={40} className="mx-auto mb-3 opacity-40" />
              <p>No ratings yet</p>
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                Find a movie to rate
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ratings?.map((r) => {
                const poster = r.movie.posterPath
                  ? `${TMDB_IMAGE}${r.movie.posterPath}`
                  : PLACEHOLDER;

                return (
                  <div
                    key={r.ratingId}
                    className="flex gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                  >
                    <Link to={`/movies/${r.movie.id}`} className="shrink-0">
                      <img
                        src={poster}
                        alt={r.movie.title}
                        className="w-12 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/movies/${r.movie.id}`}
                        className="text-white font-medium hover:text-indigo-300 transition-colors line-clamp-1"
                      >
                        {r.movie.title}
                      </Link>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {r.movie.releaseYear} · Rated {new Date(r.ratedAt).toLocaleDateString()}
                      </p>
                      {r.review && (
                        <p className="text-gray-400 text-sm mt-1 italic line-clamp-2">
                          "{r.review}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star size={14} fill="currentColor" />
                        {r.rating}/10
                      </div>
                      <button
                        onClick={() => deleteRating.mutate(r.ratingId)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}