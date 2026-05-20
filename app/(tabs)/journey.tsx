import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send } from 'lucide-react-native';
import { useJourneyStore } from '../../src/stores';
import { JourneyTimeline } from '../../src/components/journey/JourneyTimeline';
import { FutureMessageInput } from '../../src/components/journey/FutureMessageInput';
import { spacing, shadows } from '../../src/theme';
import { gradients } from '../../src/theme/colors';

export default function JourneyScreen() {
  const { events, fetchEvents, checkFutureMessages } = useJourneyStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showFutureMessage, setShowFutureMessage] = useState(false);

  useEffect(() => {
    checkFutureMessages();
    fetchEvents();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    checkFutureMessages();
    await fetchEvents();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header — gradient hero */}
      <LinearGradient
        colors={gradients.heroBloom as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.title}>Your Glow Journey</Text>
          <Text style={styles.subtitle}>
            {events.length} moment{events.length !== 1 ? 's' : ''} captured
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.futureButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => setShowFutureMessage(true)}
        >
          <Send size={16} color="#C45A82" />
          <Text style={styles.futureButtonText}>Future Self</Text>
        </Pressable>
      </LinearGradient>

      {/* Timeline */}
      <JourneyTimeline
        events={events}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Future Message Modal */}
      <FutureMessageInput
        visible={showFutureMessage}
        onClose={() => setShowFutureMessage(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: 72,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Satoshi-Medium',
    color: '#FFFAF8',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(58,46,43,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(255,251,245,0.9)',
    marginTop: 4,
  },
  futureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,251,245,0.92)',
    gap: 6,
  },
  futureButtonText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#C45A82',
  },
});
