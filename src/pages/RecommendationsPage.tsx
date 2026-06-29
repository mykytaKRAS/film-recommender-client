import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Brain, Users, Lock, RefreshCw, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recommendationsApi } from '../api';
import { api } from './../api/client';
import type { MovieSummary } from '../types';

const TMDB_IMAGE  = 'https://image.tmdb.org/t/p/w300';
const PLACEHOLDER = 'https://via.placeholder.com/300x450?text=No+Image';

type Algorithm = 'content_based' | 'collaborative';

interface RecommendationItem {
  recommendationId: string;
  movie: MovieSummary;
  score: number;
  algorithm: string;
}

//API функції

const markClicked = async (recommendationId: string) => {
  await api.post(`/api/recommendations/${recommendationId}/click`);
};

//Компонент картки рекомендації

function RecommendationCard({
  rec,
  rank,
}: {
  rec: RecommendationItem;
  rank: number;
}) {
  const qc = useQueryClient();

  const clickMutation = useMutation({
    mutationFn: () => markClicked(rec.recommendationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  });

  const poster = rec.movie.posterPath
    ? `${TMDB_IMAGE}${rec.movie.posterPath}`
    : PLACEHOLDER;

  const scorePercent = Math.round(rec.score * 100);

  const badgeColor =
    scorePercent >= 70 ? '#10b981' :
    scorePercent >= 50 ? '#f59e0b' :
    '#6366f1';

  return (
    <Link
      to={`/movies/${rec.movie.id}`}
      onClick={() => clickMutation.mutate()}
      className="group block relative"
    >
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">

        {/* Rank badge */}
        <div className="absolute top-2 left-2 z-10 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-bold text-white">
          {rank}
        </div>

        {/* Score badge */}
        <div
          className="absolute top-2 right-2 z-10 flex items-center gap-1 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: `${badgeColor}cc` }}
        >
          <Star size={9} fill="currentColor" />
          {scorePercent}%
        </div>

        {/* Poster */}
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={poster}
            alt={rec.movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
          />
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-white font-medium text-sm truncate">
            {rec.movie.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-500 text-xs">{rec.movie.releaseYear ?? '—'}</span>
            {rec.movie.avgRating && (
              <span className="flex items-center gap-1 text-amber-400 text-xs">
                <Star size={10} fill="currentColor" />
                {rec.movie.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          {rec.movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {rec.movie.genres.slice(0, 2).map((g) => (
                <span key={g} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">
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

//Головний компонент

export function RecommendationsPage() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('content_based');
  const [requested, setRequested] = useState(false);

  const { data: status } = useQuery({
    queryKey:  ['rec-status'],
    queryFn:   recommendationsApi.getStatus,
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

  const algorithmLabel: Record<string, string> = {
    content_based:  'Content-Based Filtering',
    collaborative:  'Collaborative Filtering',
    hybrid:         'Hybrid (Content + Collaborative)',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-indigo-400" size={32} />
          Recommendations
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Personalized movie recommendations based on your taste profile
        </p>
      </div>

      {/* Algorithm selector */}
      {status && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <p className="text-gray-400 text-sm mb-4">Choose recommendation method:</p>

          <div className="flex flex-col md:flex-row gap-4">

            {/* Content-Based */}
            <div
              onClick={() => setAlgorithm('content_based')}
              className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${
                algorithm === 'content_based'
                  ? 'border-indigo-500 bg-indigo-950/40'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain size={18} className="text-indigo-400" />
                <span className="text-white font-medium text-sm">Content-Based</span>
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full border border-green-700/50">
                  Always available
                </span>
              </div>
              <p className="text-gray-500 text-xs">
                Based on your genre preferences and movies you rated.
                Score shows cosine similarity with your taste profile.
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
                <Users size={18} className="text-purple-400" />
                <span className="text-white font-medium text-sm">Collaborative</span>
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
              <p className="text-gray-500 text-xs">
                Based on users with similar taste. Score shows predicted rating.
              </p>

              {!status.collaborativeAvailable && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{status.ratingCount} ratings</span>
                    <span>{status.ratingsUntilCollaborative} more needed</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${Math.min((status.ratingCount / 100) * 100, 100)}%` }}
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
                Generating...
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

      {/* Score legend */}
      {recs && !isLoading && (
        <div className="flex items-center gap-6 mb-5 text-xs text-gray-500">
          <span className="font-medium text-gray-400">Match score:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/>
            ≥70% Great match
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/>
            50–70% Good match
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"/>
            &lt;50% Possible match
          </span>
        </div>
      )}

      {/* Results */}
      {recs && !isLoading && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-gray-400 text-sm">
                {recs.totalCount} recommendations
              </p>
              <p className="text-gray-600 text-xs mt-0.5">
                {algorithmLabel[recs.algorithm] ?? recs.algorithm}
              </p>
            </div>
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
              <Link
                to="/survey"
                className="text-indigo-400 hover:text-indigo-300 text-sm mt-3 inline-flex items-center gap-1"
              >
                Fill preferences survey <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recs.recommendations.map((rec, i) => (
                <RecommendationCard
                  key={rec.recommendationId}
                  rec={rec}
                  rank={i + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}