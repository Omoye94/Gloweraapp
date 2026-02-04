import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Plus, Check, Trash2 } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useSupplementStore } from '../../stores/supplementStore';
import { Supplement, SupplementTimeOfDay } from '../../types';
import { colors, supplementTimeLabels } from '../../lib/constants';
import WeeklyConsistencyView from './WeeklyConsistencyView';
import AddSupplementModal from './AddSupplementModal';

interface SupplementCabinetModalProps {
  visible: boolean;
  onClose: () => void;
}

const timeGroups: SupplementTimeOfDay[] = ['morning', 'afternoon', 'evening', 'anytime'];

export default function SupplementCabinetModal({ visible, onClose }: SupplementCabinetModalProps) {
  const { user } = useAuthStore();
  const {
    supplements,
    isSupplementTakenToday,
    takeSupplement,
    untakeSupplement,
    deleteSupplement,
    fetchWeekLogs,
    getWeekConsistency,
  } = useSupplementStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (visible && user?.id) {
      fetchWeekLogs(user.id);
    }
  }, [visible, user?.id]);

  const weekData = getWeekConsistency();

  const groupedSupplements = timeGroups
    .map(time => ({
      time,
      label: supplementTimeLabels[time],
      items: supplements.filter(s => s.time_of_day === time),
    }))
    .filter(group => group.items.length > 0);

  const handleToggle = async (supplement: Supplement) => {
    if (!user?.id) return;
    const log = isSupplementTakenToday(supplement.id);
    if (log) {
      await untakeSupplement(log.id);
    } else {
      await takeSupplement(supplement.id, user.id);
    }
  };

  const handleDelete = (supplement: Supplement) => {
    Alert.alert(
      'Remove Supplement',
      `Remove "${supplement.name}" from your cabinet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteSupplement(supplement.id),
        },
      ]
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-text">Supplement Cabinet</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            {supplements.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-5xl mb-4">💊</Text>
                <Text className="text-text font-semibold text-lg mb-2">
                  No supplements yet
                </Text>
                <Text className="text-text-light text-center mb-6">
                  Add your daily vitamins and supplements to track them here
                </Text>
                <TouchableOpacity
                  className="bg-primary px-6 py-3 rounded-soft"
                  onPress={() => setShowAddModal(true)}
                >
                  <Text className="text-white font-medium">Add First Supplement</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Grouped supplements */}
                {groupedSupplements.map(group => (
                  <View key={group.time} className="mb-6">
                    <Text className="text-sm font-medium text-text-light mb-2 uppercase tracking-wider">
                      {group.label}
                    </Text>
                    {group.items.map(supplement => {
                      const log = isSupplementTakenToday(supplement.id);
                      const isTaken = !!log;

                      return (
                        <View
                          key={supplement.id}
                          className="bg-surface rounded-soft p-4 mb-2 flex-row items-center"
                        >
                          {/* Check button */}
                          <TouchableOpacity
                            className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                              isTaken ? '' : 'border-2'
                            }`}
                            style={{
                              backgroundColor: isTaken ? supplement.color : '#FFFFFF',
                              borderColor: isTaken ? undefined : supplement.color,
                            }}
                            onPress={() => handleToggle(supplement)}
                          >
                            {isTaken && <Check size={16} color="#4A4A4A" strokeWidth={3} />}
                          </TouchableOpacity>

                          {/* Info */}
                          <View className="flex-1">
                            <Text
                              className={`font-medium text-base ${
                                isTaken ? 'text-text-light line-through' : 'text-text'
                              }`}
                            >
                              {supplement.name}
                            </Text>
                            {supplement.dosage && (
                              <Text className="text-text-light text-sm">
                                {supplement.dosage}
                              </Text>
                            )}
                          </View>

                          {/* Points badge */}
                          {isTaken && (
                            <View className="bg-success/20 px-2 py-1 rounded-full mr-2">
                              <Text className="text-success text-xs font-medium">+5</Text>
                            </View>
                          )}

                          {/* Delete */}
                          <TouchableOpacity
                            className="p-1"
                            onPress={() => handleDelete(supplement)}
                          >
                            <Trash2 size={16} color={colors.textLight} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                ))}

                {/* Weekly consistency */}
                <View className="bg-surface rounded-softer p-4 mb-8">
                  <WeeklyConsistencyView data={weekData} />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      <AddSupplementModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
