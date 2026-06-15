import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '../../src/components/onboarding';

const EXTRAS = [
  {
    id: 'beauty',
    icon: '✨',
    title: 'Beauty Rituals',
    sub: 'Track your skincare and beauty routines.',
    colors: ['#EDBBCA', '#F5D4C4'] as const,
  },
  {
    id: 'gratitude',
    icon: '🫙',
    title: 'Gratitude Jar',
    sub: 'Save small moments you\'re grateful for.',
    colors: ['#F5C4B8', '#EDBBCA'] as const,
  },
  {
    id: 'phonedown',
    icon: '📵',
    title: 'Phone Down',
    sub: 'Set a timer to step away from your phone.',
    colors: ['#C8B8E2', '#D8CCEE'] as const,
  },
];

export default function ExtrasScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(245,196,184,0.30)', 'rgba(184,207,177,0.10)']}
        style={styles.backdrop}
      />

      <View style={styles.main}>
        <Text style={styles.kicker}>BONUS FEATURES</Text>
        <Text style={styles.headline}>Extra tools to support your day.</Text>
        <Text style={styles.subhead}>Beauty rituals, gratitude jar, phone-down timer — built into your garden.</Text>

        <View style={styles.list}>
          {EXTRAS.map((e) => (
            <View key={e.id} style={styles.cardWrap}>
              <LinearGradient
                colors={e.colors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.icon}>{e.icon}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{e.title}</Text>
                  <Text style={styles.cardSub}>{e.sub}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        <Text style={styles.hint}>You can find these anytime in your garden.</Text>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/vision')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 500 },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 10, fontFamily: 'SpaceMono-Bold',
    color: 'rgba(245,196,184,0.85)', letterSpacing: 1.4, marginBottom: 14,
  },
  headline: {
    fontSize: 30, fontFamily: 'PlayfairDisplay', fontWeight: '600',
    color: '#FEFAF9', lineHeight: 38, marginBottom: 12, letterSpacing: -0.4,
  },
  subhead: {
    fontSize: 15, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.62)',
    lineHeight: 22, marginBottom: 24,
  },
  list: { gap: 12 },
  cardWrap: {
    borderRadius: 22, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 16,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 18, paddingHorizontal: 18,
  },
  icon: { fontSize: 30 },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: 'PlayfairDisplay', fontSize: 17, color: '#1A0A06',
    marginBottom: 4, letterSpacing: -0.2,
  },
  cardSub: {
    fontFamily: 'DMSans', fontSize: 12, color: '#4A2E1E',
    lineHeight: 17, fontStyle: 'italic',
  },
  hint: {
    fontFamily: 'DMSans', fontStyle: 'italic', fontSize: 12,
    color: 'rgba(255,255,255,0.48)', textAlign: 'center',
    marginTop: 20, letterSpacing: 0.2,
  },
  bottom: { paddingTop: 24 },
});
