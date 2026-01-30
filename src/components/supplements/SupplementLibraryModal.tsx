import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SupplementInfo, SupplementCategory } from '../../types/supplement';
import { SUPPLEMENT_CATALOG } from '../../constants/supplements';
import { useHabitStore, useSupplementStore } from '../../stores';
import { CategoryFilterBar } from './CategoryFilterBar';
import { SupplementCard } from './SupplementCard';
import { SupplementDetailView } from './SupplementDetailView';
import { HealthDisclaimer } from './HealthDisclaimer';
import { theme, spacing, borderRadius, shadows } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SupplementLibraryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupplementLibraryModal: React.FC<SupplementLibraryModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SupplementCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplement, setSelectedSupplement] = useState<SupplementInfo | null>(null);

  const { addSupplementHabit, habits } = useHabitStore();
  const { markSupplementAdded, addedSupplementIds } = useSupplementStore();

  // Get list of supplement IDs already added as habits
  const addedIds = useMemo(() => {
    const idsFromHabits = habits
      .filter(h => h.category === 'supplements' && h.supplementMeta?.supplementInfoId)
      .map(h => h.supplementMeta!.supplementInfoId!);
    return new Set([...idsFromHabits, ...addedSupplementIds]);
  }, [habits, addedSupplementIds]);

  // Filter supplements based on category and search
  const filteredSupplements = useMemo(() => {
    let results = SUPPLEMENT_CATALOG;

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(s => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.benefits.some(b => b.toLowerCase().includes(query))
      );
    }

    return results;
  }, [selectedCategory, searchQuery]);

  const handleSelectSupplement = (supplement: SupplementInfo) => {
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

    // Go back to list
    setSelectedSupplement(null);
  };

  const handleClose = () => {
    setSelectedSupplement(null);
    setSearchQuery('');
    setSelectedCategory('all');
    onClose();
  };

  const handleBackFromDetail = () => {
    setSelectedSupplement(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      {selectedSupplement ? (
        <SupplementDetailView
          supplement={selectedSupplement}
          isAdded={addedIds.has(selectedSupplement.id)}
          onAddToHabits={handleAddToHabits}
          onClose={handleBackFromDetail}
        />
      ) : (
        <View style={styles.container}>
          <LinearGradient
            colors={['#FAE8ED', '#F5EBF8', '#FAF5FC']}
            style={styles.gradientBackground}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Supplement Library</Text>
                <Text style={styles.headerSubtitle}>
                  {SUPPLEMENT_CATALOG.length} supplements to explore
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search supplements..."
                placeholderTextColor={theme.textMuted}
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Category Filter */}
          <CategoryFilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Supplement List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Health Disclaimer at top */}
            <View style={styles.disclaimerContainer}>
              <HealthDisclaimer compact />
            </View>

            {filteredSupplements.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No supplements found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : (
              filteredSupplements.map((supplement) => (
                <SupplementCard
                  key={supplement.id}
                  supplement={supplement}
                  isAdded={addedIds.has(supplement.id)}
                  onPress={() => handleSelectSupplement(supplement)}
                />
              ))
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  closeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: theme.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    fontSize: 14,
    color: theme.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  disclaimerContainer: {
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
