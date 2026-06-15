import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '../../src/components/onboarding';

type Testimonial = {
  quote: string;
  name: string;
  age: number;
  city: string;
};

// TODO: replace with real user quotes once collected
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I've tried five wellness apps. Glowera is the first one I've actually opened every morning. Six weeks in, my anxiety is the lowest it's been in years.",
    name: 'Maya',
    age: 27,
    city: 'Brooklyn',
  },
  {
    quote:
      "I journaled twice in the whole of last year. I'm now on day 38 in a row. I finally know what's going on in my own head.",
    name: 'Liana',
    age: 32,
    city: 'Austin',
  },
  {
    quote:
      "I'm sleeping through the night for the first time since college. The evening wind-down quietly changed my life.",
    name: 'Ava',
    age: 29,
    city: 'Portland',
  },
  {
    quote:
      "I missed three days during a hard week and it didn't make me feel behind. I haven't missed a day in 49 days. That has never happened to me before.",
    name: 'Imani',
    age: 24,
    city: 'London',
  },
];

export default function SocialProofScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(242,180,204,0.22)', 'rgba(155,134,212,0.10)', 'rgba(20,12,32,0)']}
        style={styles.backdrop}
      />

      <View style={styles.main}>
        <Text style={styles.label}>REAL STORIES, REAL CHANGE</Text>
        <Text style={styles.title}>See how women are improving their lives.</Text>
        {/* TODO: swap for real count once we have one */}
        <Text style={styles.proofLine}>Women using Glowera every day to come back to themselves.</Text>

        <View style={styles.testimonialStack}>
          {TESTIMONIALS.map((t) => (
            <View key={t.name} style={styles.testimonialCard}>
              <Text style={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</Text>
              <Text style={styles.testimonialAttribution}>
                {t.name.toUpperCase()}, {t.age} · {t.city.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.closingStrip}>
          <Text style={styles.closingText}>Your turn.</Text>
        </View>

        <Text style={styles.trustStrip}>
          BUILT WITH WOMEN REBUILDING THEIR DAILY LIVES — QUIETLY, ON THEIR OWN TIME
        </Text>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title="Start my 7-day free trial"
          onPress={() => router.push('/(onboarding)/review')}
        />
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
  label: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.62)',
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#FEFAF9',
    lineHeight: 40,
    marginBottom: 10,
  },
  proofLine: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(242,180,204,0.88)',
    marginBottom: 28,
    lineHeight: 24,
  },
  testimonialStack: { gap: 12, marginBottom: 22 },
  testimonialCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: 'rgba(255,247,243,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(242,180,204,0.18)',
  },
  testimonialQuote: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '400',
    color: 'rgba(255,255,255,0.96)',
    lineHeight: 24,
    marginBottom: 14,
  },
  testimonialAttribution: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.78)',
    letterSpacing: 1.1,
  },
  closingStrip: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(184,207,177,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(184,207,177,0.20)',
  },
  closingText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.74)',
    textAlign: 'center',
    lineHeight: 20,
  },
  trustStrip: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.55)',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 18,
    paddingHorizontal: 8,
  },
  bottom: { paddingTop: 24 },
});
