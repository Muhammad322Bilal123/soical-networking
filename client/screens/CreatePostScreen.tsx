import React, { useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HeaderButton } from "@react-navigation/elements";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput } from "@/components/TextInput";
import { CategoryBadge } from "@/components/CategoryBadge";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { Spacing, Categories } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function CreatePostScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  const isValid = title.trim().length > 0 && content.trim().length > 0 && category;

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/posts", {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.trim() || null,
        authorId: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create post");
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={() => navigation.goBack()}>
          <ThemedText type="body" style={{ color: theme.primary }}>
            Cancel
          </ThemedText>
        </HeaderButton>
      ),
      headerRight: () => (
        <HeaderButton
          onPress={() => createPostMutation.mutate()}
          disabled={!isValid || createPostMutation.isPending}
        >
          {createPostMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText
              type="body"
              style={{
                color: isValid ? theme.primary : theme.textSecondary,
                fontWeight: "600",
              }}
            >
              Publish
            </ThemedText>
          )}
        </HeaderButton>
      ),
    });
  }, [navigation, theme, isValid, createPostMutation.isPending]);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xl * 2,
            paddingBottom: insets.bottom + Spacing.xl * 2,
          },
        ]}
      >
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What's your knowledge about?"
          maxLength={100}
        />

        <View style={styles.field}>
          <ThemedText type="small" style={styles.label}>
            Category
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {Categories.map((cat) => (
              <CategoryBadge
                key={cat}
                category={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" style={styles.label}>
            Content
          </ThemedText>
          <View
            style={[
              styles.contentInput,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share your knowledge, insights, or guide..."
              multiline
              maxLength={2000}
              style={styles.textArea}
            />
          </View>
          <ThemedText
            type="caption"
            style={[styles.charCount, { color: theme.textSecondary }]}
          >
            {content.length}/2000
          </ThemedText>
        </View>

        <TextInput
          label="Tags (optional)"
          value={tags}
          onChangeText={setTags}
          placeholder="e.g., programming, tips, tutorial"
        />
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  categories: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 200,
  },
  textArea: {
    height: "100%",
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    marginTop: Spacing.xs,
  },
});
