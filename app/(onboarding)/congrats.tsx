import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ScrollView, Pressable, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const PLANT_BLOOM = require('../../assets/plants/bloom.png');

function getGlowType(focusAreas: string[]) {
  const primary = focusAreas[0] || '';
  if (/supplement|hydration|skin/i.test(primary)) return 'The Tender';
  if (/movement|sleep|rest/i.test(primary)) return 'The Wildflower';
  return 'The Gentle Builder';
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 560, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 560, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function ConfettiSparkle({
  delay,
  x,
  y,
  glyph,
  size,
  color,
}: {
  delay: number;
  x: number;
  y: number;
  glyph: string;
  size: number;
  color: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -40, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: size,
        color,
        opacity,
        transform: [{ translateY }, { rotate: spin }],
      }}
    >
      {glyph}
    </Animated.Text>
  );
}

function CongratsPopup({ visible, name, onDismiss }: { visible: boolean; name: string; onDismiss: () => void }) {
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(0)).current;
  const orbRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 11, bounciness: 11 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(orbScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 14, delay: 180 }),
    ]).start();

    Animated.loop(
      Animated.timing(orbRotate, { toValue: 1, duration: 14000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [visible]);

  if (!visible) return null;

  const orbSpin = orbRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Random-ish sparkle field for the burst
  const sparkles = [
    { delay: 60,  x: 30,  y: 200, glyph: '✦', size: 18, color: '#C45A82' },
    { delay: 120, x: 280, y: 220, glyph: '✦', size: 14, color: '#9B86D4' },
    { delay: 180, x: 70,  y: 350, glyph: '✧', size: 16, color: '#E87FA6' },
    { delay: 100, x: 260, y: 380, glyph: '✧', size: 22, color: '#C45A82' },
    { delay: 240, x: 140, y: 160, glyph: '✦', size: 12, color: '#F2B4CC' },
    { delay: 300, x: 200, y: 460, glyph: '✦', size: 18, color: '#9B86D4' },
    { delay: 360, x: 50,  y: 460, glyph: '✧', size: 14, color: '#E87FA6' },
    { delay: 420, x: 240, y: 140, glyph: '✦', size: 16, color: '#F4A888' },
  ];

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.popupBackdrop, { opacity: backdropOpacity }]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss} />
        {sparkles.map((s, i) => (
          <ConfettiSparkle key={i} {...s} />
        ))}
        <Animated.View
          style={[
            styles.popupCard,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(232,127,166,0.18)', 'rgba(155,134,212,0.14)', 'rgba(254,201,180,0.20)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.popupSheen}
            pointerEvents="none"
          />

          <Animated.View style={[styles.popupOrb, { transform: [{ scale: orbScale }] }]}>
            <Animated.View style={[styles.popupOrbGlow, { transform: [{ rotate: orbSpin }] }]}>
              <LinearGradient
                colors={['#E87FA6', '#9B86D4', '#F4A888', '#E87FA6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
            <View style={styles.popupOrbInner}>
              <Text style={styles.popupOrbEmoji}>✦</Text>
            </View>
          </Animated.View>

          <Text style={styles.popupKicker}>CONGRATULATIONS</Text>
          <Text style={styles.popupHeadline}>
            You&apos;re glowing, {name}.
          </Text>
          <Text style={styles.popupBody}>
            Your garden is planted. Tap below to see your full plan.
          </Text>

          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [styles.popupBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
          >
            <LinearGradient
              colors={['#E87FA6', '#C45A82']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.popupBtnGradient}
            >
              <Text style={styles.popupBtnText}>See my garden</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function CongratsScreen() {
  const router = useRouter();
  const [popupOpen, setPopupOpen] = useState(true);
  const {
    selected_rituals,
    focus_areas,
    garden_name,
    preferred_name,
  } = useOnboardingStore();

  const glowType = getGlowType(focus_areas);
  const gardenName = garden_name?.trim() || 'Your glow garden';
  const firstName = preferred_name?.trim() || 'you';

  const bloomScale = useRef(new Animated.Value(0.6)).current;
  const bloomOpacity = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(bloomOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(bloomScale, { toValue: 1, duration: 900, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(haloPulse, { toValue: 0.6, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/paywall');
  };

  return (
    <OnboardingScreen tone="transformation" variant="warm">
      <CongratsPopup
        visible={popupOpen}
        name={firstName.charAt(0).toUpperCase() + firstName.slice(1)}
        onDismiss={() => setPopupOpen(false)}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {/* Animated glow halo */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                opacity: haloPulse,
                transform: [{ scale: haloPulse.interpolate({ inputRange: [0.6, 1], outputRange: [0.94, 1.08] }) }],
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.haloInner,
              {
                opacity: haloPulse.interpolate({ inputRange: [0.6, 1], outputRange: [0.55, 0.95] }),
                transform: [{ scale: haloPulse.interpolate({ inputRange: [0.6, 1], outputRange: [0.96, 1.04] }) }],
              },
            ]}
          />
          {/* Sparkle accents */}
          <Text style={[styles.sparkle, styles.sparkleNW]}>✦</Text>
          <Text style={[styles.sparkle, styles.sparkleNE]}>✦</Text>
          <Text style={[styles.sparkle, styles.sparkleSW]}>✧</Text>
          <Text style={[styles.sparkle, styles.sparkleSE]}>✧</Text>

          <Animated.View style={{ opacity: bloomOpacity, transform: [{ scale: bloomScale }] }}>
            <Image source={PLANT_BLOOM} style={styles.bloomImage} resizeMode="contain" />
          </Animated.View>
        </View>

        <FadeIn delay={350}>
          <Text style={styles.kicker}>YOU DID IT, {firstName.toUpperCase()}</Text>
        </FadeIn>

        <FadeIn delay={500}>
          <Text style={styles.headline}>
            You&apos;ve already done{'\n'}what <Text style={styles.italic}>most people skip</Text>.
          </Text>
        </FadeIn>

        <FadeIn delay={650}>
          <Text style={styles.subhead}>
            That&apos;s the hard part — being honest about what you want to grow into.
          </Text>
        </FadeIn>

        {/* Personalized recap card */}
        <FadeIn delay={800}>
          <View style={styles.recapCard}>
            <Text style={styles.recapEyebrow}>YOUR GLOW GARDEN</Text>
            <Text style={styles.recapTitle}>{gardenName}</Text>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <Text style={styles.statValue}>{selected_rituals.length || 1}</Text>
              <Text style={styles.statLabel}>
                ritual{selected_rituals.length === 1 ? '' : 's'} planted
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{focus_areas.length || 1}</Text>
              <Text style={styles.statLabel}>
                focus area{focus_areas.length === 1 ? '' : 's'}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statValueAccent}>{glowType}</Text>
              <Text style={styles.statLabel}>your glow type</Text>
            </View>
          </View>
        </FadeIn>

        {/* Quote anchor */}
        <FadeIn delay={950}>
          <View style={styles.quoteBlock}>
            <Text style={styles.quoteText}>
              &ldquo;Routines are rituals of devotion to yourself and your dreams.&rdquo;
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={1100}>
          <View style={styles.bottom}>
            <PrimaryButton title="See my full plan" onPress={handleContinue} />
            <Pressable
              onPress={handleContinue}
              hitSlop={12}
              style={({ pressed }) => [styles.hint, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.hintText}>
                Unlock your 7-day free trial next →
              </Text>
            </Pressable>
          </View>
        </FadeIn>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 36,
    paddingTop: 8,
  },

  hero: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(232,127,166,0.16)',
  },
  haloInner: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(254,201,180,0.4)',
  },
  bloomImage: {
    width: 180,
    height: 180,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 18,
    color: '#C45A82',
    opacity: 0.85,
  },
  sparkleNW: { top: 14, left: 24 },
  sparkleNE: { top: 30, right: 18, fontSize: 14 },
  sparkleSW: { bottom: 28, left: 14, fontSize: 14 },
  sparkleSE: { bottom: 18, right: 26 },

  kicker: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.8,
    textAlign: 'center',
    marginBottom: 14,
  },
  headline: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 38,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 14,
  },
  italic: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
  },
  subhead: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.75)',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 6,
  },

  recapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(196,90,130,0.25)',
    paddingVertical: 22,
    paddingHorizontal: 22,
    marginBottom: 22,
    shadowColor: '#C45A82',
    shadowOpacity: 0.24,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 14 },
    elevation: 9,
  },
  recapEyebrow: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  recapTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(58,46,43,0.12)',
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 6,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: -0.3,
  },
  statValueAccent: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#C45A82',
    fontStyle: 'italic',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(58,46,43,0.55)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  quoteBlock: {
    borderLeftWidth: 2,
    borderLeftColor: '#C45A82',
    paddingLeft: 14,
    paddingRight: 8,
    marginBottom: 28,
  },
  quoteText: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(58,46,43,0.82)',
    lineHeight: 23,
  },

  bottom: {
    gap: 14,
  },
  hint: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  hintText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#C45A82',
    letterSpacing: 0.2,
  },

  // ── Popup ──
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,16,40,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  popupCard: {
    width: '100%',
    backgroundColor: '#FFFAF5',
    borderRadius: 32,
    paddingTop: 28,
    paddingBottom: 26,
    paddingHorizontal: 26,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#1A1028',
    shadowOpacity: 0.32,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  popupSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.7,
  },
  popupOrb: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  popupOrbGlow: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    overflow: 'hidden',
  },
  popupOrbInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFAF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupOrbEmoji: {
    fontSize: 36,
    color: '#C45A82',
  },
  popupKicker: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 2,
    marginBottom: 10,
  },
  popupHeadline: {
    fontSize: 26,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  popupBody: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.7)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  popupBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#C45A82',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  popupBtnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 18,
  },
  popupBtnText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
