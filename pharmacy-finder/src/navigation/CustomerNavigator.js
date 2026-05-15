import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import typography from '../styles/typography';
import Icon from '../components/Icon';

import HomeScreen from '../screens/customer/HomeScreen';
import SearchScreen from '../screens/customer/SearchScreen';
import MapScreen from '../screens/customer/MapScreen';
import NearbyPharmaciesScreen from '../screens/customer/NearbyPharmaciesScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import PharmacyDetailScreen from '../screens/customer/PharmacyDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ name, label, focused }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Icon
        name={name}
        size={24}
        color={focused ? colors.primary : colors.textLight}
      />
      <Text style={[
        styles.tabLabel,
        { color: focused ? colors.primary : colors.textLight },
      ]}>
        {label}
      </Text>
    </View>
  );
};

const CustomerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="search" label="Search" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="map" label="Map" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyPharmaciesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="location-on" label="Nearby" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="person" label="Profile" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

const CustomerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="CustomerTabs"
        component={CustomerTabs}
        options={{ animationEnabled: false }}
      />
      <Stack.Screen
        name="PharmacyDetail"
        component={PharmacyDetailScreen}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

export default CustomerNavigator;
