import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text } from "react-native-elements";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootStackParamList, BottomTabParamList } from "../../App";
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getImageUrl,
  type Movie,
} from "../services/tmdb";

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovies = async () => {
    try {
      const [popular, topRated, nowPlaying] = await Promise.all([
        getPopularMovies(),
        getTopRatedMovies(),
        getNowPlayingMovies(),
      ]);

      setPopularMovies(popular);
      setTopRatedMovies(topRated);
      setNowPlayingMovies(nowPlaying);
    } catch (error) {
      console.error("Error fetching movies:", error);
      Alert.alert(
        "Hata",
        "Filmler yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

  const MovieSection = ({
    title,
    movies,
  }: {
    title: string;
    movies: Movie[];
  }) => (
    <View style={styles.section}>
      <Text h4 style={styles.sectionTitle}>
        {title}
      </Text>
      <FlatList
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.movieCard}
            onPress={() =>
              navigation.navigate("MovieDetail", { movieId: item.id })
            }
          >
            <Image
              source={{ uri: getImageUrl(item.poster_path) }}
              style={styles.poster}
              resizeMode="cover"
            />
            <Text style={styles.movieTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <MovieSection title="Popüler Filmler" movies={popularMovies} />
      <MovieSection title="En İyi Filmler" movies={topRatedMovies} />
      <MovieSection title="Vizyondaki Filmler" movies={nowPlayingMovies} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    marginLeft: 10,
    marginBottom: 10,
  },
  movieCard: {
    width: 150,
    marginHorizontal: 5,
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 8,
  },
  movieTitle: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 14,
  },
});
