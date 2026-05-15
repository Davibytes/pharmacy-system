import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SuperAdminDashboardScreen from '../screens/superadmin/SuperAdminDashboardScreen';

const Stack = createNativeStackNavigator();

const SuperAdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Dashboard' component={SuperAdminDashboardScreen} />
    </Stack.Navigator>
  );
};

export default SuperAdminNavigator;
