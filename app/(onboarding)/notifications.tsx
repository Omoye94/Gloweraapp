import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { requestPermission, scheduleDaily } from '../../src/lib/notifications';

const MORNING_TIMES = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'];
const EVENING_TIMES = ['7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];

export default function NotificationsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    morning_reminder, evening_reminder,
    morning_time, evening_time,
    setMorningReminder, setEveningReminder,
    setMorningTime, setEveningTime,
  } = useOnboardingStore();

  const hasAnyReminder = morning_reminder || evening_reminder;

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) await scheduleDaily();
    } catch (e) {
      console.error('[Notifications]', e);
    } finally {
      setIsLoading(false);
      router.push('/(onboarding)/welcome');
    }
  };

  return (
    <OnboardingScreen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.main}>
        <Text style={styles.label}>GENTLE NUDGES</Text>
        <Text style={styles.headline}>Stay on track{'\n'}your way</Text>
        <Text style={styles.body}>
          Reminders to keep your glow ritual going — never guilt, never pressure.
        </Text>

        {/* Morning card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardEmoji}>☀️</Text>
              <View>
                <Text style={styles.cardTitle}>Morning ritual</Text>
                <Text style={styles.cardSubtitle}>Start your day with intention</Text>
              </View>
            </View>
            <Switch
              value={morning_reminder}
              onValueChange={setMorningReminder}
              trackColor={{ false: 'rgba(58,46,43,0.18)', true: 'rgba(232,127,166,0.55)' }}
              thumbColor={morning_reminder ? '#E87FA6' : '#FFFAF5'}
            />
          </View>

          {morning_reminder && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timePillsScroll} contentContainerStyle={styles.timePillsRow}>
              {MORNING_TIMES.map((time) => (
                <Pressable
                  key={time}
                  style={[styles.timePill, morning_time === time && styles.timePillSelected]}
                  onPress={() => setMorningTime(time)}
                >
                  <Text style={[styles.timePillText, morning_time === time && styles.timePillTextSelected]}>{time}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {morning_reminder && (
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewApp}>GLOWERA</Text>
                <Text style={styles.previewTime}>{morning_time}</Text>
              </View>
              <Text style={styles.previewTitle}>Glowera ✨</Text>
              <Text style={styles.previewBody}>Your garden is ready for a new day of growth.</Text>
            </View>
          )}
        </View>

        {/* Evening card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardEmoji}>🌙</Text>
              <View>
                <Text style={styles.cardTitle}>Evening wind-down</Text>
                <Text style={styles.cardSubtitle}>Reflect on your day</Text>
              </View>
            </View>
            <Switch
              value={evening_reminder}
              onValueChange={setEveningReminder}
              trackColor={{ false: 'rgba(58,46,43,0.18)', true: 'rgba(232,127,166,0.55)' }}
              thumbColor={evening_reminder ? '#E87FA6' : '#FFFAF5'}
            />
          </View>

          {evening_reminder && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timePillsScroll} contentContainerStyle={styles.timePillsRow}>
              {EVENING_TIMES.map((time) => (
                <Pressable
                  key={time}
                  style={[styles.timePill, evening_time === time && styles.timePillSelected]}
                  onPress={() => setEveningTime(time)}
                >
                  <Text style={[styles.timePillText, evening_time === time && styles.timePillTextSelected]}>{time}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {evening_reminder && (
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewApp}>GLOWERA</Text>
                <Text style={styles.previewTime}>{evening_time}</Text>
              </View>
              <Text style={styles.previewTitle}>Glowera 🌙</Text>
              <Text style={styles.previewBody}>Time to reflect. Your garden remembers every moment.</Text>
            </View>
          )}
        </View>
      </View>

        <View style={styles.bottom}>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#C45A82" />
              <Text style={styles.loadingText}>Setting up your garden...</Text>
            </View>
          ) : (
            <>
              <PrimaryButton
                title={hasAnyReminder ? 'Enable reminders' : 'Continue without reminders'}
                onPress={hasAnyReminder ? handleEnable : () => router.push('/(onboarding)/welcome')}
              />
              {hasAnyReminder && (
                <Pressable
                  style={({ pressed }) => [styles.notNowBtn, pressed && { opacity: 0.6 }]}
                  onPress={() => router.push('/(onboarding)/welcome')}
                >
                  <Text style={styles.notNowText}>Not now</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  label: { fontSize: 11, fontFamily: 'SpaceMono-Bold', color: '#C45A82', letterSpacing: 1.6, marginBottom: 12 },
  headline: { fontSize: 30, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#3A2E2B', lineHeight: 38, letterSpacing: -0.3, marginBottom: 10 },
  body: { fontSize: 16, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.75)', lineHeight: 24, marginBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 22,
    borderWidth: 2, borderColor: 'rgba(58,46,43,0.16)',
    padding: 20, marginBottom: 12,
    shadowColor: '#3A2E2B', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardEmoji: { fontSize: 22 },
  cardTitle: { fontSize: 16, fontFamily: 'DMSans', fontWeight: '700', color: '#3A2E2B' },
  cardSubtitle: { fontSize: 12, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.6)', marginTop: 2 },
  timePillsScroll: { marginTop: 14 },
  timePillsRow: { gap: 8, paddingVertical: 4 },
  timePill: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, borderWidth: 1.5,
    backgroundColor: 'rgba(247,232,218,0.6)',
    borderColor: 'rgba(58,46,43,0.14)',
  },
  timePillSelected: { backgroundColor: '#FFFFFF', borderColor: '#C45A82', borderWidth: 2 },
  timePillText: { fontSize: 13, fontFamily: 'DMSans', fontWeight: '500', color: 'rgba(58,46,43,0.65)' },
  timePillTextSelected: { color: '#C45A82', fontWeight: '700' },
  previewCard: {
    backgroundColor: 'rgba(247,232,218,0.65)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(58,46,43,0.1)',
    padding: 14, marginTop: 14,
  },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  previewApp: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: '#C45A82', letterSpacing: 0.8 },
  previewTime: { fontSize: 10, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.5)' },
  previewTitle: { fontSize: 14, fontFamily: 'DMSans', fontWeight: '700', color: '#3A2E2B', marginBottom: 2 },
  previewBody: { fontSize: 13, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.65)', lineHeight: 19 },
  bottom: { paddingTop: 8 },
  loadingWrap: { alignItems: 'center', paddingVertical: 20 },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.7)' },
  notNowBtn: { paddingVertical: 14, alignItems: 'center' },
  notNowText: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '600', color: '#C45A82' },
});
