import { Platform } from 'react-native';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

export const ENTITLEMENT_ID = 'Glowera Pro';

let purchasesModule: any | null = null;
let purchasesUnavailable = false;

async function getPurchases() {
  if (purchasesUnavailable) return null;
  if (purchasesModule) return purchasesModule;

  try {
    const mod = await import('react-native-purchases');
    if (!mod?.default?.configure || !mod?.default?.setLogLevel) {
      purchasesUnavailable = true;
      console.warn('[Purchases] RevenueCat native module unavailable');
      return null;
    }
    purchasesModule = mod;
    return mod;
  } catch (error) {
    purchasesUnavailable = true;
    console.warn('[Purchases] RevenueCat native module unavailable:', error);
    return null;
  }
}

/**
 * Call once at app startup (after fonts load, before routing)
 */
export async function initPurchases(userId?: string | null) {
  try {
    if (!IOS_KEY) {
      console.warn('[Purchases] No RevenueCat API key found; purchases disabled');
      return;
    }

    const mod = await getPurchases();
    if (!mod) return;

    if (__DEV__) {
      mod.default.setLogLevel(mod.LOG_LEVEL.DEBUG);
    }

    mod.default.configure({
      apiKey: Platform.OS === 'ios' ? IOS_KEY : IOS_KEY, // add ANDROID_KEY here if needed
      appUserID: userId ?? undefined, // undefined means RevenueCat generates anonymous ID
    });
  } catch (error) {
    purchasesUnavailable = true;
    console.warn('[Purchases] init skipped:', error);
  }
}

/**
 * Identify a logged-in user so their purchases sync across devices
 */
export async function identifyUser(userId: string) {
  try {
    const mod = await getPurchases();
    await mod?.default.logIn(userId);
  } catch (e) {
    console.warn('[Purchases] logIn failed:', e);
  }
}

/**
 * Fetch current offerings from RevenueCat
 */
export async function fetchOfferings(): Promise<PurchasesOffering | null> {
  try {
    const mod = await getPurchases();
    if (!mod) return null;
    const offerings = await mod.default.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.error('[Purchases] fetchOfferings failed:', e);
    return null;
  }
}

/**
 * Check if user currently has the premium entitlement
 */
export async function checkEntitlements(): Promise<boolean> {
  try {
    const mod = await getPurchases();
    if (!mod) return false;
    const info = await mod.default.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.error('[Purchases] checkEntitlements failed:', e);
    return false;
  }
}

/**
 * Purchase a package from the current offering
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ customerInfo: CustomerInfo; isPremium: boolean }> {
  const mod = await getPurchases();
  if (!mod) {
    throw new Error('Purchases are unavailable in this build.');
  }
  const { customerInfo } = await mod.default.purchasePackage(pkg);
  const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  return { customerInfo, isPremium };
}

/**
 * Restore previous purchases (required by App Store guidelines)
 */
export async function restorePurchases(): Promise<{ customerInfo: CustomerInfo; isPremium: boolean }> {
  const mod = await getPurchases();
  if (!mod) {
    throw new Error('Purchases are unavailable in this build.');
  }
  const customerInfo = await mod.default.restorePurchases();
  const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  return { customerInfo, isPremium };
}
