import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TextInput } from "@/components/TextInput";
import { PostCard } from "@/components/PostCard";
import { UserAvatar } from "@/components/UserAvatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Categories } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Post, User } from "@shared/schema";

interface PostWithAuthor extends Post {
  author: User;
  isUpvoted: boolean;
  isSaved: boolean;
}

type SearchTab = "all" | "posts" | "users" | "categories";

export default function SearchScreen() {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");

  const { data: searchResults, isLoading } = useQuery<{
    posts: PostWithAuthor[];
    users: User[];
  }>({
    queryKey: ["/api/search", { q: query }],
    enabled: query.length >= 2,
  });

  const tabs: { key: SearchTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "posts", label: "Posts" },
    { key: "users", label: "Users" },
    { key: "categories", label: "Categories" },
  ];

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      style={[styles.userItem, { backgroundColor: theme.backgroundDefault }]}
      onPress={() => navigation.navigate("UserProfile", { userId: item.id })}
    >
      <UserAvatar uri={item.profilePicUrl} size="medium" />
      <View style={styles.userInfo}>
        <ThemedText type="body" style={styles.userName}>
          {item.name}
        </ThemedText>
        {item.expertise ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.expertise}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <Pressable
      style={[
        styles.categoryItem,
        { backgroundColor: theme.backgroundDefault },
      ]}
      onPress={() => {
        navigation.goBack();
      }}
    >
      <CategoryBadge category={item} />
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );

  const renderContent = () => {
    if (!query) {
      return (
        <View style={styles.emptySearch}>
          <View
            style={[
              styles.searchIcon,
              { backgroundColor: theme.primary + "15" },
            ]}
          >
            <Feather name="search" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h4" style={styles.emptyTitle}>
            Search KnowledgeHub
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.emptyDescription, { color: theme.textSecondary }]}
          >
            Find posts, users, and categories
          </ThemedText>
        </View>
      );
    }

    if (query.length < 2) {
      return (
        <View style={styles.emptySearch}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Type at least 2 characters to search
          </ThemedText>
        </View>
      );
    }

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (activeTab === "categories") {
      const filteredCategories = Categories.filter((c) =>
        c.toLowerCase().includes(query.toLowerCase())
      );
      return (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="folder"
              title="No Categories Found"
              description="Try a different search term"
            />
          }
        />
      );
    }

    if (activeTab === "users" || activeTab === "all") {
      const users = searchResults?.users || [];
      if (activeTab === "users") {
        return (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                icon="users"
                title="No Users Found"
                description="Try a different search term"
              />
            }
          />
        );
      }
    }

    if (activeTab === "posts" || activeTab === "all") {
      const posts = searchResults?.posts || [];
      return (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <PostCard post={item} author={item.author} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="file-text"
              title="No Posts Found"
              description="Try a different search term"
            />
          }
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.wrapper}>
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Feather name="search" size={20} color={theme.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              style={styles.input}
              autoFocus
            />
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <ThemedText type="body" style={{ color: theme.primary }}>
              Cancel
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && {
                  backgroundColor: theme.primary + "15",
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <ThemedText
                type="small"
                style={{
                  color:
                    activeTab === tab.key
                      ? theme.primary
                      : theme.textSecondary,
                  fontWeight: activeTab === tab.key ? "600" : "400",
                }}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    paddingTop: 80, // Increased top padding
    paddingHorizontal: Spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
  tabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
  },
  list: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  emptySearch: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  searchIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    textAlign: "center",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    fontWeight: "600",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
});
