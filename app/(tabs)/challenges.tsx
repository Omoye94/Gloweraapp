import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Calendar, Sparkles, X, Check } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useChallengeStore } from '../../stores/challengeStore';
import { Challenge, ChallengeParticipation } from '../../types';
import { colors, categoryColors } from '../../lib/constants';

export default function ChallengesScreen() {
  const { user } = useAuthStore();
  const {
    challenges,
    activeParticipations,
    fetchChallenges,
    fetchUserParticipations,
    joinChallenge,
    leaveChallenge,
    getActiveChallenge,
    getChallengeProgress,
    isLoading,
  } = useChallengeStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    fetchChallenges();
    if (user?.id) {
      fetchUserParticipations(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChallenges();
    if (user?.id) {
      await fetchUserParticipations(user.id);
    }
    setRefreshing(false);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user?.id) return;
    await joinChallenge(user.id, challengeId);
    setSelectedChallenge(null);
  };

  const handleLeaveChallenge = async (participationId: string) => {
    await leaveChallenge(participationId);
    setSelectedChallenge(null);
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const participation = getActiveChallenge(challenge.id);
    const isJoined = !!participation;
    const progress = participation ? getChallengeProgress(participation, challenge) : 0;

    return (
      <TouchableOpacity
        key={challenge.id}
        className="bg-surface rounded-softer p-5 mb-4"
        onPress={() => setSelectedChallenge(challenge)}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                <Trophy size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text text-lg">
                  {challenge.title}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Calendar size={14} color={colors.textLight} />
                  <Text className="text-text-light text-sm ml-1">
                    {challenge.duration_days} days
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-text-light mb-3" numberOfLines={2}>
              {challenge.description}
            </Text>

            {isJoined && (
              <View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-text-light text-sm">Progress</Text>
                  <Text className="text-primary font-medium">
                    {participation.days_completed}/{challenge.duration_days} days
                  </Text>
                </View>
                <View className="h-2 bg-primary/10 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            )}
          </View>

          {isJoined && (
            <View className="bg-success/20 px-3 py-1 rounded-full ml-2">
              <Text className="text-success text-xs font-medium">Joined</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
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
          <Text className="text-2xl font-bold text-text">Challenges</Text>
          <Text className="text-text-light mt-1">
            Gentle journeys to build consistent habits
          </Text>
        </View>

        {/* Active Challenges */}
        {activeParticipations.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-text mb-3">
              Your Active Challenges
            </Text>
            {challenges
              .filter(c => getActiveChallenge(c.id))
              .map(renderChallengeCard)}
          </View>
        )}

        {/* Available Challenges */}
        <View className="px-6">
          <Text className="text-lg font-semibold text-text mb-3">
            {activeParticipations.length > 0 ? 'Explore More' : 'Available Challenges'}
          </Text>
          {challenges
            .filter(c => !getActiveChallenge(c.id))
            .map(renderChallengeCard)}

          {challenges.length === 0 && (
            <View className="bg-surface rounded-softer p-8 items-center">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Trophy size={28} color={colors.primary} />
              </View>
              <Text className="text-text font-semibold text-lg mb-2">
                No challenges yet
              </Text>
              <Text className="text-text-light text-center">
                New challenges will appear here soon
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Challenge Detail Modal */}
      <Modal
        visible={!!selectedChallenge}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedChallenge && (
          <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
              <TouchableOpacity onPress={() => setSelectedChallenge(null)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-text">Challenge Details</Text>
              <View className="w-6" />
            </View>

            <ScrollView className="flex-1 px-6">
              {/* Challenge Info */}
              <View className="items-center mb-6">
                <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
                  <Trophy size={40} color={colors.primary} />
                </View>
                <Text className="text-2xl font-bold text-text text-center mb-2">
                  {selectedChallenge.title}
                </Text>
                <View className="flex-row items-center">
                  <Calendar size={16} color={colors.textLight} />
                  <Text className="text-text-light ml-1">
                    {selectedChallenge.duration_days} day challenge
                  </Text>
                </View>
              </View>

              <Text className="text-text leading-relaxed mb-6">
                {selectedChallenge.description}
              </Text>

              {/* Daily Prompts */}
              <Text className="text-lg font-semibold text-text mb-4">
                Daily Prompts
              </Text>
              {selectedChallenge.habit_prompts.map((prompt: any, index: number) => (
                <View
                  key={index}
                  className="flex-row items-start mb-3 bg-surface rounded-soft p-4"
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: prompt.category
                      ? categoryColors[prompt.category as keyof typeof categoryColors]
                      : colors.primary,
                  }}
                >
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                    <Text className="text-primary font-medium">{prompt.day}</Text>
                  </View>
                  <Text className="text-text flex-1">{prompt.prompt}</Text>
                </View>
              ))}

              {/* Points Info */}
              <View className="bg-accent/20 rounded-softer p-4 mt-4 mb-8">
                <View className="flex-row items-center">
                  <Sparkles size={20} color={colors.accent} />
                  <Text className="text-text font-medium ml-2">Completion Reward</Text>
                </View>
                <Text className="text-text-light mt-2">
                  Complete this challenge to earn 50 points for your Glow Garden!
                </Text>
              </View>
            </ScrollView>

            {/* Action Button */}
            <View className="px-6 pb-8 pt-4">
              {getActiveChallenge(selectedChallenge.id) ? (
                <TouchableOpacity
                  className="bg-red-100 py-4 rounded-soft items-center"
                  onPress={() => {
                    const participation = getActiveChallenge(selectedChallenge.id);
                    if (participation) {
                      handleLeaveChallenge(participation.id);
                    }
                  }}
                >
                  <Text className="text-red-500 font-semibold">Leave Challenge</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-primary py-4 rounded-soft items-center"
                  onPress={() => handleJoinChallenge(selectedChallenge.id)}
                >
                  <Text className="text-white font-semibold">Join Challenge</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
