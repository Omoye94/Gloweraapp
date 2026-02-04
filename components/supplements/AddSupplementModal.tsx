import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useSupplementStore } from '../../stores/supplementStore';
import { SupplementTimeOfDay } from '../../types';
import {
  colors,
  supplementTimeLabels,
  defaultSupplementSuggestions,
} from '../../lib/constants';

interface AddSupplementModalProps {
  visible: boolean;
  onClose: () => void;
}

const timeOptions: SupplementTimeOfDay[] = ['morning', 'afternoon', 'evening', 'anytime'];

export default function AddSupplementModal({ visible, onClose }: AddSupplementModalProps) {
  const { user } = useAuthStore();
  const { createSupplement, isLoading } = useSupplementStore();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<SupplementTimeOfDay>('morning');

  const resetForm = () => {
    setName('');
    setDosage('');
    setTimeOfDay('morning');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectSuggestion = (suggestion: { name: string; dosage: string }) => {
    setName(suggestion.name);
    setDosage(suggestion.dosage);
  };

  const handleCreate = async () => {
    if (!user?.id || !name.trim()) return;

    await createSupplement({
      user_id: user.id,
      name: name.trim(),
      dosage: dosage.trim() || null,
      time_of_day: timeOfDay,
      icon: 'pill',
      color: '#D4FFE0',
      is_active: true,
    });

    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-background"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-text">Add Supplement</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          {/* Quick suggestions */}
          <Text className="text-sm font-medium text-text-light mb-3">Quick Add</Text>
          <View className="flex-row flex-wrap mb-6">
            {defaultSupplementSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                  name === suggestion.name ? 'bg-primary' : 'bg-surface border border-primary/20'
                }`}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <Text
                  className={`text-sm ${
                    name === suggestion.name ? 'text-white font-medium' : 'text-text'
                  }`}
                >
                  {suggestion.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name input */}
          <Text className="text-sm font-medium text-text mb-2">Name</Text>
          <TextInput
            className="bg-surface border border-primary/20 rounded-soft px-4 py-4 text-text mb-4"
            placeholder="Supplement name..."
            placeholderTextColor="#8A8A8A"
            value={name}
            onChangeText={setName}
          />

          {/* Dosage input */}
          <Text className="text-sm font-medium text-text mb-2">Dosage (optional)</Text>
          <TextInput
            className="bg-surface border border-primary/20 rounded-soft px-4 py-4 text-text mb-6"
            placeholder="e.g. 2000 IU, 500 mg..."
            placeholderTextColor="#8A8A8A"
            value={dosage}
            onChangeText={setDosage}
          />

          {/* Time of day */}
          <Text className="text-sm font-medium text-text mb-3">Time of Day</Text>
          <View className="flex-row space-x-2 mb-8">
            {timeOptions.map(time => (
              <TouchableOpacity
                key={time}
                className={`flex-1 py-3 rounded-soft items-center ${
                  timeOfDay === time
                    ? 'bg-primary'
                    : 'bg-surface border border-primary/20'
                }`}
                onPress={() => setTimeOfDay(time)}
              >
                <Text
                  className={`text-xs font-medium ${
                    timeOfDay === time ? 'text-white' : 'text-text'
                  }`}
                >
                  {supplementTimeLabels[time]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Create button */}
          <TouchableOpacity
            className={`py-4 rounded-soft items-center mb-6 ${
              name.trim() && !isLoading ? 'bg-primary' : 'bg-primary/30'
            }`}
            onPress={handleCreate}
            disabled={!name.trim() || isLoading}
          >
            <Text className="text-white font-semibold">
              {isLoading ? 'Adding...' : 'Add Supplement'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
