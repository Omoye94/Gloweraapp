import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GratitudeJarVisual } from '../../src/components/gratitude/GratitudeJarVisual';
import { GratitudeEntryInput } from '../../src/components/gratitude/GratitudeEntryInput';
import { GratitudeEntryCard } from '../../src/components/gratitude/GratitudeEntryCard';
import { useGratitude } from '../../src/hooks/useGratitude';
import { usePlantStore } from '../../src/stores';
import { useSoundManager } from '../../src/hooks/useSoundManager';

const POINTS_PER_ENTRY = 15;

function Toast({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1400),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
      <Text style={styles.toastText}>Added to your jar ✨</Text>
    </Animated.View>
  );
}

export default function GratitudeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, addEntry, removeEntry } = useGratitude();
  const { addPoints } = usePlantStore();
  const { playSound } = useSoundManager();
  const [toastKey, setToastKey] = React.useState(0);
  const [toastVisible, setToastVisible] = React.useState(false);

  const handleAdd = async (content: string, emoji: string) => {
    await addEntry(content, emoji);
    addPoints(POINTS_PER_ENTRY, true);
    playSound('water-drop');
    setTimeout(() => playSound('sparkle'), 400);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 120);
    setToastKey((k) => k + 1);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  return (
    <>
      <LinearGradient
        colors={['#F4A888', '#F2B4CC', '#D8C9EC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.root}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          {/* Header */}
          <Text style={styles.headline}>Gratitude{'\n'}Jar</Text>
          <Text style={styles.tagline}>Small moments, big shifts.</Text>

          {/* Jar visual */}
          <GratitudeJarVisual entryCount={entries.length} />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Input */}
          <Text style={styles.sectionLabel}>ADD A GRATITUDE</Text>
          <GratitudeEntryInput onSubmit={handleAdd} />

          {/* Entries list */}
          {entries.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>YOUR ENTRIES</Text>
              <View style={styles.entriesList}>
                {entries.map((entry) => (
                  <GratitudeEntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={removeEntry}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* Toast */}
        <Toast key={toastKey} visible={toastVisible} />
      </LinearGradient>
    </>
  );

}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(254,250,249,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 18,
    color: '#7A6668',
    lineHeight: 20,
  },
  headline: {
    fontSize: 30,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#7A6668',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    width: 40,
    height: 1.5,
    backgroundColor: 'rgba(212,144,154,0.35)',
    borderRadius: 9999,
    marginVertical: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E8880',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  entriesList: {
    width: '100%',
    gap: 10,
    paddingHorizontal: 0,
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#3A2E2B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  toastText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#FEFAF9',
    letterSpacing: 0.3,
  },
});
