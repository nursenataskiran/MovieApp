import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SearchBar, Text } from "react-native-elements";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabParamList, RootStackParamList } from "../../App";
import { searchMovies, getImageUrl, type Movie } from "../services/tmdb";

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "Search">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length === 0) {
      setMovies([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchMovies(text);
      setMovies(results);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => navigation.navigate("MovieDetail", { movieId: item.id })}
    >
      <Image
        source={{ uri: getImageUrl(item.poster_path) }}
        style={styles.poster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.year}>
          {new Date(item.release_date).getFullYear()}
        </Text>
        <Text numberOfLines={2} style={styles.overview}>
          {item.overview}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Film ara..."
        onChangeText={handleSearch}
        value={query}
        platform="default"
        containerStyle={styles.searchBar}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={movies}
          renderItem={renderMovie}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            query.length > 0 ? (
              <Text style={styles.noResults}>Sonuç bulunamadı</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBar: {
    backgroundColor: "#fff",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  loader: {
    marginTop: 20,
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
    width: 80,
    height: 120,
    borderRadius: 4,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  year: {
    color: "#666",
    marginBottom: 4,
  },
  overview: {
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});
