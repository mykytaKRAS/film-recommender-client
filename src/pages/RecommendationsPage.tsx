// src/pages/RecommendationsPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Brain, Users, Lock, RefreshCw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recommendationsApi } from '../api';
import { MovieCard } from '../components/MovieCard';

const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w300';

type Algorithm = 'content_based' | 'collaborative';

export function RecommendationsPage() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('content_based');
  const [requested, setRequested] = useState(false);

  const { data: status } = useQuery({
    queryKey: ['rec-status'],
    queryFn:  recommendationsApi.getStatus,
  });

  const { data: recs, isLoading, refetch } = useQuery({
    queryKey: ['recommendations', algorithm],
    queryFn:  () => recommendationsApi.get(algorithm),
    enabled:  requested,
  });

  const handleGet = () => {
    setRequested(true);
    refetch();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-indigo-400" size={32} />
          Recommendations
        </h1>
        <p className="text-gray-400 mt-2">
          Personalized movie recommendations based on your taste
        </p>
      </div>

      {/* Status card */}
      {status && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Content-based */}
            <div
              onClick={() => setAlgorithm('content_based')}
              className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${
                algorithm === 'content_based'
                  ? 'border-indigo-500 bg-indigo-950/40'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain size={20} className="text-indigo-400" />
                <span className="text-white font-medium">Content-Based</span>
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full border border-green-700/50">
                  Available
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Based on genres and movies you liked. Works from your very first rating.
              </p>
            </div>

            {/* Collaborative */}
            <div
              onClick={() => status.collaborativeAvailable && setAlgorithm('collaborative')}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                !status.collaborativeAvailable
                  ? 'border-gray-800 opacity-60 cursor-not-allowed'
                  : algorithm === 'collaborative'
                    ? 'border-purple-500 bg-purple-950/40 cursor-pointer'
                    : 'border-gray-700 hover:border-gray-600 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-purple-400" />
                <span className="text-white font-medium">Collaborative</span>
                {status.collaborativeAvailable ? (
                  <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded-full border border-purple-700/50">
                    Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                    <Lock size={10} /> Locked
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                Based on users with similar taste. Requires 100 ratings.
              </p>

              {/* Progress bar */}
              {!status.collaborativeAvailable && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{status.ratingCount} ratings</span>
                    <span>{status.ratingsUntilCollaborative} more to unlock</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${(status.ratingCount / 100) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Get button */}
          <button
            onClick={handleGet}
            disabled={isLoading}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Generating recommendations...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Get Recommendations
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {recs && !isLoading && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-gray-400 text-sm">
              {recs.totalCount} recommendations
              <span className="ml-2 text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                {recs.algorithm.replace('_', '-')}
              </span>
            </p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {recs.recommendations.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <Sparkles size={40} className="mx-auto mb-3 opacity-40" />
              <p>Not enough data yet.</p>
              <p className="text-sm mt-1">
                Rate some movies and fill out the survey first.
              </p>
              <Link
                to="/survey"
                className="text-indigo-400 hover:text-indigo-300 text-sm mt-3 inline-block"
              >
                Fill out preferences survey →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recs.recommendations.map((rec) => (
                <div key={rec.recommendationId} className="relative">
                  <MovieCard movie={rec.movie} />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-amber-400 text-xs px-2 py-1 rounded-full">
                    <Star size={10} fill="currentColor" />
                    {(rec.score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}