import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Clock, Calendar, Globe, Plus, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { moviesApi, ratingsApi, watchListApi } from '../api';
import { StarRating } from '../components/StarRating';
import { useAuthStore } from '../store/authStore';

const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w300';
const PLACEHOLDER = 'https://placehold.co/500x750/111827/ffffff?text=No+Image';

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [rating, setRating]   = useState(0);
  const [review, setReview]   = useState('');
  const [showReview, setShowReview] = useState(false);

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesApi.getById(id!),
    enabled: !!id,
  });

  const { data: watchList } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => watchListApi.getAll(),
    enabled: isAuthenticated,
  });

  const watchListEntry = watchList?.find((w) => w.movie.id === id);

  // Rating mutations
  const createRating = useMutation({
    mutationFn: () => ratingsApi.create(id!, rating, review || undefined),
    onSuccess: () => {
      toast.success('Rating saved!');
      qc.invalidateQueries({ queryKey: ['movie', id] });
      qc.invalidateQueries({ queryKey: ['my-ratings'] });
    },
    onError: () => toast.error('Failed to save rating'),
  });

  const updateRating = useMutation({
    mutationFn: () => ratingsApi.update(movie!.userRating!.id, rating, review || undefined),
    onSuccess: () => {
      toast.success('Rating updated!');
      qc.invalidateQueries({ queryKey: ['movie', id] });
    },
    onError: () => toast.error('Failed to update rating'),
  });

  const deleteRating = useMutation({
    mutationFn: () => ratingsApi.delete(movie!.userRating!.id),
    onSuccess: () => {
      toast.success('Rating removed');
      qc.invalidateQueries({ queryKey: ['movie', id] });
      setRating(0);
      setReview('');
    },
  });

  // WatchList mutations
  const addToWatchList = useMutation({
    mutationFn: () => watchListApi.add(id!),
    onSuccess: () => {
      toast.success('Added to watch list');
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: () => toast.error('Already in watch list'),
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => watchListApi.updateStatus(watchListEntry!.id, status),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const removeFromWatchList = useMutation({
    mutationFn: () => watchListApi.remove(watchListEntry!.id),
    onSuccess: () => {
      toast.success('Removed from watch list');
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  // Init rating form from existing
  const initRatingForm = () => {
    if (movie?.userRating) {
      setRating(movie.userRating.rating);
      setReview(movie.userRating.review ?? '');
    }
    setShowReview(true);
  };

  const handleSubmitRating = () => {
    if (rating === 0) return toast.error('Select a rating first');
    if (movie?.userRating) updateRating.mutate();
    else createRating.mutate();
  };

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 w-32 bg-gray-800 rounded mb-8" />
      <div className="flex gap-8">
        <div className="w-64 aspect-[2/3] bg-gray-800 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="h-10 bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
          <div className="h-32 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );

  if (!movie) return (
    <div className="text-center py-20 text-gray-500">Movie not found</div>
  );

  const poster = movie.posterPath
    ? `${TMDB_IMAGE}${movie.posterPath}`
    : PLACEHOLDER;

  const STATUS_OPTIONS = [
    { value: 'want',     label: 'Want to watch' },
    { value: 'watching', label: 'Watching' },
    { value: 'watched',  label: 'Watched' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="shrink-0">
          <img
            src={poster}
            alt={movie.title}
            className="w-56 rounded-2xl shadow-2xl mx-auto md:mx-0"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-gray-500 mt-1">{movie.originalTitle}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
            {movie.releaseYear && (
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {movie.releaseYear}
              </span>
            )}
            {movie.durationMin && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {movie.durationMin} min
              </span>
            )}
            {movie.originalLanguage && (
              <span className="flex items-center gap-1">
                <Globe size={14} /> {movie.originalLanguage.toUpperCase()}
              </span>
            )}
            {movie.avgRating && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star size={14} fill="currentColor" />
                {movie.avgRating.toFixed(1)}
                <span className="text-gray-500">({movie.voteCount.toLocaleString()} votes)</span>
              </span>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mt-4">
            {movie.genres.map((g) => (
              <span key={g} className="bg-indigo-900/50 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-700/50">
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          {movie.description && (
            <p className="text-gray-300 mt-5 leading-relaxed text-sm">{movie.description}</p>
          )}

          {/* Directors + Cast */}
          {movie.directors.length > 0 && (
            <p className="text-sm text-gray-400 mt-4">
              <span className="text-gray-500">Director: </span>
              {movie.directors.join(', ')}
            </p>
          )}
          {movie.actors.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              <span className="text-gray-500">Cast: </span>
              {movie.actors.map((a) => a.fullName).join(', ')}
            </p>
          )}

          {/* WatchList */}
          {isAuthenticated && (
            <div className="mt-6">
              {!watchListEntry ? (
                <button
                  onClick={() => addToWatchList.mutate()}
                  disabled={addToWatchList.isPending}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Plus size={16} /> Add to Watch List
                </button>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateStatus.mutate(opt.value)}
                        className={`px-3 py-2 text-xs font-medium transition-colors ${
                          watchListEntry.status === opt.value
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => removeFromWatchList.mutate()}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rating */}
          {isAuthenticated && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-white font-medium mb-3">
                {movie.userRating ? 'Your rating' : 'Rate this movie'}
              </h3>

              {!showReview && movie.userRating ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-amber-400" fill="currentColor" />
                    <span className="text-amber-400 font-medium">{movie.userRating.rating}/10</span>
                  </div>
                  {movie.userRating.review && (
                    <p className="text-gray-400 text-sm italic">"{movie.userRating.review}"</p>
                  )}
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={initRatingForm}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRating.mutate()}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <StarRating value={rating} onChange={setRating} />
                  <textarea
                    placeholder="Write a review (optional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                    className="w-full mt-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleSubmitRating}
                      disabled={createRating.isPending || updateRating.isPending}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <Check size={14} />
                      {movie.userRating ? 'Update' : 'Save'} rating
                    </button>
                    {showReview && (
                      <button
                        onClick={() => setShowReview(false)}
                        className="text-sm text-gray-400 hover:text-white px-4 py-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}