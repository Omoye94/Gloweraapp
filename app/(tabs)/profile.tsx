import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  BookOpen,
  LogOut,
  ChevronRight,
  Sparkles,
  X,
  Edit3,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useReflectionStore } from '../../stores/reflectionStore';
import { colors, moodOptions, categoryLabels } from '../../lib/constants';
import { formatDate } from '../../lib/utils';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuthStore();
  const {
    reflections,
    currentPrompt,
    fetchReflections,
    createReflection,
    refreshPrompt,
  } = useReflectionStore();

  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user?.display_name || '');

  useEffect(() => {
    if (user?.id) {
      fetchReflections(user.id);
    }
  }, [user?.id]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleCreateReflection = async () => {
    if (!user?.id || !reflectionText.trim()) return;

    await createReflection(
      user.id,
      reflectionText.trim(),
      selectedMood || undefined,
      currentPrompt
    );

    setReflectionText('');
    setSelectedMood(null);
    setShowReflectionModal(false);
  };

  const handleUpdateName = async () => {
    if (!newDisplayName.trim()) return;
    await updateProfile({ display_name: newDisplayName.trim() });
    setShowEditNameModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="px-6 pt-4 pb-6 items-center">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
            <User size={48} color={colors.primary} />
          </View>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setShowEditNameModal(true)}
          >
            <Text className="text-xl font-bold text-text">
              {user?.display_name || 'Add your name'}
            </Text>
            <Edit3 size={16} color={colors.textLight} className="ml-2" />
          </TouchableOpacity>
          <Text className="text-text-light mt-1">{user?.email}</Text>

          {/* Points Badge */}
          <View className="flex-row items-center bg-accent/20 px-4 py-2 rounded-full mt-4">
            <Sparkles size={18} color={colors.accent} />
            <Text className="text-text font-semibold ml-2">
              {user?.total_points || 0} Glow Points
            </Text>
          </View>
        </View>

        {/* Focus Areas */}
        {user?.focus_areas && user.focus_areas.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-text mb-3">Focus Areas</Text>
            <View className="flex-row flex-wrap">
              {user.focus_areas.map((area: any) => (
                <View
                  key={area}
                  className="bg-primary/10 px-3 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-primary font-medium">
                    {categoryLabels[area as keyof typeof categoryLabels]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reflection Section */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-text">Reflections</Text>
            <TouchableOpacity
              className="flex-row items-center bg-primary/10 px-3 py-2 rounded-full"
              onPress={() => setShowReflectionModal(true)}
            >
              <BookOpen size={16} color={colors.primary} />
              <Text className="text-primary font-medium ml-1">New</Text>
            </TouchableOpacity>
          </View>

          {reflections.length === 0 ? (
            <View className="bg-surface rounded-softer p-6 items-center">
              <BookOpen size={32} color={colors.textLight} />
              <Text className="text-text-light mt-3 text-center">
                Start journaling your thoughts and feelings
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {reflections.slice(0, 3).map((reflection: any) => (
                <View key={reflection.id} className="bg-surface rounded-soft p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-text-light text-sm">
                      {formatDate(reflection.created_at)}
                    </Text>
                    {reflection.mood && (
                      <Text className="text-lg">{reflection.mood}</Text>
                    )}
                  </View>
                  {reflection.prompt && (
                    <Text className="text-primary text-sm mb-2 italic">
                      "{reflection.prompt}"
                    </Text>
                  )}
                  <Text className="text-text" numberOfLines={3}>
                    {reflection.content}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Settings */}
        <View className="px-6">
          <Text className="text-lg font-semibold text-text mb-3">Settings</Text>

          <TouchableOpacity className="bg-surface rounded-soft p-4 flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Settings size={20} color={colors.text} />
              <Text className="text-text ml-3">Notification Preferences</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-soft p-4 flex-row items-center justify-between"
            onPress={handleSignOut}
          >
            <View className="flex-row items-center">
              <LogOut size={20} color="#E57373" />
              <Text className="text-red-400 ml-3">Sign Out</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="px-6 mt-8 items-center">
          <Text className="text-primary text-lg font-semibold">Glowera</Text>
          <Text className="text-text-light text-sm">Glow With Every Habit</Text>
          <Text className="text-text-light text-xs mt-2">Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Reflection Modal */}
      <Modal
        visible={showReflectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
            <TouchableOpacity onPress={() => setShowReflectionModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-text">New Reflection</Text>
            <View className="w-6" />
          </View>

          <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
            {/* Prompt */}
            <View className="bg-primary/10 rounded-softer p-4 mb-6">
              <Text className="text-primary font-medium mb-1">Today's Prompt</Text>
              <Text className="text-text italic">{currentPrompt}</Text>
              <TouchableOpacity
                className="mt-2"
                onPress={refreshPrompt}
              >
                <Text className="text-primary text-sm">Get a new prompt</Text>
              </TouchableOpacity>
            </View>

            {/* Mood Selection */}
            <Text className="text-text font-medium mb-3">How are you feeling?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {moodOptions.map(mood => (
                <TouchableOpacity
                  key={mood.label}
                  className={`items-center mr-4 px-4 py-3 rounded-soft ${
                    selectedMood === mood.emoji ? 'bg-primary/20' : 'bg-surface'
                  }`}
                  onPress={() => setSelectedMood(mood.emoji)}
                >
                  <Text className="text-2xl mb-1">{mood.emoji}</Text>
                  <Text className="text-text-light text-xs">{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Text Input */}
            <Text className="text-text font-medium mb-3">Your Thoughts</Text>
            <TextInput
              className="bg-surface border border-primary/20 rounded-soft px-4 py-4 text-text min-h-[150px]"
              placeholder="Write whatever comes to mind..."
              placeholderTextColor="#8A8A8A"
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              className={`mt-6 py-4 rounded-soft items-center ${
                reflectionText.trim() ? 'bg-primary' : 'bg-primary/30'
              }`}
              onPress={handleCreateReflection}
              disabled={!reflectionText.trim()}
            >
              <Text className="text-white font-semibold">Save Reflection</Text>
            </TouchableOpacity>

            <View className="h-8" />
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        visible={showEditNameModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowEditNameModal(false)}
        >
          <View className="bg-surface rounded-softer p-6">
            <Text className="text-lg font-semibold text-text mb-4">
              Update Display Name
            </Text>
            <TextInput
              className="bg-background border border-primary/20 rounded-soft px-4 py-3 text-text mb-4"
              placeholder="Your name"
              placeholderTextColor="#8A8A8A"
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              autoFocus
            />
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-soft items-center bg-gray-100"
                onPress={() => setShowEditNameModal(false)}
              >
                <Text className="text-text">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-soft items-center bg-primary"
                onPress={handleUpdateName}
              >
                <Text className="text-white font-medium">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
