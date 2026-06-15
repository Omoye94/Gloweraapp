import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Dimensions,
  Linking,
} from 'react-native';

const PRIVACY_URL =
  'https://keen-cheshire-158.notion.site/Glowera-App-Privacy-Policy-34324bc53c8c80f0bda8f2f0d0527ed6';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

function GlowOrb({ children }: { children: React.ReactNode }) {
  const breathe = useRef(new Animated.Value(1)).current;
  const glow    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.06, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1,    duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.38] });

  return (
    <Animated.View style={[styles.orbWrap, { transform: [{ scale: breathe }] }]}>
      <Animated.View style={[styles.orbGlowRing, { opacity: glowOpacity }]} />
      <View style={styles.orb}>
        {children}
      </View>
    </Animated.View>
  );
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  useEffect(() => {
    let sound: Audio.Sound | null = null;
    (async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync(
        require('../../assets/sounds/sparkle.mp3'),
        { volume: 0.45, shouldPlay: true }
      );
      sound = s;
    })();
    return () => { sound?.unloadAsync(); };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 }]}>

      <ImageBackground
        source={require('../../assets/images/welcome-garden.jpeg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Dark gradient overlay */}
      <LinearGradient
        colors={['rgba(20,12,32,0.50)', 'rgba(20,12,32,0.12)', 'rgba(20,12,32,0.70)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glows */}
      <View style={styles.ambientTop} />
      <View style={styles.ambientBottom} />

      {/* Center content */}
      <View style={styles.centerContent}>

        <FadeUp delay={0}>
          <GlowOrb>
            <Image
              source={require('../../assets/Logo-Backgrounds-01.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </GlowOrb>
        </FadeUp>

        <FadeUp delay={280}>
          <View style={styles.headline}>
            <Text style={styles.headlineSub}>a daily ritual for</Text>
            <Text style={styles.headlineMain}>your inner glow</Text>
          </View>
        </FadeUp>

        <FadeUp delay={460}>
          <Text style={styles.description}>
            Build habits that nourish you.{'\n'}Watch something beautiful grow.
          </Text>
        </FadeUp>

      </View>

      {/* Bottom CTA */}
      <FadeUp delay={640}>
        <View style={styles.bottomBlock}>
          <Pressable
            onPress={() => router.replace('/(onboarding)/problem')}
            style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
          >
            <LinearGradient
              colors={['#E87FA6', '#C45A82']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Begin your journey</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.ctaNote}>TAKES 3 MINUTES</Text>

          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [styles.signInLink, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.signInText}>Already glowing? </Text>
            <Text style={styles.signInTextBold}>Sign in</Text>
          </Pressable>

          <Text style={styles.legalLine}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </FadeUp>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    backgroundColor: '#140C20',
  },

  ambientTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(155,134,212,0.12)',
    top: -80,
    alignSelf: 'center',
  },
  ambientBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(232,127,166,0.08)',
    bottom: 40,
    alignSelf: 'center',
  },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },

  orbWrap: {
    width: 168,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlowRing: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: 'rgba(155,134,212,0.22)',
    shadowColor: '#9B86D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  orb: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(155,134,212,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(155,134,212,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 120,
    height: 120,
  },

  headline: { alignItems: 'center', gap: 6 },
  headlineSub: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 18,
    color: 'rgba(242,180,204,0.8)',
    lineHeight: 26,
  },
  headlineMain: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 36,
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: -0.5,
    lineHeight: 42,
  },

  description: {
    fontFamily: 'DMSans',
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 26,
  },

  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 0,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#E87FA6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    marginBottom: 14,
  },
  ctaGradient: {
    paddingVertical: 17,
    alignItems: 'center',
    borderRadius: 18,
  },
  ctaText: {
    fontFamily: 'DMSans',
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1028',
    letterSpacing: 0.2,
  },
  ctaNote: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.22)',
    marginBottom: 20,
  },
  signInLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
  },
  signInTextBold: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(242,180,204,0.7)',
  },
  legalLine: {
    marginTop: 22,
    paddingHorizontal: 24,
    fontFamily: 'DMSans',
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.32)',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  legalLink: {
    color: 'rgba(242,180,204,0.85)',
    textDecorationLine: 'underline',
  },
});
