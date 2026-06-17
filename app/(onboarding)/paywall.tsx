import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSubscriptionStore } from '../../src/stores';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { fetchOfferings, purchasePackage, restorePurchases } from '../../src/lib/purchases';

const FEATURES = [
  { emoji: '🌿', text: 'Unlimited rituals & habits' },
  { emoji: '💊', text: 'Full supplement tracking' },
  { emoji: '📓', text: 'Daily journaling & reflections' },
  { emoji: '🌸', text: 'Garden growth & glow meter' },
  { emoji: '✨', text: 'Weekly insights & recaps' },
  { emoji: '🎯', text: 'All challenges unlocked' },
];

const PRIVACY_URL =
  'https://keen-cheshire-158.notion.site/Glowera-App-Privacy-Policy-34324bc53c8c80f0bda8f2f0d0527ed6';

type PlanType = 'yearly' | 'monthly';

export default function PaywallScreen() {
  const router = useRouter();
  const { setIsPremium, setCustomerInfo, setCurrentOffering, currentOffering } =
    useSubscriptionStore();
  const { selected_rituals, focus_areas, garden_name } = useOnboardingStore();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);

  const yearlyPackage: PurchasesPackage | null =
    currentOffering?.annual ??
    currentOffering?.availablePackages.find(
      (p) => p.packageType === 'ANNUAL' || p.identifier === 'yearly'
    ) ?? null;

  const monthlyPackage: PurchasesPackage | null =
    currentOffering?.monthly ??
    currentOffering?.availablePackages.find(
      (p) => p.packageType === 'MONTHLY' || p.identifier === 'monthly'
    ) ?? null;

  // Prices are hardcoded during pre-launch — RevenueCat test products return
  // placeholder prices. Once live products are configured in App Store Connect,
  // revert to:
  //   yearlyPackage?.product.priceString ?? '$49.99'
  //   monthlyPackage?.product.priceString ?? '$12.99'
  const yearlyDisplayPrice = '$49.99';
  const monthlyPrice = '$12.99';
  const day7Price = selectedPlan === 'yearly' ? `${yearlyDisplayPrice}/yr` : `${monthlyPrice}/mo`;
  const gardenName = garden_name.trim() || 'Your glow garden';
  const gardenSeeds = selected_rituals.length > 0 ? selected_rituals : focus_areas;
  const visibleSeeds = gardenSeeds.slice(0, 3);
  const remainingSeedCount = Math.max(gardenSeeds.length - visibleSeeds.length, 0);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setIsLoadingOfferings(true);
    const offering = await fetchOfferings();
    if (offering) setCurrentOffering(offering);
    setIsLoadingOfferings(false);
  };

  const selectedPackage = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;

  const handleStartTrial = async () => {
    if (!selectedPackage) {
      Alert.alert(
        "We can't reach the store",
        "Subscription plans haven't loaded yet. Check your connection and try again.",
        [
          { text: 'Retry', onPress: () => loadOfferings() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    setIsPurchasing(true);
    try {
      const { customerInfo, isPremium } = await purchasePackage(selectedPackage);
      setCustomerInfo(customerInfo);
      setIsPremium(isPremium);
      if (isPremium) router.push('/(onboarding)/invite');
    } catch (e: any) {
      if (e?.code !== 'PURCHASE_CANCELLED') {
        Alert.alert('Purchase failed', e?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const { customerInfo, isPremium } = await restorePurchases();
      setCustomerInfo(customerInfo);
      setIsPremium(isPremium);
      if (isPremium) {
        Alert.alert('Restored!', 'Your premium access has been restored.', [
          { text: 'Continue', onPress: () => router.push('/(onboarding)/invite') },
        ]);
      } else {
        Alert.alert("No purchases found", "We couldn't find any previous purchases for this account.");
      }
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const busy = isPurchasing || isRestoring;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={['#D8C9EC', '#F2B4CC', '#FBD4BF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerEmoji}>🌸</Text>
        <Text style={styles.headerTitle}>Tend your garden, your way.</Text>
        <Text style={styles.headerSubtitle}>Premium keeps every seed visible.</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Personalized recap */}
        <View style={styles.recapCard}>
          <Text style={styles.recapEyebrow}>YOUR GARDEN PLAN</Text>
          <Text style={styles.recapTitle}>{gardenName}</Text>
          <Text style={styles.recapBody}>
            Your first seeds are ready. The trial keeps them growing while you build the rhythm.
          </Text>
          {visibleSeeds.length > 0 && (
            <View style={styles.seedList}>
              {visibleSeeds.map((seed) => (
                <View key={seed} style={styles.seedPill}>
                  <Text style={styles.seedPillText}>{seed}</Text>
                </View>
              ))}
              {remainingSeedCount > 0 && (
                <View style={styles.seedPill}>
                  <Text style={styles.seedPillText}>+{remainingSeedCount} more</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Everything included</Text>
          {FEATURES.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.planSelector}>
          <Pressable
            style={[styles.planPill, selectedPlan === 'yearly' && styles.planPillSelected]}
            onPress={() => setSelectedPlan('yearly')}
            disabled={busy}
          >
            {selectedPlan === 'yearly' && (
              <View style={styles.planBestBadge}>
                <Text style={styles.planBestBadgeText}>BEST VALUE</Text>
              </View>
            )}
            <Text style={[styles.planPillName, selectedPlan === 'yearly' && styles.planPillNameSelected]}>
              Yearly
            </Text>
            <Text style={[styles.planPillPrice, selectedPlan === 'yearly' && styles.planPillPriceSelected]}>
              {yearlyDisplayPrice}/yr
            </Text>
            <Text style={[styles.planPillSub, selectedPlan === 'yearly' && styles.planPillSubSelected]}>
              Just $4.17/mo · Save 68%
            </Text>
          </Pressable>

          <Pressable
            style={[styles.planPill, selectedPlan === 'monthly' && styles.planPillSelected]}
            onPress={() => setSelectedPlan('monthly')}
            disabled={busy}
          >
            <Text style={[styles.planPillName, selectedPlan === 'monthly' && styles.planPillNameSelected]}>
              Monthly
            </Text>
            <Text style={[styles.planPillPrice, selectedPlan === 'monthly' && styles.planPillPriceSelected]}>
              {monthlyPrice}/mo
            </Text>
            <Text style={[styles.planPillSub, selectedPlan === 'monthly' && styles.planPillSubSelected]}>
              Billed monthly
            </Text>
          </Pressable>
        </View>

        {/* Offer card — trial timeline */}
        {isLoadingOfferings ? (
          <ActivityIndicator color="#E87FA6" style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.offerCard}>
            <LinearGradient
              colors={['rgba(232,127,166,0.14)', 'rgba(216,201,236,0.18)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offerGradient}
            >
              {selectedPlan === 'yearly' && (
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>SAVE 65% · FREE TRIAL</Text>
                </View>
              )}

              <Text style={styles.offerTitle}>How your trial works</Text>
              <Text style={styles.offerQualifier}>
                {selectedPlan === 'yearly'
                  ? 'Free for 7 days, then billed yearly'
                  : 'Free for 7 days, then billed monthly'}
              </Text>

              <View style={styles.offerDivider} />

              <View style={styles.trialTimeline}>
                <View style={styles.timelineStep}>
                  <Text style={styles.timelineIcon}>🌱</Text>
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineDay}>TODAY</Text>
                    <Text style={styles.timelineDesc}>Start free — no payment yet</Text>
                  </View>
                </View>
                <View style={styles.timelineStep}>
                  <Text style={styles.timelineIcon}>🔔</Text>
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineDay}>DAY 5</Text>
                    <Text style={styles.timelineDesc}>We&apos;ll remind you, 2 days left</Text>
                  </View>
                </View>
                <View style={styles.timelineStep}>
                  <Text style={styles.timelineIcon}>💳</Text>
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineDay}>DAY 7</Text>
                    <Text style={styles.timelineDesc}>{day7Price} — or cancel anytime</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && { opacity: 0.88 },
              (busy || (!isLoadingOfferings && !selectedPackage)) && { opacity: 0.6 },
            ]}
            onPress={handleStartTrial}
            disabled={busy}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#1A1028" />
            ) : !isLoadingOfferings && !selectedPackage ? (
              <Text style={styles.ctaButtonText}>Plans unavailable — tap to retry</Text>
            ) : (
              <Text style={styles.ctaButtonText}>Start 7-day free trial</Text>
            )}
          </Pressable>

          <Text style={styles.trustText}>
            No clutter, no guilt — just a softer way to stay consistent.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
            onPress={handleRestore}
            disabled={busy}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#9E8880" />
            ) : (
              <Text style={styles.linkButtonText}>Restore purchase</Text>
            )}
          </Pressable>

          {/* Legal footer */}
          <View style={styles.legalFooter}>
            <Text style={styles.legalText}>
              By continuing you agree to our{' '}
              <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
                Privacy Policy
              </Text>
              {' '}and{' '}
              <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
                Terms of Service
              </Text>
              .{'\n'}Cancel anytime in App Store settings.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFAF8' },
  contentContainer: { flexGrow: 1 },

  // Header
  header: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  headerEmoji: { fontSize: 48, marginBottom: 16 },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.65)',
    textAlign: 'center',
    lineHeight: 22,
  },

  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },

  // Recap card
  recapCard: {
    backgroundColor: '#FFF7F3',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(163,139,106,0.22)',
    padding: 20,
    marginBottom: 16,
  },
  recapEyebrow: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#A98A79',
    letterSpacing: 1,
    marginBottom: 8,
  },
  recapTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 8,
  },
  recapBody: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.68)',
    lineHeight: 21,
  },
  seedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  seedPill: {
    backgroundColor: 'rgba(183,194,165,0.26)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(123,142,102,0.16)',
  },
  seedPillText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#697B5E',
  },

  // Features
  featuresCard: {
    backgroundColor: '#FFF7F3',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(163,139,106,0.22)',
    padding: 20,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 13,
    fontFamily: 'SpaceMono-Bold',
    color: '#A98A79',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  featureText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
    flex: 1,
  },

  // Plan selector
  planSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  planPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.1)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  planPillSelected: {
    borderColor: '#E87FA6',
    backgroundColor: 'rgba(232,127,166,0.07)',
  },
  planBestBadge: {
    backgroundColor: '#E87FA6',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
  },
  planBestBadgeText: {
    fontSize: 8,
    fontFamily: 'SpaceMono-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planPillName: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E8880',
  },
  planPillNameSelected: { color: '#C45A82' },
  planPillPrice: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#9E8880',
  },
  planPillPriceSelected: { color: '#3A2E2B' },
  planPillSub: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.4)',
    textAlign: 'center',
  },
  planPillSubSelected: { color: 'rgba(58,46,43,0.55)' },

  // Offer card
  offerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(232,127,166,0.28)',
    shadowColor: '#E87FA6',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  offerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E87FA6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  offerBadgeText: {
    fontSize: 9,
    fontFamily: 'SpaceMono-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  offerTitle: {
    fontSize: 17,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 4,
  },
  offerQualifier: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.6)',
    marginBottom: 16,
  },
  offerDivider: {
    height: 1,
    backgroundColor: 'rgba(232,127,166,0.2)',
    marginBottom: 16,
  },
  trialTimeline: {
    gap: 14,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  timelineIcon: {
    fontSize: 22,
    width: 28,
    textAlign: 'center',
  },
  timelineBody: { flex: 1 },
  timelineDay: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  timelineDesc: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
    lineHeight: 20,
  },

  // Actions
  actionsSection: { gap: 12 },
  ctaButton: {
    backgroundColor: '#E87FA6',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#E87FA6',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#1A1028',
  },
  trustText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.58)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  linkButton: { paddingVertical: 10, alignItems: 'center' },
  linkButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#9E8880',
  },

  // Legal footer
  legalFooter: {
    paddingTop: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.4)',
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    color: 'rgba(58,46,43,0.55)',
    textDecorationLine: 'underline',
  },
});
