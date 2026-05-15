import React, { useEffect } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import { View, Text } from 'react-native';

SplashScreen.preventAutoHideAsync();

const CLEAR_STORAGE_ON_START = false; // SET TO TRUE TO CLEAR LOGIN DATA

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        console.log('Loading fonts...');

        // CLEAR STORAGE IF NEEDED (for testing)
        if (CLEAR_STORAGE_ON_START) {
          console.log('Clearing AsyncStorage...');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('userType');
          console.log('Storage cleared!');
        }

        await Font.loadAsync({
          MaterialIcons: require('react-native-vector-icons/Fonts/MaterialIcons.ttf'),
        });
        console.log('Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (e) {
        console.error('Font loading error:', e);
        setError(e.message);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    loadFonts();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red', marginBottom: 10 }}>Error Loading App</Text>
        <Text style={{ fontSize: 14 }}>{error}</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log('App rendering');

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}