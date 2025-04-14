import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFDAB9', // Peachy background color from styles
          position: 'absolute',
        },
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
            <View {...props} style={{ opacity: 0.5 }}>
              {props.children}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
