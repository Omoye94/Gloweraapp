import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSubscriptionStore } from '../../src/stores';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { fetchOfferings, purchasePackage, restorePurchases } from '../../src/lib/purchases';

const PREMIUM_FEATURES = [
  { icon: '🌿', label: 'Unlimited rituals' },
  { icon: '💊', label: 'Supplement reminders' },
  { icon: '✍️', label: 'Reflection history' },
  { icon: '🌙', label: 'Guided evening rituals' },
  { icon: '🎨', label: 'Garden themes' },
  { icon: '✨', label: 'Gentle weekly insights' },
];

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
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

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

  const yearlyDisplayPrice = '$49.99';
  const monthlyPrice = monthlyPackage?.product.priceString ?? '$11.99/mo';
  const yearlyMonthly = '$4.17/mo';
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
      router.push('/(onboarding)/notifications');
      return;
    }
    setIsPurchasing(true);
    try {
      const { customerInfo, isPremium } = await purchasePackage(selectedPackage);
      setCustomerInfo(customerInfo);
      setIsPremium(isPremium);
      if (isPremium) router.push('/(onboarding)/notifications');
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
          { text: 'Continue', onPress: () => router.push('/(onboarding)/notifications') },
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

  const handleSkip = () => setShowSkipConfirm(true);

  const continueFree = () => {
    setShowSkipConfirm(false);
    router.push('/(onboarding)/notifications');
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero gradient header */}
        <LinearGradient
          colors={['#D8C9EC', '#F2B4CC', '#FBD4BF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerEmoji}>🌸</Text>
          <Text style={styles.headerTitle}>Stay on top of your glow-up without starting over</Text>
          <Text style={styles.headerSubtitle}>
            Premium keeps your glow habits organized as a garden you can actually tend.
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.recapCard}>
            <Text style={styles.recapEyebrow}>YOUR GARDEN PLAN</Text>
            <Text style={styles.recapTitle}>{gardenName}</Text>
            <Text style={styles.recapBody}>
              Your first seeds are ready. Premium keeps them visible with reminders, reflections,
              garden themes, and weekly glow insights.
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
            {PREMIUM_FEATURES.map((feature, index) => (
              <View
                key={feature.label}
                style={[
                  styles.featureItem,
                  index < PREMIUM_FEATURES.length - 1 && styles.featureItemBorder,
                ]}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Plan selector */}
          {isLoadingOfferings ? (
            <ActivityIndicator color="#E87FA6" style={{ marginTop: 24 }} />
          ) : (
            <View style={styles.plansContainer}>
              <Pressable
                style={[styles.planOption, selectedPlan === 'yearly' && styles.planOptionSelected]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>BEST FOR CONSISTENCY</Text>
                </View>
                <View style={styles.planDetails}>
                  <Text style={[styles.planTitle, selectedPlan === 'yearly' && styles.planTitleSelected]}>Yearly</Text>
                  <Text style={styles.planSubtitle}>{yearlyMonthly}</Text>
                </View>
                <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceSelected]}>
                  {yearlyDisplayPrice}
                </Text>
                <View style={[styles.radioOuter, selectedPlan === 'yearly' && styles.radioOuterSelected]}>
                  {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
                </View>
              </Pressable>

              <Pressable
                style={[styles.planOption, selectedPlan === 'monthly' && styles.planOptionSelected]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={styles.planDetails}>
                  <Text style={[styles.planTitle, selectedPlan === 'monthly' && styles.planTitleSelected]}>Monthly</Text>
                </View>
                <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceSelected]}>
                  {monthlyPrice}
                </Text>
                <View style={[styles.radioOuter, selectedPlan === 'monthly' && styles.radioOuterSelected]}>
                  {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            </View>
          )}

          <Text style={styles.trialText}>
            7-day free trial · then {selectedPlan === 'yearly' ? yearlyDisplayPrice : monthlyPrice}
          </Text>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <Pressable
              style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.88 }, (isPurchasing || isRestoring) && { opacity: 0.6 }]}
              onPress={handleStartTrial}
              disabled={isPurchasing || isRestoring}
            >
              {isPurchasing
                ? <ActivityIndicator size="small" color="#1A1028" />
                : <Text style={styles.ctaButtonText}>Start your gentle trial</Text>
              }
            </Pressable>

            <Text style={styles.trustText}>Cancel anytime. No clutter, no guilt, just a softer way to stay consistent.</Text>

            <Pressable
              style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
              onPress={handleRestore}
              disabled={isPurchasing || isRestoring}
            >
              {isRestoring
                ? <ActivityIndicator size="small" color="#9E8880" />
                : <Text style={styles.linkButtonText}>Restore purchase</Text>
              }
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
              onPress={handleSkip}
              disabled={isPurchasing || isRestoring}
            >
              <Text style={styles.skipButtonText}>Start with the free garden</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showSkipConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSkipConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEyebrow}>FREE GARDEN</Text>
            <Text style={styles.modalTitle}>Begin without Premium?</Text>
            <Text style={styles.modalBody}>
              You can still start today. Premium is what keeps the whole glow-up loop tended:
              reminders, supplements, reflections, themes, and weekly insights in one calm place.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.modalPrimaryButton, pressed && { opacity: 0.88 }]}
              onPress={() => setShowSkipConfirm(false)}
            >
              <Text style={styles.modalPrimaryText}>Keep my garden fully tended</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.modalSecondaryButton, pressed && { opacity: 0.6 }]}
              onPress={continueFree}
            >
              <Text style={styles.modalSecondaryText}>Continue free for now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFAF8' },
  contentContainer: { flexGrow: 1 },
  header: {
    paddingTop: 48, paddingBottom: 32,
    paddingHorizontal: 28, alignItems: 'center',
  },
  headerEmoji: { fontSize: 48, marginBottom: 16 },
  headerTitle: {
    fontSize: 28, fontFamily: 'PlayfairDisplay', fontWeight: '600',
    color: '#3A2E2B', textAlign: 'center', marginBottom: 10, lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: 15, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.65)',
    textAlign: 'center', lineHeight: 22,
  },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
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
  featuresCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(232,127,166,0.15)',
    paddingHorizontal: 20, marginBottom: 20,
    shadowColor: '#E87FA6', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
  },
  featureItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 12,
  },
  featureItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(232,127,166,0.1)' },
  featureIcon: { fontSize: 20 },
  featureLabel: { flex: 1, fontSize: 15, fontFamily: 'DMSans', fontWeight: '500', color: '#3A2E2B' },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(232,127,166,0.15)', borderWidth: 1.5,
    borderColor: '#E87FA6', alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 11, fontWeight: '700', color: '#E87FA6' },
  plansContainer: { gap: 10, marginBottom: 12 },
  planOption: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16, gap: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 2, borderColor: 'rgba(58,46,43,0.1)',
  },
  planOptionSelected: { borderColor: '#E87FA6', backgroundColor: 'rgba(232,127,166,0.08)' },
  planBadge: {
    backgroundColor: '#E87FA6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  planBadgeText: { fontSize: 9, fontFamily: 'SpaceMono-Bold', color: '#FFFFFF', letterSpacing: 0.5 },
  planDetails: { flex: 1 },
  planTitle: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '600', color: '#3A2E2B' },
  planTitleSelected: { color: '#C45A82' },
  planSubtitle: { fontSize: 12, fontFamily: 'DMSans', color: '#9E8880', marginTop: 1 },
  planPrice: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '700', color: '#9E8880' },
  planPriceSelected: { color: '#C45A82' },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: 'rgba(58,46,43,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#E87FA6' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E87FA6' },
  trialText: {
    fontSize: 12, fontFamily: 'DMSans', color: '#9E8880',
    textAlign: 'center', marginBottom: 24,
  },
  actionsSection: { gap: 12 },
  ctaButton: {
    backgroundColor: '#E87FA6', borderRadius: 18,
    paddingVertical: 17, alignItems: 'center',
    shadowColor: '#E87FA6', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 6 },
  },
  ctaButtonText: { fontSize: 16, fontFamily: 'DMSans', fontWeight: '700', color: '#1A1028' },
  trustText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.58)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  linkButton: { paddingVertical: 10, alignItems: 'center' },
  linkButtonText: { fontSize: 14, fontFamily: 'DMSans', fontWeight: '500', color: '#9E8880' },
  skipButton: { paddingVertical: 8, alignItems: 'center' },
  skipButtonText: { fontSize: 12, fontFamily: 'DMSans', color: '#9E8880', textDecorationLine: 'underline' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(58,46,43,0.34)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFAF8',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(232,127,166,0.18)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  },
  modalEyebrow: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#A98A79',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 26,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
  },
  modalBody: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.68)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  modalPrimaryButton: {
    backgroundColor: '#E87FA6',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#1A1028',
  },
  modalSecondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalSecondaryText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#9E8880',
    textDecorationLine: 'underline',
  },
});
