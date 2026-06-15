import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function NotFoundScreen() {
  const router = useRouter();

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#F5E6E0', '#EDD5CB', '#E8C9BC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.main}>
        <Text style={styles.kicker}>LOST PATH</Text>
        <Text style={styles.headline}>This page</Text>
        <Text style={styles.headlineItalic}>doesn't exist.</Text>
        <Text style={styles.subhead}>
          But your garden is just a tap away.
        </Text>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={handleHome}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
        >
          <Text style={styles.buttonText}>Take me home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 200,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  main: { flex: 1, justifyContent: 'center', marginBottom: 80 },
  kicker: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    letterSpacing: 1.6,
    color: '#C45A82',
    marginBottom: 20,
  },
  headline: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 44,
    color: '#3A2E2B',
    letterSpacing: -0.6,
    lineHeight: 52,
  },
  headlineItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 44,
    color: '#3A2E2B',
    letterSpacing: -0.6,
    lineHeight: 52,
    marginBottom: 22,
  },
  subhead: {
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    fontSize: 16,
    color: '#8C7670',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  bottom: {},
  button: {
    backgroundColor: '#3A2E2B',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF6F2',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
