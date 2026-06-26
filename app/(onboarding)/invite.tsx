import { View, Text, StyleSheet, Pressable, Share, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '../../src/components/onboarding';

const PLANT_BUD = require('../../assets/plants/bud.png');

const INVITE_MESSAGE =
  'I just started growing my glow garden on Glowera — it\'s like a soft daily ritual tracker that actually feels good to use. Come grow with me 🌿 https://apps.apple.com/app/glowera';

export default function InviteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleInvite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: INVITE_MESSAGE,
        title: 'Grow with me on Glowera',
      });
    } catch {
      // user dismissed share sheet — that's fine
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/notifications');
  };

  return (
    <OnboardingScreen variant="warm">
      <View style={[styles.inner, { paddingBottom: insets.bottom + 32 }]}>
        {/* Plant */}
        <View style={styles.plantCircle}>
          <Image source={PLANT_BUD} style={styles.plantImage} resizeMode="contain" />
        </View>

        {/* Copy */}
        <Text style={styles.eyebrow}>BETTER TOGETHER</Text>
        <Text style={styles.title}>Growing is better{'\n'}with a friend</Text>
        <Text style={styles.body}>
          Invite someone you care about to start their own glow garden. No competition — just two people quietly becoming the best versions of themselves.
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleInvite}
            style={({ pressed }) => [styles.inviteBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
          >
            <Text style={styles.inviteBtnText}>Invite a friend</Text>
          </Pressable>

          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.skipBtnText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  plantCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(196,90,130,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    shadowColor: '#C45A82',
    shadowOpacity: 0.32,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  plantImage: { width: 110, height: 110 },

  eyebrow: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: '#C45A82',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 32,
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.3,
    marginBottom: 18,
  },
  body: {
    fontFamily: 'DMSans',
    fontSize: 16,
    color: 'rgba(58,46,43,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },

  actions: { width: '100%', gap: 14 },
  inviteBtn: {
    backgroundColor: '#3A2E2B',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  inviteBtnText: {
    fontFamily: 'DMSans',
    fontSize: 12,
    fontWeight: '500',
    color: '#FFF6F2',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  skipBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipBtnText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    color: 'rgba(58,46,43,0.55)',
  },
});
