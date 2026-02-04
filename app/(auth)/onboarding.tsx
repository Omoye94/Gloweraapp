import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { FocusArea, ReminderPreference, OnboardingData } from '../../types';
import { categoryLabels, focusAreaDescriptions, categoryColors } from '../../lib/constants';

const { width } = Dimensions.get('window');

const focusAreas: FocusArea[] = [
  'nutrition',
  'movement',
  'supplements',
  'hobbies',
  'self_care',
  'reflection',
];

const reminderOptions: { value: ReminderPreference; label: string; description: string }[] = [
  { value: 'gentle', label: 'Gentle', description: 'Soft, encouraging reminders' },
  { value: 'minimal', label: 'Minimal', description: 'Only essential notifications' },
  { value: 'none', label: 'None', description: 'No reminders at all' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<FocusArea[]>([]);
  const [habitCount, setHabitCount] = useState(3);
  const [reminderPref, setReminderPref] = useState<ReminderPreference>('gentle');
  const { completeOnboarding, isLoading } = useAuthStore();

  const toggleArea = (area: FocusArea) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleComplete = async () => {
    const data: OnboardingData = {
      focusAreas: selectedAreas,
      habitCount,
      reminderPreference: reminderPref,
    };

    await completeOnboarding(data);
    router.replace('/(tabs)/home');
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return selectedAreas.length > 0;
    if (step === 2) return true;
    if (step === 3) return true;
    return false;
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-32 h-32 rounded-full bg-primary/20 items-center justify-center mb-8">
              <View className="w-20 h-20 rounded-full bg-primary/40 items-center justify-center">
                <View className="w-10 h-10 rounded-full bg-primary" />
              </View>
            </View>
            <Text className="text-3xl font-bold text-text text-center mb-4">
              Welcome to Glowera
            </Text>
            <Text className="text-text-light text-center text-lg leading-relaxed">
              Let's personalize your experience so you can glow with every habit.
              This will only take a moment.
            </Text>
          </View>
        );

      case 1:
        return (
          <View className="flex-1 px-6">
            <Text className="text-2xl font-bold text-text mb-2">
              What would you like to focus on?
            </Text>
            <Text className="text-text-light mb-6">
              Select all areas that resonate with you
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {focusAreas.map(area => {
                const isSelected = selectedAreas.includes(area);
                return (
                  <TouchableOpacity
                    key={area}
                    className={`w-[48%] mb-4 p-4 rounded-softer border-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent bg-surface'
                    }`}
                    style={{ backgroundColor: isSelected ? `${categoryColors[area]}40` : '#FFFFFF' }}
                    onPress={() => toggleArea(area)}
                  >
                    <Text className={`font-semibold text-lg mb-1 ${
                      isSelected ? 'text-text' : 'text-text'
                    }`}>
                      {categoryLabels[area]}
                    </Text>
                    <Text className="text-text-light text-sm">
                      {focusAreaDescriptions[area]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 2:
        return (
          <View className="flex-1 px-6">
            <Text className="text-2xl font-bold text-text mb-2">
              How many daily habits feel right?
            </Text>
            <Text className="text-text-light mb-8">
              We recommend starting with 3-5 habits. You can always adjust later.
            </Text>
            <View className="items-center">
              <View className="flex-row items-center justify-center space-x-6">
                <TouchableOpacity
                  className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center"
                  onPress={() => setHabitCount(Math.max(1, habitCount - 1))}
                >
                  <Text className="text-primary text-2xl font-bold">-</Text>
                </TouchableOpacity>
                <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
                  <Text className="text-4xl font-bold text-primary">{habitCount}</Text>
                </View>
                <TouchableOpacity
                  className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center"
                  onPress={() => setHabitCount(Math.min(10, habitCount + 1))}
                >
                  <Text className="text-primary text-2xl font-bold">+</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-text-light mt-6 text-center">
                {habitCount <= 3
                  ? 'A gentle start - perfect for building consistency'
                  : habitCount <= 5
                  ? 'A balanced approach - great for steady growth'
                  : 'Ambitious! Remember, gentle progress is still progress'}
              </Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View className="flex-1 px-6">
            <Text className="text-2xl font-bold text-text mb-2">
              How would you like to be reminded?
            </Text>
            <Text className="text-text-light mb-6">
              We believe in gentle accountability, never pressure
            </Text>
            <View className="space-y-4">
              {reminderOptions.map(option => {
                const isSelected = reminderPref === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    className={`p-5 rounded-softer border-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent bg-surface'
                    }`}
                    onPress={() => setReminderPref(option.value)}
                  >
                    <Text className={`font-semibold text-lg ${
                      isSelected ? 'text-primary' : 'text-text'
                    }`}>
                      {option.label}
                    </Text>
                    <Text className="text-text-light mt-1">{option.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Progress Dots */}
      <View className="flex-row justify-center pt-16 pb-8">
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            className={`w-2 h-2 rounded-full mx-1 ${
              i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/60' : 'bg-primary/20'
            }`}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {renderStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="px-6 pb-8 pt-4">
        <View className="flex-row justify-between">
          {step > 0 ? (
            <TouchableOpacity
              className="px-6 py-4 rounded-soft"
              onPress={() => setStep(step - 1)}
            >
              <Text className="text-text-light font-medium">Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity
            className={`px-8 py-4 rounded-soft ${
              canProceed() ? 'bg-primary' : 'bg-primary/30'
            }`}
            onPress={() => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={!canProceed() || isLoading}
          >
            <Text className="text-white font-semibold">
              {step === 3 ? (isLoading ? 'Starting...' : "Let's Glow") : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
