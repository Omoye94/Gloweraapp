import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, MessageCircle, X, Plus, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useCommunityStore } from '../../stores/communityStore';
import { colors } from '../../lib/constants';

const emojiOptions = ['💖', '✨', '🌟', '👏', '💪', '🌸'];

export default function CommunityScreen() {
  const { user } = useAuthStore();
  const {
    pods,
    userPods,
    currentPodMessages,
    fetchAvailablePods,
    fetchUserPods,
    fetchPodMessages,
    joinPod,
    leavePod,
    sendMessage,
    addReaction,
    isLoading,
  } = useCommunityStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchAvailablePods();
    if (user?.id) {
      fetchUserPods(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedPodId) {
      fetchPodMessages(selectedPodId);
    }
  }, [selectedPodId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailablePods();
    if (user?.id) {
      await fetchUserPods(user.id);
    }
    setRefreshing(false);
  };

  const handleJoinPod = async (podId: string) => {
    if (!user?.id) return;
    await joinPod(user.id, podId);
    setShowJoinModal(false);
  };

  const handleSendMessage = async () => {
    if (!user?.id || !selectedPodId || !messageText.trim()) return;
    await sendMessage(selectedPodId, user.id, messageText.trim());
    setMessageText('');
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user?.id) return;
    await addReaction(messageId, emoji, user.id);
  };

  const getCurrentPod = () => {
    if (!selectedPodId) return null;
    return userPods.find((m: any) => m.pod_id === selectedPodId);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-text">Community</Text>
          <Text className="text-text-light mt-1">
            Connect with your accountability pod
          </Text>
        </View>

        {/* User's Pods */}
        {userPods.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-text mb-3">
              Your Pods
            </Text>
            {userPods.map((membership: any) => (
              <TouchableOpacity
                key={membership.id}
                className="bg-surface rounded-softer p-4 mb-3 flex-row items-center"
                onPress={() => setSelectedPodId(membership.pod_id)}
              >
                <View className="w-12 h-12 rounded-full bg-secondary/30 items-center justify-center mr-4">
                  <Users size={24} color={colors.secondary} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-text">
                    {membership.community_pods?.name || 'Pod'}
                  </Text>
                  <Text className="text-text-light text-sm">
                    Tap to view messages
                  </Text>
                </View>
                <MessageCircle size={20} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Join a Pod */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-text">
              {userPods.length > 0 ? 'Join Another Pod' : 'Join a Pod'}
            </Text>
            <TouchableOpacity
              className="flex-row items-center bg-primary/10 px-3 py-2 rounded-full"
              onPress={() => setShowJoinModal(true)}
            >
              <Plus size={16} color={colors.primary} />
              <Text className="text-primary font-medium ml-1">Browse</Text>
            </TouchableOpacity>
          </View>

          {userPods.length === 0 && (
            <View className="bg-surface rounded-softer p-8 items-center">
              <View className="w-16 h-16 rounded-full bg-secondary/20 items-center justify-center mb-4">
                <Users size={28} color={colors.secondary} />
              </View>
              <Text className="text-text font-semibold text-lg mb-2">
                No pods yet
              </Text>
              <Text className="text-text-light text-center mb-4">
                Join an accountability pod to connect with others on their glow journey
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-soft"
                onPress={() => setShowJoinModal(true)}
              >
                <Text className="text-white font-medium">Find a Pod</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Community Guidelines */}
        <View className="mx-6 mt-6 bg-selfCare/30 rounded-softer p-5">
          <Text className="text-text font-semibold mb-2">Community Values</Text>
          <Text className="text-text-light leading-relaxed">
            • Be kind and supportive to everyone{'\n'}
            • Share encouragement, not judgment{'\n'}
            • Use emoji reactions to celebrate others{'\n'}
            • Keep conversations positive and uplifting
          </Text>
        </View>
      </ScrollView>

      {/* Join Pod Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
            <TouchableOpacity onPress={() => setShowJoinModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-text">Find a Pod</Text>
            <View className="w-6" />
          </View>

          <ScrollView className="flex-1 px-6">
            <Text className="text-text-light mb-6">
              Join a small accountability pod (5-8 members) to share your journey
            </Text>

            {pods.map((pod: any) => (
              <TouchableOpacity
                key={pod.id}
                className="bg-surface rounded-softer p-5 mb-3"
                onPress={() => handleJoinPod(pod.id)}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-secondary/30 items-center justify-center mr-4">
                    <Users size={24} color={colors.secondary} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-text">{pod.name}</Text>
                    <Text className="text-text-light text-sm">
                      {pod.max_members} members max
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {pods.length === 0 && (
              <Text className="text-text-light text-center py-8">
                No available pods at the moment
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Pod Messages Modal */}
      <Modal
        visible={!!selectedPodId}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setSelectedPodId(null)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-text">Pod Messages</Text>
            <TouchableOpacity
              onPress={async () => {
                const membership = getCurrentPod();
                if (membership) {
                  await leavePod(membership.id);
                  setSelectedPodId(null);
                }
              }}
            >
              <LogOut size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {currentPodMessages.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-text-light">No messages yet. Start the conversation!</Text>
              </View>
            ) : (
              currentPodMessages.map((message: any) => (
                <View key={message.id} className="bg-surface rounded-soft p-4 mb-3">
                  <Text className="text-text">{message.content}</Text>
                  <View className="flex-row mt-2 flex-wrap">
                    {Object.entries(message.emoji_reactions || {}).map(
                      ([emoji, users]: [string, any]) => (
                        <TouchableOpacity
                          key={emoji}
                          className={`flex-row items-center px-2 py-1 rounded-full mr-2 mb-1 ${
                            users.includes(user?.id)
                              ? 'bg-primary/20'
                              : 'bg-gray-100'
                          }`}
                          onPress={() => handleReaction(message.id, emoji)}
                        >
                          <Text>{emoji}</Text>
                          <Text className="text-text-light text-xs ml-1">
                            {users.length}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                  {/* Quick reactions */}
                  <View className="flex-row mt-2 pt-2 border-t border-gray-100">
                    {emojiOptions.map(emoji => (
                      <TouchableOpacity
                        key={emoji}
                        className="px-2 py-1"
                        onPress={() => handleReaction(message.id, emoji)}
                      >
                        <Text>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Message Input */}
          <View className="px-6 pb-8 pt-4 border-t border-gray-100">
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 bg-surface border border-primary/20 rounded-soft px-4 py-3 mr-3"
                placeholder="Share something encouraging..."
                placeholderTextColor="#8A8A8A"
                value={messageText}
                onChangeText={setMessageText}
                multiline
              />
              <TouchableOpacity
                className="bg-primary w-12 h-12 rounded-full items-center justify-center"
                onPress={handleSendMessage}
              >
                <Text className="text-white text-lg">↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
