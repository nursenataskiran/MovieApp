import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, Button, Input, Rating } from "react-native-elements";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import {
  getMovieDetails,
  getImageUrl,
  type MovieDetails,
} from "../services/tmdb";
import {
  addToWatchlist,
  removeFromWatchlist,
  rateMovie,
  commentOnMovie,
  getMovieComments,
  getMovieRating,
  type MovieComment,
} from "../services/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "MovieDetail">;

export default function MovieDetailScreen({ route, navigation }: Props) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [inWatchlist, setInWatchlist] = useState(false);

  const fetchMovieDetails = async () => {
    try {
      const movieData = await getMovieDetails(movieId);
      setMovie(movieData);

      // Fetch comments
      const { data: commentsData } = await getMovieComments(movieId);
      if (commentsData) setComments(commentsData);

      // Fetch user rating
      const { data: ratingData } = await getMovieRating(movieId);
      if (ratingData && ratingData.length > 0) {
        setUserRating(ratingData[0].rating);
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
      Alert.alert("Hata", "Film detayları yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    try {
      await rateMovie(movieId, rating);
      setUserRating(rating);
      Alert.alert("Başarılı", "Puanınız kaydedildi.");
    } catch (error) {
      Alert.alert("Hata", "Puan verirken bir hata oluştu.");
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      Alert.alert("Hata", "Lütfen bir yorum yazın.");
      return;
    }

    try {
      await commentOnMovie(movieId, comment);
      setComment("");
      // Refresh comments
      const { data } = await getMovieComments(movieId);
      if (data) setComments(data);
      Alert.alert("Başarılı", "Yorumunuz eklendi.");
    } catch (error) {
      Alert.alert("Hata", "Yorum eklenirken bir hata oluştu.");
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await removeFromWatchlist(movieId);
        setInWatchlist(false);
        Alert.alert("Başarılı", "Film izleme listenizden çıkarıldı.");
      } else {
        await addToWatchlist(movieId);
        setInWatchlist(true);
        Alert.alert("Başarılı", "Film izleme listenize eklendi.");
      }
    } catch (error) {
      Alert.alert("Hata", "İşlem sırasında bir hata oluştu.");
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  if (loading || !movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: getImageUrl(movie.backdrop_path, "original") }}
        style={styles.backdrop}
      />

      <View style={styles.content}>
        <Text h3 style={styles.title}>
          {movie.title}
        </Text>
        <Text style={styles.tagline}>{movie.tagline}</Text>

        <View style={styles.infoRow}>
          <Text>Çıkış Tarihi: {movie.release_date}</Text>
          <Text>Süre: {movie.runtime} dk</Text>
        </View>

        <View style={styles.genreContainer}>
          {movie.genres.map((genre) => (
            <View key={genre.id} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.overview}>{movie.overview}</Text>

        <Button
          title={
            inWatchlist ? "İzleme Listesinden Çıkar" : "İzleme Listesine Ekle"
          }
          onPress={toggleWatchlist}
          containerStyle={styles.button}
        />

        <View style={styles.ratingContainer}>
          <Text h4>Puan Ver</Text>
          <Rating
            startingValue={userRating}
            imageSize={30}
            onFinishRating={handleRating}
          />
        </View>

        <View style={styles.commentsSection}>
          <Text h4>Yorumlar</Text>

          <View style={styles.commentInput}>
            <Input
              placeholder="Yorumunuzu yazın..."
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <Button title="Yorum Yap" onPress={handleComment} />
          </View>

          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentText}>{comment.comment}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
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
  backdrop: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 15,
  },
  title: {
    marginBottom: 5,
  },
  tagline: {
    fontStyle: "italic",
    color: "#666",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  genreTag: {
    backgroundColor: "#f0f0f0",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  genreText: {
    fontSize: 12,
  },
  overview: {
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
  ratingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  commentsSection: {
    marginTop: 20,
  },
  commentInput: {
    marginVertical: 10,
  },
  commentItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  commentText: {
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
  },
});
