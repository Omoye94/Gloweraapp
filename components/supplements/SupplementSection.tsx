import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Pill, Plus } from 'lucide-react-native';
import { useSupplementStore } from '../../stores/supplementStore';
import { colors } from '../../lib/constants';
import SupplementPill from './SupplementPill';
import SupplementCabinetModal from './SupplementCabinetModal';
import AddSupplementModal from './AddSupplementModal';

interface SupplementSectionProps {
  onMessage?: (message: string) => void;
}

export default function SupplementSection({ onMessage }: SupplementSectionProps) {
  const { supplements, getTodayProgress } = useSupplementStore();
  const [showCabinet, setShowCabinet] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const { taken, total } = getTodayProgress();
  const progressPercent = total > 0 ? (taken / total) * 100 : 0;

  // Empty state
  if (supplements.length === 0) {
    return (
      <>
        <View className="px-6 mb-6">
          <View className="bg-surface rounded-softer p-4">
            <View className="flex-row items-center mb-3">
              <Pill size={18} color={colors.primary} />
              <Text className="text-text font-semibold ml-2">My Supplements</Text>
            </View>
            <Text className="text-text-light text-sm mb-3">
              Track your daily vitamins and supplements
            </Text>
            <TouchableOpacity
              className="bg-primary/10 py-2 px-4 rounded-full self-start"
              onPress={() => setShowAdd(true)}
            >
              <Text className="text-primary font-medium text-sm">+ Add Supplement</Text>
            </TouchableOpacity>
          </View>
        </View>
        <AddSupplementModal visible={showAdd} onClose={() => setShowAdd(false)} />
      </>
    );
  }

  return (
    <>
      <View className="px-6 mb-6">
        <View className="bg-surface rounded-softer p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Pill size={18} color={colors.primary} />
              <Text className="text-text font-semibold ml-2">My Supplements</Text>
              <View className="bg-primary/10 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-primary text-xs font-medium">
                  {taken}/{total}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowCabinet(true)}>
              <Text className="text-primary text-sm font-medium">Manage</Text>
            </TouchableOpacity>
          </View>

          {/* Pill row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {supplements.map(supplement => (
              <SupplementPill
                key={supplement.id}
                supplement={supplement}
                onTake={onMessage}
              />
            ))}
            <TouchableOpacity
              className="w-11 h-11 rounded-full border-2 border-dashed border-primary/30 items-center justify-center"
              onPress={() => setShowAdd(true)}
            >
              <Plus size={16} color={colors.primary} />
            </TouchableOpacity>
          </ScrollView>

          {/* Mini progress bar */}
          <View className="mt-3 h-1.5 bg-primary/10 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressPercent >= 100 ? colors.success : colors.primary,
              }}
            />
          </View>
        </View>
      </View>

      <SupplementCabinetModal
        visible={showCabinet}
        onClose={() => setShowCabinet(false)}
      />
      <AddSupplementModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}
