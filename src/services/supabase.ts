import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://cnfvyhxyauesxvibzlzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZnZ5aHh5YXVlc3h2aWJ6bHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODQ1MTEsImV4cCI6MjA2MzY2MDUxMX0.XyYDMXBxjCva4AlTIsHe1wPcngUgdQKou4jzz91usuA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Auth types
export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export interface User {
  id: string;
  email?: string;
  created_at: string;
}

// Database types
export interface MovieRating {
  id: string;
  user_id: string;
  movie_id: number;
  rating: number;
  created_at: string;
}

export interface MovieComment {
  id: string;
  user_id: string;
  movie_id: number;
  comment: string;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  created_at: string;
}

// Auth functions
export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('Kayıt işlemi başlatılıyor:', { email });
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          email_confirmed: false
        }
      }
    });

    if (error) {
      console.error('Kayıt hatası:', error);
      // E-posta hatası için özel kontrol
      if (error.message.includes('invalid email')) {
        return { 
          user: null, 
          error: new Error('Geçersiz e-posta adresi formatı. Lütfen geçerli bir e-posta adresi girin.') 
        };
      }
      return { user: null, error };
    }

    // Kullanıcı oluşturuldu ama e-posta doğrulaması gerekiyor
    if (data.user && !data.user.email_confirmed_at) {
      console.log('Kullanıcı oluşturuldu, e-posta doğrulaması bekleniyor');
      return { 
        user: data.user, 
        error: new Error('Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.') 
      };
    }

    console.log('Kayıt başarılı:', data.user?.id);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Beklenmeyen kayıt hatası:', error);
    return { 
      user: null, 
      error: new Error('Kayıt işlemi sırasında beklenmeyen bir hata oluştu') 
    };
  }
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('Giriş işlemi başlatılıyor:', { email });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      console.error('Giriş hatası:', error);
      
      // Hata mesajlarını özelleştir
      if (error.message.includes('Invalid login credentials')) {
        return { 
          user: null, 
          error: new Error('E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.') 
        };
      } else if (error.message.includes('Email not confirmed')) {
        return { 
          user: null, 
          error: new Error('E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin.') 
        };
      }
      
      return { 
        user: null, 
        error: new Error('Giriş işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.') 
      };
    }

    console.log('Giriş başarılı:', data.user?.id);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Beklenmeyen giriş hatası:', error);
    return { 
      user: null, 
      error: new Error('Giriş işlemi sırasında beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.') 
    };
  }
};

export const signOut = async () => {
  console.log('Çıkış işlemi başlatılıyor');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
    console.log('Çıkış başarılı');
  } catch (error) {
    console.error('Beklenmeyen çıkış hatası:', error);
    throw new Error('Çıkış işlemi sırasında beklenmeyen bir hata oluştu');
  }
};

// Database functions with error handling
export const addToWatchlist = async (movieId: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Kullanıcı oturumu bulunamadı');
      throw new Error('Oturum açmanız gerekiyor');
    }

    const { data, error } = await supabase
      .from('watchlist')
      .insert([{ user_id: user.id, movie_id: movieId }]);

    if (error) {
      console.error('İzleme listesine ekleme hatası:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('İzleme listesi işlem hatası:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (movieId: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Kullanıcı oturumu bulunamadı');
      throw new Error('Oturum açmanız gerekiyor');
    }

    const { data, error } = await supabase
      .from('watchlist')
      .delete()
      .match({ user_id: user.id, movie_id: movieId });

    if (error) {
      console.error('İzleme listesinden çıkarma hatası:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('İzleme listesi işlem hatası:', error);
    throw error;
  }
};

export const getWatchlist = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Kullanıcı oturumu bulunamadı');
      throw new Error('Oturum açmanız gerekiyor');
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('İzleme listesi getirme hatası:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('İzleme listesi işlem hatası:', error);
    return { data: null, error };
  }
};

export const rateMovie = async (movieId: number, rating: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  return await supabase
    .from('ratings')
    .upsert([{ user_id: user.id, movie_id: movieId, rating }]);
};

export const commentOnMovie = async (movieId: number, comment: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  return await supabase
    .from('comments')
    .insert([{ user_id: user.id, movie_id: movieId, comment }]);
};

export const getMovieComments = async (movieId: number) => {
  return await supabase
    .from('comments')
    .select('*')
    .eq('movie_id', movieId);
};

export const getMovieRating = async (movieId: number) => {
  return await supabase
    .from('ratings')
    .select('rating')
    .eq('movie_id', movieId);
}; 