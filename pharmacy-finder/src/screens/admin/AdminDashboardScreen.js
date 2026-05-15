
import { useContext, useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Location from 'expo-location';
import { AuthContext } from '../../context/AuthContext';
import { pharmacyAPI } from '../../services/api';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

const TABS = [
  { key: 'info', label: 'Pharmacy Info' },
  { key: 'medicines', label: 'Medicines' },
  { key: 'hours', label: 'Opening Hours' },
];

const AdminDashboardScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState('info');
  const [savingLocation, setSavingLocation] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.success) {
        Alert.alert('Error', result.error || 'Logout failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const updateCurrentLocation = async () => {
    const pharmacyId = user?.id || user?._id;
    if (!pharmacyId) {
      showMessage('Error', 'Unable to identify this pharmacy account');
      return;
    }

    try {
      setSavingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        showMessage('Location required', 'Allow location access to update the pharmacy map position');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        mayShowUserSettingsDialog: true,
      });

      await pharmacyAPI.updatePharmacy(pharmacyId, {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      showMessage('Location updated', 'The pharmacy map position has been saved');
    } catch (error) {
      showMessage('Error', error.response?.data?.message || error.message || 'Location update failed');
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBand}>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>{user?.pharmacyName}</Text>
          <Text style={styles.subtitle}>Pharmacy Dashboard</Text>
        </View>
      </View>

      <View style={styles.tabBand}>
        <View style={[styles.tabRow, styles.contentWrapper]}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabButton, tab === t.key && styles.tabButtonActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabButtonText, tab === t.key && styles.tabButtonTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.contentWrapper}>
          {tab === 'info' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pharmacy Info</Text>
              <Text>Name: {user?.pharmacyName}</Text>
              <Text>Address: {user?.address}</Text>
              <Text>Phone: {user?.phone}</Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={updateCurrentLocation}
                disabled={savingLocation}
              >
                <Text style={styles.locationButtonText}>
                  {savingLocation ? 'Saving Location...' : 'Update Map Location'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {tab === 'medicines' && (
            <View style={styles.section}><Text style={styles.sectionTitle}>Medicines Management (Coming Soon)</Text></View>
          )}
          {tab === 'hours' && (
            <View style={styles.section}><Text style={styles.sectionTitle}>Opening Hours (Coming Soon)</Text></View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footerBand}>
        <TouchableOpacity style={[styles.logoutButton, styles.contentWrapper]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  headerBand: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  tabBand: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    backgroundColor: colors.white,
  },
  tabButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  tabButtonTextActive: {
    color: colors.primary,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    flexGrow: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  locationButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  footerBand: {
    padding: spacing.lg,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AdminDashboardScreen;
