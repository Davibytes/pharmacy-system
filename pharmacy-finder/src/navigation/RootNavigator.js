import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import colors from '../styles/colors';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import CustomerNavigator from './CustomerNavigator';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['http://localhost:3000'],
  config: {
    screens: {
      Welcome: '',
      Login: 'login',
      Signup: 'signup',
      ForgotPassword: {
        path: 'reset-password/:resetToken',
        parse: {
          resetToken: (resetToken) => resetToken,
        },
      },
    },
  },
};

const RootNavigator = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    console.log('RootNavigator: No auth context');
    return (
      <AppShell>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  const { user, userType, loading, logoutTrigger } = authContext;
  const isCustomer = user && userType === 'customer';

  console.log('=== RootNavigator Debug ===');
  console.log('User:', user ? 'EXISTS' : 'NULL');
  console.log('UserType:', userType);
  console.log('Loading:', loading);

  if (loading) {
    return (
      <AppShell>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background },
          }}
        >
          {/* DIAGNOSTIC SCREEN - REMOVE THIS AFTER TESTING
          <Stack.Screen
            name="Diagnostic"
            component={DiagnosticScreen}
            options={{ animationEnabled: false }}
          /> */}

          {!isCustomer ? (
            <>
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ animationEnabled: false }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ animationEnabled: true }}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{ animationEnabled: true }}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ animationEnabled: true }}
              />
              <Stack.Screen
                name="GuestCustomerApp"
                component={CustomerNavigator}
                options={{ animationEnabled: true }}
              />
            </>
          ) : (
            <Stack.Screen
              name="CustomerApp"
              component={CustomerNavigator}
              options={{ animationEnabled: false }}
              key={logoutTrigger}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppShell>
  );
};

const AppShell = ({ children }) => (
  <View style={styles.shell}>
    <View style={styles.viewport}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  viewport: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default RootNavigator;
