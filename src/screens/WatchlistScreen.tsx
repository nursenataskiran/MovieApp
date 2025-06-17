import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Button } from "react-native-elements";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabParamList, RootStackParamList } from "../../App";
import { getWatchlist, removeFromWatchlist } from "../services/supabase";
import { getMovieDetails, getImageUrl, type Movie } from "../services/tmdb";

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "Watchlist">,
  NativeStackScreenProps<RootStackParamList>
>;

interface WatchlistMovie extends Movie {
  watchlistId: string;
}

export default function WatchlistScreen({ navigation }: Props) {
  const [movies, setMovies] = useState<WatchlistMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const { data: watchlistItems, error } = await getWatchlist();
      if (error) throw error;

      if (watchlistItems) {
        // Fetch movie details for each watchlist item
        const movieDetails = await Promise.all(
          watchlistItems.map(async (item) => {
            const movie = await getMovieDetails(item.movie_id);
            return {
              ...movie,
              watchlistId: item.id,
            };
          })
        );
        setMovies(movieDetails);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      Alert.alert("Hata", "İzleme listesi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWatchlist();
  };

  const handleRemove = async (movieId: number) => {
    try {
      await removeFromWatchlist(movieId);
      setMovies((prev) => prev.filter((movie) => movie.id !== movieId));
      Alert.alert("Başarılı", "Film izleme listenizden çıkarıldı.");
    } catch (error) {
      Alert.alert("Hata", "Film çıkarılırken bir hata oluştu.");
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.movieItem}
            onPress={() =>
              navigation.navigate("MovieDetail", { movieId: item.id })
            }
          >
            <Image
              source={{ uri: getImageUrl(item.poster_path) }}
              style={styles.poster}
            />
            <View style={styles.movieInfo}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.overview} numberOfLines={2}>
                {item.overview}
              </Text>
              <Button
                title="Listeden Çıkar"
                onPress={() => handleRemove(item.id)}
                type="clear"
                titleStyle={styles.removeButtonText}
              />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            İzleme listenizde henüz film bulunmuyor.
          </Text>
        }
      />
    </View>
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
  list: {
    padding: 10,
  },
  movieItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 4,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  overview: {
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
  },
  removeButtonText: {
    color: "#ff0000",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});
