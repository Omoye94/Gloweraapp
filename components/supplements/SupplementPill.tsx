import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Supplement } from '../../types';
import { useSupplementStore } from '../../stores/supplementStore';
import { useAuthStore } from '../../stores/authStore';

interface SupplementPillProps {
  supplement: Supplement;
  onTake?: (message: string) => void;
}

export default function SupplementPill({ supplement, onTake }: SupplementPillProps) {
  const { user } = useAuthStore();
  const { takeSupplement, untakeSupplement, isSupplementTakenToday } = useSupplementStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const log = isSupplementTakenToday(supplement.id);
  const isTaken = !!log;
  const initial = supplement.name.charAt(0).toUpperCase();

  const handlePress = async () => {
    if (!user?.id || isProcessing) return;

    if (isTaken) return; // Tap does nothing when already taken; use long-press

    setIsProcessing(true);
    const { message } = await takeSupplement(supplement.id, user.id);
    if (message) onTake?.(message);
    setIsProcessing(false);
  };

  const handleLongPress = async () => {
    if (!log || isProcessing) return;

    setIsProcessing(true);
    await untakeSupplement(log.id);
    setIsProcessing(false);
  };

  return (
    <View className="items-center mr-3">
      <TouchableOpacity
        className={`w-11 h-11 rounded-full items-center justify-center ${
          isTaken ? '' : 'border-2'
        }`}
        style={{
          backgroundColor: isTaken ? supplement.color : '#FFFFFF',
          borderColor: isTaken ? undefined : supplement.color,
          opacity: isProcessing ? 0.5 : 1,
        }}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        {isTaken ? (
          <Check size={18} color="#4A4A4A" strokeWidth={3} />
        ) : (
          <Text className="text-text font-semibold text-sm">{initial}</Text>
        )}
      </TouchableOpacity>
      <Text className="text-text-light text-[10px] mt-1 max-w-[48px] text-center" numberOfLines={1}>
        {supplement.name}
      </Text>
    </View>
  );
}
