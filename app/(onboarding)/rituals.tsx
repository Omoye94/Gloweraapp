import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton, ChecklistItem } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const RITUAL_OPTIONS = [
  { label: 'Drink water',       icon: '💧', time: 'MORNING'  },
  { label: 'Move my body',      icon: '🏃‍♀️', time: 'MORNING'  },
  { label: 'Morning skincare',  icon: '🌸', time: 'MORNING'  },
  { label: 'Take supplements',  icon: '💊', time: 'MORNING'  },
  { label: 'Reflect & journal', icon: '📝', time: 'EVENING'  },
  { label: 'Evening wind-down', icon: '🌙', time: 'EVENING'  },
  { label: 'Mindful breathing', icon: '🧘‍♀️', time: 'ANYTIME'  },
  { label: 'Gratitude practice',icon: '✨', time: 'EVENING'  },
];

export default function RitualsScreen() {
  const router = useRouter();
  const { selected_rituals, toggleRitual } = useOnboardingStore();

  const isValid = selected_rituals.length >= 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.main}>
        <Text style={styles.label}>PLANT YOUR FIRST SEEDS</Text>
        <Text style={styles.headline}>Which glow habits should your garden grow from?</Text>
        <Text style={styles.body}>Choose one to five rituals. Each one becomes a seed you can tend daily.</Text>

        <View style={styles.list}>
          {RITUAL_OPTIONS.map((r) => {
            const isSelected = selected_rituals.includes(r.label);
            const isMaxed = selected_rituals.length >= 5 && !isSelected;
            return (
              <ChecklistItem
                key={r.label}
                label={`${r.icon}  ${r.label}`}
                sublabel={r.time}
                checked={isSelected}
                onPress={() => { if (!isMaxed) toggleRitual(r.label); }}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title={`Plant my seeds${selected_rituals.length > 0 ? ` (${selected_rituals.length})` : ''}`}
          onPress={() => router.push('/(onboarding)/firstgrowth')}
          disabled={!isValid}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  label: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: 'rgba(242,180,204,0.6)', letterSpacing: 1.2, marginBottom: 12 },
  headline: { fontSize: 31, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#FEFAF9', lineHeight: 38, marginBottom: 10 },
  body: { fontSize: 15, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.50)', lineHeight: 22, marginBottom: 22 },
  list: { gap: 0 },
  bottom: { paddingTop: 24 },
});
