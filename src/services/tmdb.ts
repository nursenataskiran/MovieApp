import axios from 'axios';

const TMDB_API_KEY = 'b2302a92191351052ab75a699ff34d09';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

export interface MovieDetails extends Movie {
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  status: string;
  tagline: string;
}

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'tr-TR',
  },
});

// Hata ayıklama için interceptor ekleyelim
api.interceptors.request.use(request => {
  console.log('API İsteği:', request.url, request.params);
  return request;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Hatası:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
);

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  const response = await api.get('/movie/popular', { params: { page } });
  return response.data.results;
};

export const getTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
  const response = await api.get('/movie/top_rated', { params: { page } });
  return response.data.results;
};

export const getNowPlayingMovies = async (page: number = 1): Promise<Movie[]> => {
  const response = await api.get('/movie/now_playing', { params: { page } });
  return response.data.results;
};

export const searchMovies = async (query: string, page: number = 1): Promise<Movie[]> => {
  const response = await api.get('/search/movie', {
    params: {
      query,
      page,
    },
  });
  return response.data.results;
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  const response = await api.get(`/movie/${movieId}`);
  return response.data;
};

export const getMovieRecommendations = async (movieId: number): Promise<Movie[]> => {
  const response = await api.get(`/movie/${movieId}/recommendations`);
  return response.data.results;
}; 