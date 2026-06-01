import { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { SolarIcon } from '../../src/components/ui/SolarIcon';
import { gloweraScreen } from '../../src/theme';

const { colors } = gloweraScreen;

const ICON_SIZE = 24;

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(pillOpacity, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={styles.iconWrap}>
      <Animated.View style={[styles.iconPill, { opacity: pillOpacity }]} />
      <SolarIcon
        name={focused ? `${name}-bold` : `${name}-linear`}
        size={ICON_SIZE}
        color={focused ? colors.primaryPressed : colors.textMuted}
      />
    </View>
  );
}

function TabLabel({ focused, title }: { focused: boolean; title: string }) {
  return (
    <Text style={[styles.label, focused ? styles.labelActive : styles.labelInactive]} numberOfLines={1}>
      {title}
    </Text>
  );
}

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView tint="light" intensity={75} style={StyleSheet.absoluteFill} />
      <View style={styles.surfaceOverlay} />
      <View style={styles.topHairline} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;

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
        tabBarShowLabel: true,
        tabBarItemStyle: styles.tabItem,
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: colors.primaryPressed,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home-2" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} title="Home" />,
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: 'Garden',
          tabBarIcon: ({ focused }) => <TabIcon name="leaf" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} title="Garden" />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ focused }) => <TabIcon name="pen-new-square" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} title="Journal" />,
        }}
      />
      <Tabs.Screen
        name="glowstack"
        options={{
          title: 'Stack',
          tabBarIcon: ({ focused }) => <TabIcon name="pill" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} title="Stack" />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Grow',
          tabBarIcon: ({ focused }) => <TabIcon name="cup-star" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} title="Grow" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused }) => <TabIcon name="user-circle" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} title="Me" />,
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
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  surfaceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,250,248,0.55)',
  },
  topHairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(244,232,224,0.6)',
  },
  tabItem: {
    paddingTop: 6,
    gap: 6,
  },
  iconWrap: {
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  iconPill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
    backgroundColor: 'rgba(242,180,204,0.24)',
  },
  label: {
    fontFamily: 'DMSans',
    fontSize: 10,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primaryPressed,
    fontWeight: '600',
  },
  labelInactive: {
    color: colors.textMuted,
    fontWeight: '500',
  },
});
