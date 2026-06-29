import { api } from './client';
import type {
  AuthResponse, UserProfile,
  MovieSummary, MovieDetail, PagedResult,
  MyRatingDto, WatchListItem, Genre,
  SurveyData, MovieFilters,
} from '../types';

// Auth

export const authApi = {
  register: async (email: string, username: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/register', {
      email, username, password,
    });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', {
      email, password,
    });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get<UserProfile>('/api/users/me');
    return data;
  },
};

// Movies

export const moviesApi = {
  getAll: async (filters: MovieFilters) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    );
    const { data } = await api.get<PagedResult<MovieSummary>>('/api/movies', { params });
    return data;
  },

  search: async (q: string, filters: MovieFilters) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    );
    
    const params = { q, ...cleanFilters };

    const { data } = await api.get<PagedResult<MovieSummary>>('/api/movies/search', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<MovieDetail>(`/api/movies/${id}`);
    return data;
  },
};

// Genres

export const genresApi = {
  getAll: async () => {
    const { data } = await api.get<Genre[]>('/api/genres');
    return data;
  },
};

// Ratings

export const ratingsApi = {
  getMy: async () => {
    const { data } = await api.get<MyRatingDto[]>('/api/ratings/my');
    return data;
  },

  create: async (movieId: string, rating: number, review?: string) => {
    await api.post('/api/ratings', { movieId, rating, review });
  },

  update: async (id: string, rating: number, review?: string) => {
    await api.put(`/api/ratings/${id}`, { rating, review });
  },

  delete: async (id: string) => {
    await api.delete(`/api/ratings/${id}`);
  },
};

// WatchList

export const watchListApi = {
  getAll: async (status?: string) => {
    const { data } = await api.get<WatchListItem[]>('/api/watchlist', {
      params: status ? { status } : {},
    });
    return data;
  },

  add: async (movieId: string) => {
    await api.post('/api/watchlist', { movieId });
  },

  updateStatus: async (id: string, status: string) => {
    await api.put(`/api/watchlist/${id}`, { status });
  },

  remove: async (id: string) => {
    await api.delete(`/api/watchlist/${id}`);
  },
};

// Survey
/*
export const surveyApi = {
  get: async () => {
    const { data } = await api.get<SurveyData>('/api/survey');
    return data;
  },

  submit: async (genreWeights: Record<number, number>, favoriteMovieIds: string[]) => {
    await api.post('/api/survey', { genreWeights, favoriteMovieIds });
  },
};*/
export const surveyApi = {
  get: async () => {
    const { data } = await api.get<SurveyData>('/api/survey');
    return data;
  },

  submit: async (
    genreWeights: Record<number, number>,
    favoriteMovieIds: string[],
    extraWeights?: Record<string, number>
  ) => {
    await api.post('/api/survey', {
      genreWeights,
      favoriteMovieIds,
      extraWeights: extraWeights ?? null,
    });
  },
};

// Recommendations

export const recommendationsApi = {
  getStatus: async () => {
    const { data } = await api.get<{
      ratingCount: number;
      collaborativeAvailable: boolean;
      ratingsUntilCollaborative: number;
    }>('/api/recommendations/status');
    return data;
  },

  get: async (algorithm?: string) => {
    const { data } = await api.get<{
      algorithm: string;
      totalCount: number;
      recommendations: Array<{
        recommendationId: string;
        movie: MovieSummary;
        score: number;
        algorithm: string;
      }>;
    }>('/api/recommendations', {
      params: algorithm ? { algorithm } : {},
    });
    return data;
  },

  vectorize: async () => {
    await api.post('/api/recommendations/vectorize');
  },
};

export const explainerApi = {
  getContentBasedLog: async () => {
    const { data } = await api.get('/api/recommendations/explain/content');
    return data;
  },
  getCollaborativeLog: async () => {
    const { data } = await api.get('/api/recommendations/explain/collaborative');
    return data;
  },
};

export const evaluationApi = {
  getMetrics: async () => {
    const { data } = await api.get('/api/evaluation');
    return data;
  },
};