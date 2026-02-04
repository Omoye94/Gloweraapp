import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Home, Flower2, Trophy, Users, User } from 'lucide-react-native';
import { colors } from '../../lib/constants';

interface TabIconProps {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
}

function TabIcon({ focused, icon, label }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-2">
      <View
        className={`p-2 rounded-xl ${focused ? 'bg-primary/20' : ''}`}
      >
        {icon}
      </View>
      <Text
        className={`text-xs mt-1 ${
          focused ? 'text-primary font-medium' : 'text-text-light'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <Home
                  size={24}
                  color={focused ? colors.primary : colors.textLight}
                  strokeWidth={focused ? 2.5 : 2}
                />
              }
              label="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <Flower2
                  size={24}
                  color={focused ? colors.primary : colors.textLight}
                  strokeWidth={focused ? 2.5 : 2}
                />
              }
              label="Garden"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <Trophy
                  size={24}
                  color={focused ? colors.primary : colors.textLight}
                  strokeWidth={focused ? 2.5 : 2}
                />
              }
              label="Challenges"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <Users
                  size={24}
                  color={focused ? colors.primary : colors.textLight}
                  strokeWidth={focused ? 2.5 : 2}
                />
              }
              label="Community"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <User
                  size={24}
                  color={focused ? colors.primary : colors.textLight}
                  strokeWidth={focused ? 2.5 : 2}
                />
              }
              label="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}
