import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide the tab bar completely
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
        }}
      />
    </Tabs>
  );
}
