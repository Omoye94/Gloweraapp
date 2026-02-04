import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore, useSupplementStore } from '../../src/stores';
import {
  GlowStackHeader,
  SupplementHabitList,
  SupplementLibraryModal,
  GoalsSelectionModal,
  SupplementDetailView,
} from '../../src/components/supplements';
import { SupplementInfo } from '../../src/types/supplement';
import { theme, spacing, borderRadius, shadows } from '../../src/theme';

export default function GlowStackScreen() {
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState<SupplementInfo | null>(null);

  const { getSuggestions, hasGoals } = useSupplementStore();
  const { addSupplementHabit, habits } = useHabitStore();
  const { markSupplementAdded, addedSupplementIds } = useSupplementStore();

  const suggestions = getSuggestions(3);

  // Get list of supplement IDs already added as habits
  const addedIds = useMemo(() => {
    const idsFromHabits = habits
      .filter(h => h.category === 'supplements' && h.supplementMeta?.supplementInfoId)
      .map(h => h.supplementMeta!.supplementInfoId!);
    return new Set([...idsFromHabits, ...addedSupplementIds]);
  }, [habits, addedSupplementIds]);

  const handleBrowseSupplements = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowLibraryModal(true);
  };

  const handleEditGoals = () => {
    setShowGoalsModal(true);
  };

  const handleViewSupplement = (supplement: SupplementInfo) => {
    setSelectedSupplement(supplement);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddToHabits = (dosage: string, timing: string, notes: string) => {
    if (!selectedSupplement) return;

    addSupplementHabit(selectedSupplement, {
      dosage,
      timingPreference: timing,
      notes,
    });
    markSupplementAdded(selectedSupplement.id);
    setSelectedSupplement(null);
  };

  const handleBackFromDetail = () => {
    setSelectedSupplement(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FAE8ED', '#F5EBF8', '#E8D9F0']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Glow Stack</Text>
          <Text style={styles.subtitle}>Your supplement journey</Text>
        </View>

        {/* Wellness Focus */}
        <GlowStackHeader onEditGoals={handleEditGoals} />

        {/* Today's Supplements */}
        <SupplementHabitList onBrowseSupplements={handleBrowseSupplements} />

        {/* Suggested For You - Only show if has goals and suggestions */}
        {hasGoals() && suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <LinearGradient
              colors={['rgba(158, 207, 176, 0.1)', 'rgba(212, 196, 232, 0.1)']}
              style={styles.suggestionsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionLabel}>SUGGESTED FOR YOU</Text>
              </View>
              <Pressable
                onPress={handleBrowseSupplements}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>

            <View style={styles.suggestionsList}>
              {suggestions.map((supplement) => (
                <Pressable
                  key={supplement.id}
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    pressed && styles.suggestionItemPressed,
                  ]}
                  onPress={() => handleViewSupplement(supplement)}
                >
                  <View style={styles.suggestionIcon}>
                    <Text style={styles.suggestionIconText}>{supplement.icon}</Text>
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {supplement.name}
                    </Text>
                    <Text style={styles.suggestionBenefit} numberOfLines={1}>
                      {supplement.benefits[0]}
                    </Text>
                  </View>
                  <Text style={styles.suggestionArrow}>›</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.suggestionsDisclaimer}>
              Based on your wellness goals
            </Text>
          </View>
        )}

        {/* Browse All Button */}
        <Pressable
          style={({ pressed }) => [
            styles.browseButton,
            pressed && styles.browseButtonPressed,
          ]}
          onPress={handleBrowseSupplements}
        >
          <LinearGradient
            colors={['rgba(212, 196, 232, 0.3)', 'rgba(232, 164, 200, 0.2)']}
            style={styles.browseButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.browseButtonIcon}>+</Text>
          <Text style={styles.browseButtonText}>Browse All Supplements</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <SupplementLibraryModal
        visible={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      />

      <GoalsSelectionModal
        visible={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
      />

      {/* Supplement Detail Modal */}
      {selectedSupplement && (
        <View style={styles.detailOverlay}>
          <SupplementDetailView
            supplement={selectedSupplement}
            isAdded={addedIds.has(selectedSupplement.id)}
            onAddToHabits={handleAddToHabits}
            onClose={handleBackFromDetail}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  // Suggestions Section
  suggestionsSection: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  suggestionsGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.primary,
  },
  suggestionsList: {
    gap: spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 196, 232, 0.2)',
  },
  suggestionItemPressed: {
    opacity: 0.8,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 164, 200, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  suggestionIconText: {
    fontSize: 18,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  suggestionBenefit: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  suggestionArrow: {
    fontSize: 18,
    fontWeight: '300',
    color: theme.textMuted,
  },
  suggestionsDisclaimer: {
    fontSize: 11,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  // Browse Button
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: theme.secondary,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  browseButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  browseButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  browseButtonIcon: {
    fontSize: 20,
    fontWeight: '300',
    color: theme.primary,
    marginRight: spacing.sm,
  },
  browseButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.primary,
  },
  bottomSpacer: {
    height: 120,
  },
  // Detail Overlay
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.surface,
  },
});
