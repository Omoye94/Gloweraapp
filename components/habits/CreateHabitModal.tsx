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
import { useHabitStore } from '../../stores/habitStore';
import { HabitCategory, HabitFrequency } from '../../types';
import {
  categoryLabels,
  categoryColors,
  defaultHabitSuggestions,
  colors,
} from '../../lib/constants';

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const categories: HabitCategory[] = [
  'nutrition',
  'movement',
  'supplements',
  'hobbies',
  'self_care',
  'reflection',
];

const frequencies: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const weekdays = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

export default function CreateHabitModal({ visible, onClose }: CreateHabitModalProps) {
  const { user } = useAuthStore();
  const { createHabit, isLoading } = useHabitStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('self_care');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const resetForm = () => {
    setName('');
    setCategory('self_care');
    setFrequency('daily');
    setCustomDays([]);
    setStep(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!user?.id || !name.trim()) return;

    await createHabit({
      user_id: user.id,
      name: name.trim(),
      description: null,
      category,
      icon: 'star',
      color: categoryColors[category],
      frequency,
      custom_days: frequency === 'custom' ? customDays : null,
      is_active: true,
    });

    handleClose();
  };

  const toggleDay = (day: string) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setName(suggestion);
    setStep(1);
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
          <Text className="text-lg font-semibold text-text">New Habit</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          {step === 0 ? (
            <>
              {/* Category Selection */}
              <Text className="text-xl font-bold text-text mb-4">
                What kind of habit?
              </Text>
              <View className="flex-row flex-wrap justify-between mb-6">
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    className={`w-[48%] mb-3 p-4 rounded-soft border-2 ${
                      category === cat ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: `${categoryColors[cat]}40` }}
                    onPress={() => setCategory(cat)}
                  >
                    <Text className="font-medium text-text">
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Suggestions */}
              <Text className="text-lg font-semibold text-text mb-3">
                Suggestions for {categoryLabels[category]}
              </Text>
              <View className="space-y-2">
                {defaultHabitSuggestions[category].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-surface p-4 rounded-soft"
                    onPress={() => selectSuggestion(suggestion)}
                  >
                    <Text className="text-text">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Input */}
              <Text className="text-lg font-semibold text-text mt-6 mb-3">
                Or create your own
              </Text>
              <TextInput
                className="bg-surface border border-primary/20 rounded-soft px-4 py-4 text-text"
                placeholder="Enter habit name..."
                placeholderTextColor="#8A8A8A"
                value={name}
                onChangeText={setName}
                onSubmitEditing={() => name.trim() && setStep(1)}
              />

              <TouchableOpacity
                className={`mt-6 py-4 rounded-soft items-center ${
                  name.trim() ? 'bg-primary' : 'bg-primary/30'
                }`}
                onPress={() => setStep(1)}
                disabled={!name.trim()}
              >
                <Text className="text-white font-semibold">Continue</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Frequency Selection */}
              <Text className="text-xl font-bold text-text mb-2">
                How often?
              </Text>
              <Text className="text-text-light mb-4">
                "{name}"
              </Text>

              <View className="flex-row space-x-3 mb-6">
                {frequencies.map(freq => (
                  <TouchableOpacity
                    key={freq.value}
                    className={`flex-1 py-3 rounded-soft items-center ${
                      frequency === freq.value
                        ? 'bg-primary'
                        : 'bg-surface border border-primary/20'
                    }`}
                    onPress={() => setFrequency(freq.value)}
                  >
                    <Text
                      className={`font-medium ${
                        frequency === freq.value ? 'text-white' : 'text-text'
                      }`}
                    >
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {frequency === 'custom' && (
                <View className="mb-6">
                  <Text className="text-text font-medium mb-3">Select days</Text>
                  <View className="flex-row justify-between">
                    {weekdays.map(day => (
                      <TouchableOpacity
                        key={day.value}
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          customDays.includes(day.value)
                            ? 'bg-primary'
                            : 'bg-surface border border-primary/20'
                        }`}
                        onPress={() => toggleDay(day.value)}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            customDays.includes(day.value) ? 'text-white' : 'text-text'
                          }`}
                        >
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View className="flex-row space-x-3 mt-4">
                <TouchableOpacity
                  className="flex-1 py-4 rounded-soft items-center bg-surface border border-primary/20"
                  onPress={() => setStep(0)}
                >
                  <Text className="text-text font-medium">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 rounded-soft items-center ${
                    isLoading ? 'bg-primary/50' : 'bg-primary'
                  }`}
                  onPress={handleCreate}
                  disabled={isLoading || (frequency === 'custom' && customDays.length === 0)}
                >
                  <Text className="text-white font-semibold">
                    {isLoading ? 'Creating...' : 'Create Habit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
