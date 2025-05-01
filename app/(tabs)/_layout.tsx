import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  // Listen to orientation changes and get current window dimensions
  const window = useWindowDimensions();

  // Optionally, you can adjust tabBarStyle based on orientation or dimensions
  // For now, just ensure the tab bar stretches to the width of the screen in both orientations
  const tabBarStyle = {
    backgroundColor: '#FFDAB9',
    position: 'absolute' as const,
    width: window.width, // Ensures tab bar always matches screen width
    // Optionally, you can adjust height or other styles based on window.height/width here
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarStyle,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Farm Animals',
          tabBarIcon: ({ color }) => <Ionicons name="paw" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Wild Animals',
          tabBarIcon: ({ color }) => <Ionicons name="leaf" size={28} color={color} />,
          tabBarButton: (props) => (
            <View {...props} style={[{ opacity: 0.5 }, props.style]}>
              {props.children}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
