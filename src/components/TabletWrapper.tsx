import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';

interface TabletWrapperProps {
  children: React.ReactNode;
}

export const TabletWrapper: React.FC<TabletWrapperProps> = ({ children }) => {
  const deviceDimensions = useDeviceDimensions();

  if (!deviceDimensions.isTablet) {
    // On phones, just return children as-is
    return <>{children}</>;
  }

  // On iPad, wrap in a container that centers and scales the content
  return (
    <View style={styles.tabletContainer}>
      <View 
        style={[
          styles.contentContainer,
          {
            transform: [{ scale: deviceDimensions.scale }],
            width: 375, // iPhone width
            height: 812, // iPhone height
          }
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Black background to fill any gaps
  },
  contentContainer: {
    // This will be scaled and centered
  },
}); 