import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolarIcon } from '../../src/components/ui/SolarIcon';
import { gloweraScreen } from '../../src/theme';

const { colors, fonts } = gloweraScreen;

interface TabIconProps {
  name: string;
  label: string;
  focused: boolean;
}

function TabIcon({ name, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <SolarIcon
        name={focused ? `${name}-bold` : `${name}-linear`}
        size={24}
        color={focused ? colors.primaryPressed : colors.textMuted}
      />
      <Text style={[styles.tabLabel, { color: focused ? colors.primaryPressed : colors.textMuted }]}>
        {label}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 82 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: insets.bottom,
          },
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primaryPressed,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-2" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: 'Garden',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="leaf" label="Garden" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="pen-new-square" label="Journal" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="glowstack"
        options={{
          title: 'Stack',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="pill" label="Stack" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Quests',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="cup-star" label="Quests" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="user-circle" label="Me" focused={focused} />
          ),
        }}
      />

      {/* Hidden — reachable via push navigation only */}
      <Tabs.Screen name="habits" options={{ href: null }} />
      <Tabs.Screen name="journey" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="gratitude" options={{ href: null }} />
      <Tabs.Screen name="beauty" options={{ href: null }} />
      <Tabs.Screen name="reflect" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    gap: 3,
  },
  tabLabel: {
    fontSize: 8,
    fontFamily: fonts.label,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryPressed,
    marginTop: 2,
  },
});
