import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../src/components/onboarding';
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
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(232,127,166,0.4)' }}
              thumbColor={morning_reminder ? '#E87FA6' : 'rgba(255,255,255,0.4)'}
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
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(232,127,166,0.4)' }}
              thumbColor={evening_reminder ? '#E87FA6' : 'rgba(255,255,255,0.4)'}
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
            <ActivityIndicator size="large" color="#E87FA6" />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  label: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: 'rgba(242,180,204,0.6)', letterSpacing: 1.2, marginBottom: 12 },
  headline: { fontSize: 28, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#FEFAF9', lineHeight: 36, letterSpacing: -0.3, marginBottom: 10 },
  body: { fontSize: 15, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.5)', lineHeight: 22, marginBottom: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    padding: 20, marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardEmoji: { fontSize: 22 },
  cardTitle: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '600', color: '#FEFAF9' },
  cardSubtitle: { fontSize: 12, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  timePillsScroll: { marginTop: 14 },
  timePillsRow: { gap: 8 },
  timePill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timePillSelected: { backgroundColor: 'rgba(232,127,166,0.18)', borderColor: 'rgba(232,127,166,0.5)' },
  timePillText: { fontSize: 13, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.5)' },
  timePillTextSelected: { color: '#F2B4CC', fontWeight: '600' },
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 14, marginTop: 14,
  },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  previewApp: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 },
  previewTime: { fontSize: 10, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.25)' },
  previewTitle: { fontSize: 14, fontFamily: 'DMSans', fontWeight: '600', color: '#FEFAF9', marginBottom: 2 },
  previewBody: { fontSize: 13, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.5)', lineHeight: 19 },
  bottom: { paddingTop: 8 },
  loadingWrap: { alignItems: 'center', paddingVertical: 20 },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.5)' },
  notNowBtn: { paddingVertical: 14, alignItems: 'center' },
  notNowText: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '500', color: 'rgba(255,255,255,0.45)' },
});
