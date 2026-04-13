import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { surveyApi } from '../api';

export function SurveyPage() {
  const navigate  = useNavigate();
  const [weights, setWeights] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  const { data } = useQuery({
    queryKey: ['survey'],
    queryFn: surveyApi.get,
  });

  const setWeight = (genreId: number, value: number) =>
    setWeights((w) => ({ ...w, [genreId]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await surveyApi.submit(weights, []);
      toast.success("Preferences saved! Let's find your movies.");
      navigate('/');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <Sparkles className="text-indigo-400 mx-auto mb-3" size={36} />
        <h1 className="text-2xl font-bold text-white">What do you like to watch?</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Rate each genre to help us recommend movies you'll love
        </p>
      </div>

      <div className="space-y-4">
        {data?.questions.map((q) => (
          <div key={q.genreId} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">{q.genreName}</span>
              <span className="text-indigo-400 text-sm font-medium">
                {Math.round((weights[q.genreId] ?? 0) * 10) / 10 > 0
                  ? `${Math.round((weights[q.genreId] ?? 0) * 100)}%`
                  : 'Not set'}
              </span>
            </div>
            <input
              type="range" min="0" max="1" step="0.1"
              value={weights[q.genreId] ?? 0}
              onChange={(e) => setWeight(q.genreId, parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Not interested</span>
              <span>Love it</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSubmit} disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {loading ? 'Saving...' : 'Save preferences'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
}