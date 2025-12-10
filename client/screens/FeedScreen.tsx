import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Post, User } from "@shared/schema";

interface PostWithAuthor extends Post {
  author: User;
  isUpvoted: boolean;
  isSaved: boolean;
}

export default function FeedScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: posts, isLoading, refetch } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
  });

  const upvoteMutation = useMutation({
    mutationFn: async ({ postId, isUpvoted }: { postId: string; isUpvoted: boolean }) => {
      if (isUpvoted) {
        await apiRequest("DELETE", `/api/posts/${postId}/upvote`);
      } else {
        await apiRequest("POST", `/api/posts/${postId}/upvote`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/posts/${postId}/save`);
      } else {
        await apiRequest("POST", `/api/posts/${postId}/save`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="h3">Nexio</ThemedText>
      </View>
      <Pressable
        onPress={() => navigation.navigate("Search")}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Feather name="search" size={24} color={theme.text} />
      </Pressable>
    </View>
  );

  const renderItem = ({ item }: { item: PostWithAuthor }) => (
    <PostCard
      post={item}
      author={item.author}
      isUpvoted={item.isUpvoted}
      isSaved={item.isSaved}
      onUpvote={() =>
        upvoteMutation.mutate({ postId: item.id, isUpvoted: item.isUpvoted })
      }
      onSave={() =>
        saveMutation.mutate({ postId: item.id, isSaved: item.isSaved })
      }
    />
  );

  if (isLoading && !posts) {
    return (
      <ThemedView style={styles.container}>
        {renderHeader()}
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={posts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="book-open"
            title="No Posts Yet"
            description="Be the first to share your knowledge with the community!"
            actionLabel="Create Post"
            onAction={() => navigation.navigate("CreatePost")}
          />
        }
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: tabBarHeight + Spacing.xxl,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl + 20,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
  },
  list: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
  },
});
