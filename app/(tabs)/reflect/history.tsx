import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react-native';
import { spacing, borderRadius, shadows } from '../../../src/theme';
import { useTheme } from '../../../src/context';
import { supabase } from '../../../lib/supabase';
import { DailyReflection } from '../../../src/lib/reflections';
import {
  HistoryFilter,
  fetchReflections,
  formatDateDisplay,
  getMoodInfo,
  truncateText,
} from '../../../src/lib/reflectionHistory';

export default function HistoryScreen() {
  const router = useRouter();
  const { theme, isDark, gradients } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userId, setUserId] = useState<string>('local');
  const [filter, setFilter] = useState<HistoryFilter>('month');
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadReflections(true);
    }
  }, [filter, userId]);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || 'local');
  };

  const loadReflections = async (reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
      setCursor(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await fetchReflections(
        userId,
        filter,
        reset ? undefined : cursor || undefined
      );

      if (reset) {
        setReflections(result.data);
      } else {
        setReflections(prev => [...prev, ...result.data]);
      }
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('[History] Error loading:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleFilterChange = (newFilter: HistoryFilter) => {
    if (newFilter !== filter) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFilter(newFilter);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadReflections(false);
    }
  };

  const handleItemPress = (dateISO: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/reflect/${dateISO}`);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderFilterChip = (label: string, value: HistoryFilter) => (
    <Pressable
      key={value}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: filter === value
            ? (isDark ? 'rgba(244, 198, 204, 0.2)' : 'rgba(244, 198, 204, 0.15)')
            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'),
          borderColor: filter === value ? theme.primary : theme.borderLight,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => handleFilterChange(value)}
    >
      <Text style={[
        styles.filterChipText,
        { color: filter === value ? theme.primary : theme.textSecondary },
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderItem = ({ item }: { item: DailyReflection }) => {
    const moodInfo = getMoodInfo(item.mood);
    const snippet = truncateText(item.content, 80);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.itemCard,
          { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.9)' },
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => handleItemPress(item.reflection_date)}
      >
        <View style={styles.itemHeader}>
          <Text style={[styles.itemDate, { color: theme.text }]}>
            {formatDateDisplay(item.reflection_date)}
          </Text>
          {moodInfo && (
            <View style={[styles.moodChip, {
              backgroundColor: isDark ? 'rgba(244, 198, 204, 0.15)' : 'rgba(244, 198, 204, 0.12)',
            }]}>
              <Text style={styles.moodEmoji}>{moodInfo.emoji}</Text>
              <Text style={[styles.moodLabel, { color: theme.textSecondary }]}>
                {moodInfo.label}
              </Text>
            </View>
          )}
        </View>
        {snippet ? (
          <Text style={[styles.itemSnippet, { color: theme.textSecondary }]} numberOfLines={2}>
            {snippet}
          </Text>
        ) : (
          <Text style={[styles.itemSnippet, { color: theme.textMuted, fontStyle: 'italic' }]}>
            No content
          </Text>
        )}
        <View style={styles.itemArrow}>
          <ChevronRight size={16} color={theme.textMuted} />
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FileText size={48} color={theme.textMuted} style={{ marginBottom: spacing.md }} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No reflections yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Start your daily reflections to see them here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[styles.skeletonCard, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.5)' }]}
        >
          <View style={[styles.skeletonLine, styles.skeletonTitle, { backgroundColor: theme.borderLight }]} />
          <View style={[styles.skeletonLine, styles.skeletonText, { backgroundColor: theme.borderLight }]} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDark ? gradients.lavenderBloom as [string, string, ...string[]] : ['#FFF6F2', '#EADBD4']}
        style={styles.gradientBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleBack}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={18} color={theme.primary} />
            <Text style={[styles.backButtonText, { color: theme.primary }]}>Back</Text>
          </View>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Reflection History</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {renderFilterChip('This week', 'week')}
        {renderFilterChip('This month', 'month')}
        {renderFilterChip('All', 'all')}
      </View>

      {/* Content */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={reflections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  itemCard: {
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '600',
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  moodEmoji: {
    fontSize: 12,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemSnippet: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemArrow: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
  },
  skeletonCard: {
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  skeletonLine: {
    borderRadius: 4,
  },
  skeletonTitle: {
    width: '40%',
    height: 16,
    marginBottom: spacing.sm,
  },
  skeletonText: {
    width: '80%',
    height: 14,
  },
});
