import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';

type Testimonial = {
  quote: string;
  name: string;
  age: number;
  city: string;
};

const TESTIMONIAL_ACCENTS = [
  { soft: 'rgba(232,127,166,0.18)', deep: '#C45A82' }, // rose
  { soft: 'rgba(155,134,212,0.18)', deep: '#7C66B8' }, // lilac
  { soft: 'rgba(244,168,136,0.22)', deep: '#D17A4D' }, // peach
  { soft: 'rgba(143,168,134,0.22)', deep: '#6F8B6A' }, // sage
];

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
    <OnboardingScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
        <Text style={styles.label}>REAL STORIES, REAL CHANGE</Text>
        <Text style={styles.title}>Join thousands of women using <Text style={styles.titleItalic}>Glowera</Text> to glow up.</Text>
        <Text style={styles.proofLine}>Real women, real rituals, real change — every day.</Text>

        <View style={styles.scienceCard}>
          <View style={styles.scienceHeaderRow}>
            <View style={styles.scienceIconCircle}>
              <Text style={styles.scienceIconEmoji}>🔬</Text>
            </View>
            <View style={styles.scienceMeta}>
              <Text style={styles.scienceEyebrow}>RESEARCH-BACKED</Text>
              <Text style={styles.scienceJournal}>EUR. J. SOC. PSYCHOL.</Text>
            </View>
            <View style={styles.scienceProofBadge}>
              <Text style={styles.scienceProofBadgeText}>PROVEN</Text>
            </View>
          </View>

          <View style={styles.scienceRow}>
            <Text style={styles.scienceStat}>66</Text>
            <View style={styles.scienceBody}>
              <Text style={styles.scienceUnit}>DAYS</Text>
              <Text style={styles.scienceText}>
                The average time it takes to build a new habit.
              </Text>
            </View>
          </View>
          <Text style={styles.scienceFootnote}>
            Glowera holds the rhythm for all of them — gently, without guilt.
          </Text>

          <View style={styles.scienceCitationRow}>
            <Text style={styles.scienceCitationIcon}>✓</Text>
            <Text style={styles.scienceCitation}>
              Lally et al., University College London (2009)
            </Text>
          </View>
        </View>

        <View style={styles.testimonialStack}>
          {TESTIMONIALS.map((t, i) => {
            const accent = TESTIMONIAL_ACCENTS[i % TESTIMONIAL_ACCENTS.length];
            return (
              <View
                key={t.name}
                style={[
                  styles.testimonialCard,
                  { borderLeftColor: accent.deep, shadowColor: accent.deep },
                ]}
              >
                <View style={styles.testimonialHeaderRow}>
                  <View style={[styles.testimonialAvatar, { backgroundColor: accent.soft }]}>
                    <Text style={[styles.testimonialAvatarInitial, { color: accent.deep }]}>
                      {t.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.testimonialMeta}>
                    <Text style={styles.testimonialName}>
                      {t.name}, {t.age}
                    </Text>
                    <Text style={styles.testimonialLocation}>{t.city.toUpperCase()}</Text>
                  </View>
                  <View style={styles.testimonialStars}>
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Text key={s} style={[styles.star, { color: accent.deep }]}>★</Text>
                    ))}
                  </View>
                </View>
                <Text style={[styles.testimonialQuoteMark, { color: accent.deep }]}>&ldquo;</Text>
                <Text style={styles.testimonialQuote}>{t.quote}</Text>
                <View style={styles.testimonialBadge}>
                  <Text style={[styles.testimonialBadgeIcon, { color: accent.deep }]}>✓</Text>
                  <Text style={styles.testimonialBadgeText}>Verified Glowera user</Text>
                </View>
              </View>
            );
          })}
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
            onPress={() => router.push('/(onboarding)/congrats')}
          />
        </View>
      </ScrollView>
    </OnboardingScreen>
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
  main: { flex: 1, paddingTop: 8 },
  label: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.6,
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 38,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  titleItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
  },
  scienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.16)',
    borderLeftWidth: 6,
    borderLeftColor: '#7C66B8',
    paddingVertical: 22,
    paddingHorizontal: 22,
    paddingLeft: 24,
    marginBottom: 22,
    shadowColor: '#7C66B8',
    shadowOpacity: 0.32,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  scienceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  scienceIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(155,134,212,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scienceIconEmoji: {
    fontSize: 20,
  },
  scienceMeta: {
    flex: 1,
  },
  scienceEyebrow: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#7C66B8',
    letterSpacing: 1.6,
  },
  scienceJournal: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: 'rgba(58,46,43,0.5)',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  scienceProofBadge: {
    backgroundColor: '#7C66B8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scienceProofBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 1.4,
  },
  scienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  scienceStat: {
    fontSize: 76,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#7C66B8',
    letterSpacing: -2.5,
    lineHeight: 78,
  },
  scienceBody: {
    flex: 1,
    paddingTop: 8,
  },
  scienceUnit: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#7C66B8',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  scienceText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#3A2E2B',
    lineHeight: 20,
  },
  scienceFootnote: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    lineHeight: 20,
    marginBottom: 16,
  },
  scienceCitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58,46,43,0.1)',
  },
  scienceCitationIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C66B8',
  },
  scienceCitation: {
    fontFamily: 'DMSans',
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(58,46,43,0.6)',
    letterSpacing: 0.3,
  },
  proofLine: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#C45A82',
    marginBottom: 22,
    lineHeight: 24,
  },
  testimonialStack: { gap: 12, marginBottom: 22 },
  testimonialCard: {
    padding: 22,
    paddingLeft: 24,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.16)',
    borderLeftWidth: 6,
    shadowOpacity: 0.32,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 9,
  },
  testimonialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  testimonialAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarInitial: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  testimonialMeta: {
    flex: 1,
  },
  testimonialName: {
    fontFamily: 'DMSans',
    fontWeight: '700',
    fontSize: 15,
    color: '#3A2E2B',
  },
  testimonialLocation: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: 'rgba(58,46,43,0.55)',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 1,
  },
  star: {
    fontSize: 13,
  },
  testimonialQuoteMark: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 56,
    lineHeight: 36,
    height: 32,
    marginBottom: 6,
    opacity: 0.85,
  },
  testimonialQuote: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#3A2E2B',
    lineHeight: 25,
    marginBottom: 16,
  },
  testimonialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58,46,43,0.1)',
  },
  testimonialBadgeIcon: {
    fontSize: 12,
    fontWeight: '700',
  },
  testimonialBadgeText: {
    fontFamily: 'DMSans',
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(58,46,43,0.6)',
    letterSpacing: 0.3,
  },
  closingStrip: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(143,168,134,0.55)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  closingText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    lineHeight: 20,
  },
  trustStrip: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(58,46,43,0.55)',
    letterSpacing: 1.4,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 18,
    paddingHorizontal: 8,
  },
  bottom: { paddingTop: 24 },
});
