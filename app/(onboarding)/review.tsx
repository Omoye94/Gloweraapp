import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../src/components/onboarding';

// expo-store-review is a native module that won't be linked until the next
// native rebuild. Load it lazily so this screen still renders in builds
// without the native pod (current dev build, Expo Go, etc.).
let storeReviewModule: typeof import('expo-store-review') | null = null;
async function getStoreReview() {
  if (storeReviewModule) return storeReviewModule;
  try {
    const mod = await import('expo-store-review');
    storeReviewModule = mod;
    return mod;
  } catch {
    return null;
  }
}

export default function ReviewScreen() {
  const router = useRouter();
  const [requested, setRequested] = useState(false);

  const handleRate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const StoreReview = await getStoreReview();
      if (StoreReview) {
        const available = await StoreReview.isAvailableAsync();
        if (available) await StoreReview.requestReview();
      }
    } catch {
      // Silently swallow — native module may not be linked in this build.
    }
    setRequested(true);
    // Give the native dialog a moment to settle before navigating.
    setTimeout(() => router.push('/(onboarding)/paywall'), 1200);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/paywall');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(242,180,204,0.30)', 'rgba(216,201,236,0.10)', 'rgba(20,12,32,0)']}
        style={styles.backdrop}
      />

      <View style={styles.main}>
        <Text style={styles.kicker}>ONE MORE THING</Text>
        <Text style={styles.headline}>Help others find Glowera.</Text>
        <Text style={styles.subhead}>
          A rating from you helps the next woman find what helped you.
        </Text>

        <View style={styles.starsCard}>
          <View style={styles.starsRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Text key={i} style={styles.star}>★</Text>
            ))}
          </View>
          <Text style={styles.starsLabel}>Built for women rebuilding their daily lives.</Text>
        </View>

        <Text style={styles.note}>
          We'll only ask once. Your rating stays anonymous.
        </Text>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title={requested ? 'Thank you ✦' : 'Rate Glowera'}
          onPress={handleRate}
          disabled={requested}
        />
        <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skip, pressed && { opacity: 0.6 }]}>
          <Text style={styles.skipText}>Maybe later</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 520 },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.62)',
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  headline: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#FEFAF9',
    lineHeight: 40,
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  subhead: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 24,
    marginBottom: 38,
  },
  starsCard: {
    backgroundColor: 'rgba(255,247,243,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(242,180,204,0.18)',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 22,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  star: {
    fontSize: 44,
    color: '#F2B4CC',
  },
  starsLabel: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.40)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  bottom: { paddingTop: 24, gap: 14 },
  skip: { paddingVertical: 10, alignItems: 'center' },
  skipText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.2,
  },
});
