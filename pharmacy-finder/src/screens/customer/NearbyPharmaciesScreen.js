import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { pharmacyAPI } from '../../services/api';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import Button from '../../components/Button';

const NearbyPharmaciesScreen = ({ navigation }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLocationAndFetchPharmacies();
  }, []);

  const getLocationAndFetchPharmacies = async () => {
    try {
      setLoading(true);
      setError('');

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to find nearby pharmacies');
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;

      const response = await pharmacyAPI.getNearby(latitude, longitude, 10);
      console.log('Nearby pharmacies:', response.data);

      setPharmacies(response.data);
      if (response.data.length === 0) {
        setError('No pharmacies found within 10km of your location');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error finding nearby pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const callPharmacy = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`);
  };

  return (
    <SafeAreaView style={styles.container}>
       {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nearby Pharmacies</Text>
          <Text style={styles.headerSubtitle}>
            {pharmacies.length} pharmacies found
          </Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Try Again"
              onPress={getLocationAndFetchPharmacies}
              fullWidth
            />
          </Card>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding nearby pharmacies...</Text>
          </View>
        )}

        {!loading && pharmacies.length > 0 && (
          <View style={styles.pharmaciesList}>
            {pharmacies.map((pharmacy) => (
              <TouchableOpacity
                key={pharmacy._id}
                onPress={() =>
                  navigation.navigate('PharmacyDetail', { pharmacy })
                }
              >
                <Card style={styles.pharmacyCard}>
                  {/* Pharmacy Header */}
                  <View style={styles.pharmacyHeader}>
                    <View style={styles.pharmacyInfo}>
                      <Text style={styles.pharmacyName}>
                        {pharmacy.pharmacyName}
                      </Text>
                      <Text style={styles.pharmacyOwner}>
                        {pharmacy.fullName}
                      </Text>
                    </View>
                    <View style={styles.distanceBadge}>
                      <Icon name="location-on" size={16} color={colors.primary} />
                      <Text style={styles.distanceText}>{pharmacy.distance} km</Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.details}>
                    <View style={styles.detailItem}>
                      <Icon name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{pharmacy.address}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="call" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{pharmacy.phone}</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => callPharmacy(pharmacy.phone)}
                    >
                      <Icon name="call" size={20} color={colors.primary} />
                      <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('PharmacyDetail', { pharmacy })}
                    >
                      <Icon name="information-circle" size={20} color={colors.primary} />
                      <Text style={styles.actionText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!loading && pharmacies.length === 0 && !error && (
          <Card style={styles.emptyCard}>
            <Icon name="alert-circle" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No pharmacies found</Text>
            <Text style={styles.emptySubtext}>
              Try increasing the search distance
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorCard: {
    backgroundColor: colors.danger + '20',
    borderColor: colors.danger,
    marginBottom: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    ...typography.body,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  pharmaciesList: {
    gap: spacing.md,
  },
  pharmacyCard: {
    marginBottom: spacing.md,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pharmacyOwner: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  distanceText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  details: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionText: {
    ...typography.label,
    color: colors.primary,
  },
  emptyCard: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  backButton: {
  paddingHorizontal: spacing.screenPadding,
  paddingVertical: spacing.md,
},
});

export default NearbyPharmaciesScreen;
