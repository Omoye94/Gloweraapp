import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/context';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.tabIconContainer}>
      <View style={[
        styles.iconWrapper,
        focused && {
          backgroundColor: isDark ? 'rgba(232, 164, 200, 0.15)' : 'rgba(255, 153, 181, 0.12)',
        },
      ]}>
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      </View>
      <Text style={[
        styles.tabLabel,
        { color: focused ? theme.primary : theme.textMuted },
      ]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: isDark ? 'rgba(42, 36, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(61, 42, 53, 0.5)' : 'rgba(255, 237, 224, 0.5)',
            shadowColor: isDark ? '#000000' : '#D4A3B3',
          },
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarBackground: () => (
          <View style={[
            styles.tabBarBackground,
            { backgroundColor: isDark ? 'rgba(42, 36, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)' },
          ]} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏡" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: 'Garden',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🌸" label="Glow Garden" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="glowstack"
        options={{
          title: 'Glow Stack',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💊" label="Glow Stack" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Reflections',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="✨" label="Reflect" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎯" label="Challenges" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🌙" label="You" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="community"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 28,
    borderTopWidth: 0,
    elevation: 0,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
