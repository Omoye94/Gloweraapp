import { View, Text, StyleSheet, Pressable, Share, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1028', '#2A1A38', '#1A1028']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(242,180,204,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  plantImage: { width: 110, height: 110 },

  eyebrow: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: '#E87FA6',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 32,
    color: '#FFF6F2',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 18,
  },
  body: {
    fontFamily: 'DMSans',
    fontSize: 15,
    color: 'rgba(255,246,242,0.62)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },

  actions: { width: '100%', gap: 14 },
  inviteBtn: {
    backgroundColor: '#E87FA6',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#E87FA6',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
  inviteBtnText: {
    fontFamily: 'DMSans',
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1028',
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
    color: 'rgba(255,246,242,0.40)',
  },
});
