import { Redirect } from 'expo-router';

export default function LegacyAuthOnboardingRedirect() {
  return <Redirect href="/(onboarding)/welcome" />;
}
