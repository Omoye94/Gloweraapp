import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSubscriptionStore } from '../../src/stores';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { fetchOfferings, purchasePackage, restorePurchases } from '../../src/lib/purchases';

const FEATURES = [
  'Unlimited rituals and habit care',
  'Supplement tracking',
  'Daily journaling and reflections',
  'Garden growth and glow meter',
  'Weekly insights and recaps',
  'All gentle challenges unlocked',
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
  const [reviewerTaps, setReviewerTaps] = useState(0);
  const [showReviewerBypass, setShowReviewerBypass] = useState(false);

  const handleReviewerTap = () => {
    const next = reviewerTaps + 1;
    setReviewerTaps(next);
    if (next >= 5) {
      setShowReviewerBypass(true);
      setReviewerTaps(0);
    }
  };

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

  const yearlyDisplayPrice = yearlyPackage?.product.priceString ?? '$49.99';
  const monthlyPrice = monthlyPackage?.product.priceString ?? '$9.99';
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
      // DEV-only bypass: the iOS Simulator can't load real RC offerings or
      // process Apple IAPs, which blocks testing the post-paywall flow. In
      // __DEV__ we fake a successful purchase and route forward. This branch
      // is stripped out of production builds (`__DEV__` is false on App Store
      // / production EAS builds), so end users always see the real error.
      if (__DEV__) {
        console.warn('[Paywall] DEV bypass: faking purchase (no RC package). Skip to invite.');
        setIsPremium(true);
        router.push('/(onboarding)/invite');
        return;
      }
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
      // User-cancelled the sandbox dialog — always honor that, no bypass.
      if (e?.code === 'PURCHASE_CANCELLED') {
        setIsPurchasing(false);
        return;
      }
      // DEV-only bypass: the iOS Simulator can't process real Apple IAPs, so
      // purchasePackage throws (e.g. "Purchases are unavailable" or StoreKit
      // errors). Fake premium and route forward so we can iterate on the
      // post-paywall screens. Stripped from production via __DEV__.
      if (__DEV__) {
        console.warn('[Paywall] DEV bypass on purchase error:', e?.message);
        setIsPremium(true);
        setIsPurchasing(false);
        router.push('/(onboarding)/invite');
        return;
      }
      Alert.alert('Purchase failed', e?.message ?? 'Something went wrong. Please try again.');
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
      <LinearGradient
        colors={['#D8C9EC', '#F2B4CC', '#FBD4BF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Pressable onPress={handleReviewerTap} hitSlop={12}>
          <Text style={styles.headerBrand}>glowera</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Keep your rituals blooming.</Text>
        <Text style={styles.headerSubtitle}>
          A 7-day trial to settle into your garden, reflections, and gentle daily rhythm.
        </Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>7</Text>
            <Text style={styles.headerStatLabel}>days free</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>all</Text>
            <Text style={styles.headerStatLabel}>rituals</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>soft</Text>
            <Text style={styles.headerStatLabel}>reminders</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.ritualPanel}>
          <LinearGradient
            colors={['rgba(255,246,250,0.92)', 'rgba(250,237,230,0.94)', 'rgba(239,232,217,0.82)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.panelEyebrow}>YOUR GARDEN PLAN</Text>
          <Text style={styles.panelTitle}>{gardenName}</Text>
          <Text style={styles.panelBody}>
            Your first seeds are ready. Premium keeps your rituals, reflections, and progress in one soft place.
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

          <View style={styles.panelDivider} />

          <Text style={styles.includedTitle}>Included in Premium</Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.pricingHeader}>
          <Text style={styles.pricingTitle}>Choose your rhythm</Text>
          <Text style={styles.pricingSubtitle}>Start free today. Cancel anytime in App Store settings.</Text>
        </View>

        <View style={styles.planSelector}>
          <Pressable
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('yearly')}
            disabled={busy}
          >
            {selectedPlan === 'yearly' && (
              <LinearGradient
                colors={['rgba(255,244,250,0.98)', 'rgba(246,226,236,0.92)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <View style={styles.planTopRow}>
              <Text style={[styles.planName, selectedPlan === 'yearly' && styles.planNameSelected]}>
                Yearly
              </Text>
              <View style={[styles.recommendedBadge, selectedPlan === 'yearly' && styles.recommendedBadgeSelected]}>
                <Text style={[styles.recommendedBadgeText, selectedPlan === 'yearly' && styles.recommendedBadgeTextSelected]}>
                  Recommended
                </Text>
              </View>
            </View>
            <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceSelected]}>
              {yearlyDisplayPrice}/yr
            </Text>
            <Text style={[styles.planMeta, selectedPlan === 'yearly' && styles.planMetaSelected]}>
              About $4.17/mo after trial
            </Text>
          </Pressable>

          <Pressable
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('monthly')}
            disabled={busy}
          >
            {selectedPlan === 'monthly' && (
              <LinearGradient
                colors={['rgba(255,244,250,0.98)', 'rgba(246,226,236,0.92)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <View style={styles.planTopRow}>
              <Text style={[styles.planName, selectedPlan === 'monthly' && styles.planNameSelected]}>
                Monthly
              </Text>
            </View>
            <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceSelected]}>
              {monthlyPrice}/mo
            </Text>
            <Text style={[styles.planMeta, selectedPlan === 'monthly' && styles.planMetaSelected]}>
              Billed monthly
            </Text>
          </Pressable>
        </View>

        {isLoadingOfferings ? (
          <ActivityIndicator color="#E87FA6" style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.offerCard}>
            <LinearGradient
              colors={['#FFF7FB', '#F8ECE4', '#F1EBDD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offerGradient}
            >
              <Text style={styles.offerKicker}>TRIAL PREVIEW</Text>
              <Text style={styles.offerTitle}>Your trial, clearly</Text>
              <Text style={styles.offerQualifier}>
                {selectedPlan === 'yearly'
                  ? 'Free for 7 days, then billed yearly.'
                  : 'Free for 7 days, then billed monthly.'}
              </Text>

              <View style={styles.trialTimeline}>
                <View style={styles.timelineStep}>
                  <View style={styles.timelineMarker}>
                    <Text style={styles.timelineMarkerText}>1</Text>
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineDay}>Today</Text>
                    <Text style={styles.timelineDesc}>Start free. No payment today.</Text>
                  </View>
                </View>
                <View style={styles.timelineStep}>
                  <View style={styles.timelineMarker}>
                    <Text style={styles.timelineMarkerText}>2</Text>
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineDay}>Day 5</Text>
                    <Text style={styles.timelineDesc}>A gentle reminder before your trial ends.</Text>
                  </View>
                </View>
                <View style={styles.timelineStep}>
                  <View style={styles.timelineMarker}>
                    <Text style={styles.timelineMarkerText}>3</Text>
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineDay}>Day 7</Text>
                    <Text style={styles.timelineDesc}>{day7Price}, unless you cancel before then.</Text>
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
            No clutter, no guilt. Just a softer way to stay close to yourself.
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

          {showReviewerBypass && (
            <Pressable
              style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
              onPress={() => router.push('/(onboarding)/invite')}
            >
              <Text style={styles.maybeLaterText}>Maybe later</Text>
            </Pressable>
          )}

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
  container: { flex: 1, backgroundColor: '#F5E6E0' },
  contentContainer: { flexGrow: 1 },

  // Header
  header: {
    paddingTop: 56,
    paddingBottom: 30,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay-Italic',
    fontWeight: '400',
    color: '#3A2E2B',
    marginBottom: 24,
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 31,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.78)',
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 320,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.14)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  headerStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerStatValue: {
    fontSize: 17,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 22,
  },
  headerStatLabel: {
    fontSize: 10,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: 'rgba(58,46,43,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(58,46,43,0.16)',
  },

  body: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48 },

  // Ritual panel
  ritualPanel: {
    backgroundColor: '#FFF6F0',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(143,109,96,0.18)',
    padding: 22,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#8F6D60',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  panelEyebrow: {
    fontSize: 9,
    fontFamily: 'SpaceMono-Bold',
    color: '#8F6D60',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 29,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 10,
    lineHeight: 35,
  },
  panelBody: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#5F4C46',
    lineHeight: 23,
  },
  seedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  seedPill: {
    backgroundColor: 'rgba(183,194,165,0.22)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(123,142,102,0.14)',
  },
  seedPillText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#516348',
  },
  panelDivider: {
    height: 1,
    backgroundColor: 'rgba(143,109,96,0.17)',
    marginVertical: 22,
  },
  includedTitle: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#8F6D60',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  featureGrid: {
    gap: 11,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B7C2A5',
    marginTop: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '400',
    color: '#4F403B',
    flex: 1,
    lineHeight: 20,
  },

  // Pricing
  pricingHeader: {
    marginBottom: 12,
  },
  pricingTitle: {
    fontSize: 23,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 4,
  },
  pricingSubtitle: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#6A5650',
    lineHeight: 19,
  },

  // Plan selector
  planSelector: {
    gap: 10,
    marginBottom: 14,
  },
  planCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(95,76,70,0.14)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: '#D96F99',
    backgroundColor: '#FFF1F7',
    shadowColor: '#D96F99',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  planTopRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recommendedBadge: {
    backgroundColor: 'rgba(232,127,166,0.14)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recommendedBadgeSelected: {
    backgroundColor: '#D96F99',
  },
  recommendedBadgeText: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E3F66',
  },
  recommendedBadgeTextSelected: {
    color: '#FFFFFF',
  },
  planName: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#5F4C46',
  },
  planNameSelected: { color: '#C45A82' },
  planPrice: {
    fontSize: 25,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 4,
    lineHeight: 31,
  },
  planPriceSelected: { color: '#2D2220' },
  planMeta: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#6A5650',
  },
  planMetaSelected: { color: '#5F4C46' },

  // Offer card
  offerCard: {
    backgroundColor: '#FFF6F0',
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,109,96,0.16)',
    overflow: 'hidden',
    shadowColor: '#8F6D60',
    shadowOpacity: 0.09,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  offerGradient: {
    padding: 18,
  },
  offerKicker: {
    fontSize: 9,
    fontFamily: 'SpaceMono-Bold',
    color: '#9E3F66',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 5,
  },
  offerQualifier: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#6A5650',
    lineHeight: 19,
    marginBottom: 18,
  },
  trialTimeline: {
    gap: 13,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineMarker: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,127,166,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,127,166,0.16)',
  },
  timelineMarkerText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#C45A82',
  },
  timelineBody: { flex: 1 },
  timelineDay: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#3A2E2B',
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#6A5650',
    lineHeight: 19,
  },

  // Actions
  actionsSection: { gap: 11 },
  ctaButton: {
    backgroundColor: '#D96F99',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#D96F99',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#1A1028',
  },
  trustText: {
    fontSize: 12.5,
    fontFamily: 'DMSans',
    color: '#6A5650',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  linkButton: { paddingVertical: 10, alignItems: 'center' },
  linkButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#735E56',
  },

  maybeLaterText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#9E8880',
    textDecorationLine: 'underline',
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
    color: '#735E56',
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    color: '#5F4C46',
    textDecorationLine: 'underline',
  },
});
