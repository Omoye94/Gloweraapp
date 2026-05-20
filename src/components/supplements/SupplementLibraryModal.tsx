import React, { useState, useMemo, useEffect } from 'react';
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
import { Search, X, Plus, ChevronRight } from 'lucide-react-native';
import { SupplementInfo, SupplementCategory, WellnessGoal } from '../../types/supplement';
import { SUPPLEMENT_CATALOG, WELLNESS_GOALS } from '../../constants/supplements';
import { useHabitStore, useSupplementStore } from '../../stores';
import { CategoryFilterBar } from './CategoryFilterBar';
import { SupplementCard } from './SupplementCard';
import { SupplementDetailView } from './SupplementDetailView';
import { HealthDisclaimer } from './HealthDisclaimer';
import { CreateCustomSupplementModal } from './CreateCustomSupplementModal';
import { theme, spacing, borderRadius, shadows } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SupplementLibraryModalProps {
  visible: boolean;
  onClose: () => void;
  initialGoalFilter?: WellnessGoal;
}

export const SupplementLibraryModal: React.FC<SupplementLibraryModalProps> = ({
  visible,
  onClose,
  initialGoalFilter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SupplementCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplement, setSelectedSupplement] = useState<SupplementInfo | null>(null);
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [goalFilter, setGoalFilter] = useState<WellnessGoal | null>(null);

  useEffect(() => {
    if (visible && initialGoalFilter) {
      setGoalFilter(initialGoalFilter);
    }
    if (!visible) {
      setGoalFilter(null);
    }
  }, [visible, initialGoalFilter]);

  const { addSupplementHabit, habits } = useHabitStore();
  const { markSupplementAdded } = useSupplementStore();

  // Derive "already added" purely from the live habits list to avoid stale state
  const addedIds = useMemo(() => {
    return new Set(
      habits
        .filter(h => h.category === 'supplements' && h.supplementMeta?.supplementInfoId)
        .map(h => h.supplementMeta!.supplementInfoId!)
    );
  }, [habits]);

  // Filter supplements based on category, search, and goal
  const filteredSupplements = useMemo(() => {
    let results = SUPPLEMENT_CATALOG;

    // Filter by wellness goal
    if (goalFilter) {
      results = results.filter(s => s.tags.includes(goalFilter));
    }

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
  }, [selectedCategory, searchQuery, goalFilter]);

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

    // Let the "Added" animation play before going back to list
    setTimeout(() => {
      setSelectedSupplement(null);
    }, 1200);
  };

  const handleClose = () => {
    setSelectedSupplement(null);
    setSearchQuery('');
    setSelectedCategory('all');
    setGoalFilter(null);
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
            colors={['#FBF7F7', '#EDE4DC']}
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
              <Search size={16} color={theme.textMuted} strokeWidth={2} style={{ marginRight: spacing.sm }} />
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
                  <X size={14} color={theme.textMuted} strokeWidth={2} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Active Goal Filter Chip */}
          {goalFilter && (() => {
            const goalInfo = WELLNESS_GOALS.find(g => g.id === goalFilter);
            return goalInfo ? (
              <View style={styles.goalFilterContainer}>
                <Pressable
                  onPress={() => setGoalFilter(null)}
                  style={({ pressed }) => [
                    styles.goalFilterChip,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.goalFilterText}>
                    {goalInfo.icon} {goalInfo.name}
                  </Text>
                  <X size={14} color="#3A2E2B" strokeWidth={2} style={{ marginLeft: 6 }} />
                </Pressable>
              </View>
            ) : null;
          })()}

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

            {/* Create Custom Card */}
            <Pressable
              onPress={() => {
                setShowCreateCustom(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                styles.createCustomCard,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              ]}
            >
              <View style={styles.createCustomIcon}>
                <Plus size={22} color="#F2B4CC" strokeWidth={1.5} />
              </View>
              <View style={styles.createCustomContent}>
                <Text style={styles.createCustomTitle}>Create Custom Supplement</Text>
                <Text style={styles.createCustomSubtitle}>
                  Add your own supplement to track
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} strokeWidth={1.5} />
            </Pressable>

            {filteredSupplements.length === 0 ? (
              <View style={styles.emptyState}>
                <Search size={48} color={theme.textMuted} strokeWidth={1.5} style={{ marginBottom: spacing.md }} />
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
      {/* Create Custom Supplement Modal */}
      <CreateCustomSupplementModal
        visible={showCreateCustom}
        onClose={() => setShowCreateCustom(false)}
        onAdded={handleClose}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F7',
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
    color: '#3A2E2B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B5B52',
  },
  closeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F2B4CC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#EDE4DC',
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: '#3A2E2B',
  },
  clearButton: {
    padding: spacing.xs,
  },
  goalFilterContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  goalFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    backgroundColor: '#FBF7F7',
    borderWidth: 1,
    borderColor: '#EDE4DC',
  },
  goalFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A2E2B',
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
  createCustomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#EDE4DC',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  createCustomIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EDE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  createCustomContent: {
    flex: 1,
  },
  createCustomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 2,
  },
  createCustomSubtitle: {
    fontSize: 13,
    color: '#6B5B52',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B5B52',
    textAlign: 'center',
  },
});
