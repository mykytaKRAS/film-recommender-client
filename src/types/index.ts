//Auth

export interface AuthResponse {
  userId: string;
  username: string;
  email: string;
  token: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

//Movies

export interface MovieSummary {
  id: string;
  title: string;
  releaseYear: number | null;
  avgRating: number | null;
  posterPath: string | null;
  genres: string[];
}

export interface ActorDto {
  fullName: string;
  roleName: string | null;
}

export interface MovieDetail {
  id: string;
  title: string;
  originalTitle: string | null;
  description: string | null;
  releaseYear: number | null;
  durationMin: number | null;
  avgRating: number | null;
  voteCount: number;
  posterPath: string | null;
  originalLanguage: string | null;
  genres: string[];
  actors: ActorDto[];
  directors: string[];
  countries: string[];
  tags: string[];
  userRating: UserRatingDto | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

//Ratings

export interface UserRatingDto {
  id: string;
  rating: number;
  review: string | null;
  ratedAt: string;
}

export interface MyRatingDto {
  ratingId: string;
  movie: MovieSummary;
  rating: number;
  review: string | null;
  ratedAt: string;
}

//WatchList

export type WatchStatus = 'want' | 'watching' | 'watched';

export interface WatchListItem {
  id: string;
  movie: MovieSummary;
  status: WatchStatus;
  addedAt: string;
}

// Genres 

export interface Genre {
  id: number;
  name: string;
}

// Survey 

export interface SurveyQuestion {
  genreId: number;
  genreName: string;
}

export interface SurveyData {
  questions: SurveyQuestion[];
  isComplete: boolean;
}

// Filters 

export interface MovieFilters {
  genreId?: number;
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  language?: string;
  sortBy?: 'popularity' | 'rating' | 'year' | 'title';
  page: number;
  pageSize: number;
}