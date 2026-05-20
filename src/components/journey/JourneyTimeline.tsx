import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { JourneyEvent } from '../../types/journey';
import { JourneyItem } from './JourneyItem';
import { spacing } from '../../theme';
import { useTheme } from '../../context';

interface JourneyTimelineProps {
  events: JourneyEvent[];
  onRefresh: () => void;
  refreshing: boolean;
}

export function JourneyTimeline({ events, onRefresh, refreshing }: JourneyTimelineProps) {
  const { theme } = useTheme();

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Sparkles size={48} color={theme.textMuted} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Your journey is just beginning</Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
          Complete habits, write reflections, and grow your garden to see your story unfold here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <JourneyItem event={item} isLast={index === events.length - 1} />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'DMSans',
    textAlign: 'center',
    lineHeight: 20,
  },
});
