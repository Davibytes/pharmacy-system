import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { medicineAPI, pharmacyAPI } from '../../services/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import Input from '../../components/Input';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const getOpenDays = (openingDays) => {
  if (!openingDays) return 'Not provided';

  const days = Object.entries(openingDays)
    .filter(([, isOpen]) => isOpen)
    .map(([day]) => day.slice(0, 3));

  return days.length > 0 ? days.join(', ') : 'Not provided';
};

const formatPrice = (price) => {
  if (typeof price !== 'number') return 'Price not provided';
  return `${price.toLocaleString()} FCFA`;
};

const getPharmacyCoordinates = (pharmacy) => {
  if (typeof pharmacy?.latitude === 'number' && typeof pharmacy?.longitude === 'number') {
    return {
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
    };
  }

  const [longitude, latitude] = pharmacy?.location?.coordinates || [];
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { latitude, longitude };
  }

  return null;
};

const PharmacyDetailScreen = ({ route, navigation }) => {
  const initialPharmacy = route.params?.pharmacy;
  const [pharmacy, setPharmacy] = useState(initialPharmacy);
  const [medicines, setMedicines] = useState([]);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pharmacyId = pharmacy?._id || initialPharmacy?._id;

  useEffect(() => {
    const loadDetails = async () => {
      if (!pharmacyId) {
        setError('Pharmacy details are unavailable.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [pharmacyResponse, medicinesResponse] = await Promise.all([
          pharmacyAPI.getById(pharmacyId),
          medicineAPI.getByPharmacy(pharmacyId),
        ]);

        setPharmacy(pharmacyResponse.data);
        setMedicines(medicinesResponse.data);
      } catch (err) {
        console.error('Pharmacy detail error:', err);
        setError('Unable to load pharmacy details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [pharmacyId]);

  const filteredMedicines = useMemo(() => {
    const normalizedQuery = medicineQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return medicines;
    }

    return medicines.filter((medicine) =>
      [medicine.name, medicine.description, medicine.dosage, medicine.manufacturer, medicine.unit]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [medicines, medicineQuery]);

  const callPharmacy = () => {
    if (!pharmacy?.phone) return;
    Linking.openURL(`tel:${pharmacy.phone.replace(/[^\d+]/g, '')}`);
  };

  const viewOnMap = () => {
    navigation.navigate('CustomerTabs', {
      screen: 'Map',
      params: { pharmacy },
    });
  };

  const openDirections = () => {
    const coordinates = getPharmacyCoordinates(pharmacy);
    if (!coordinates) return;

    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading pharmacy details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Try Again" onPress={() => navigation.replace('PharmacyDetail', { pharmacy })} fullWidth />
          </Card>
        ) : (
          <>
            <Card style={styles.headerCard}>
              <View style={styles.headerIcon}>
                <Icon name="local-pharmacy" size={34} color={colors.white} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{pharmacy?.pharmacyName}</Text>
                <Text style={styles.owner}>{pharmacy?.fullName}</Text>
              </View>
            </Card>

            <Card style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Pharmacy Info</Text>
              <View style={styles.infoRow}>
                <Icon name="location-on" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>{pharmacy?.address || 'Address not provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="call" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>{pharmacy?.phone || 'Phone not provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="schedule" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {pharmacy?.openingHours?.open || '08:00'} to {pharmacy?.openingHours?.close || '20:00'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="event-available" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>{getOpenDays(pharmacy?.openingDays)}</Text>
              </View>
              {pharmacy?.distance !== undefined && (
                <View style={styles.infoRow}>
                  <Icon name="near-me" size={18} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{pharmacy.distance} km away</Text>
                </View>
              )}
            </Card>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={callPharmacy}>
                <Icon name="call" size={20} color={colors.white} />
                <Text style={styles.actionText}>Call Pharmacy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={viewOnMap}
              >
                <Icon name="location-on" size={20} color={colors.primary} />
                <Text style={[styles.actionText, styles.secondaryActionText]}>View Map</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={openDirections}
              >
                <Icon name="directions" size={20} color={colors.primary} />
                <Text style={[styles.actionText, styles.secondaryActionText]}>Directions</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.medicinesCard}>
              <Text style={styles.sectionTitle}>Available Medicines</Text>
              <Input
                placeholder="Search this pharmacy's medicines..."
                value={medicineQuery}
                onChangeText={setMedicineQuery}
              />

              {filteredMedicines.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="search-off" size={34} color={colors.textLight} />
                  <Text style={styles.emptyText}>No medicines found.</Text>
                </View>
              ) : (
                <View style={styles.medicineList}>
                  {filteredMedicines.map((medicine) => (
                    <View key={medicine._id} style={styles.medicineItem}>
                      <View style={styles.medicineContent}>
                        {medicine.imageUrl ? (
                          <Image
                            source={{ uri: medicine.imageUrl }}
                            style={styles.medicineImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.medicineImageFallback}>
                            <Icon name="local-pharmacy" size={28} color={colors.textLight} />
                          </View>
                        )}
                        <View style={styles.medicineDetails}>
                          <View style={styles.medicineHeader}>
                            <Text style={styles.medicineName}>{medicine.name}</Text>
                            <Text style={styles.medicinePrice}>{formatPrice(medicine.price)}</Text>
                          </View>
                          <Text style={styles.medicineMeta}>
                            {medicine.dosage ? `${medicine.dosage}, ` : ''}
                            {medicine.unit || 'unit not provided'}
                          </Text>
                          {medicine.description ? (
                            <Text style={styles.medicineDescription}>{medicine.description}</Text>
                          ) : null}
                          <Text style={styles.stockText}>
                            {medicine.quantity > 0 ? `${medicine.quantity} in stock` : 'Out of stock'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </>
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
  backButton: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorCard: {
    backgroundColor: colors.danger + '20',
    borderColor: colors.danger,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  owner: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoCard: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: 140,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryAction: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    ...typography.label,
    color: colors.white,
  },
  secondaryActionText: {
    color: colors.primary,
  },
  medicinesCard: {
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  medicineList: {
    gap: spacing.md,
  },
  medicineItem: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  medicineContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  medicineImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: colors.light,
  },
  medicineImageFallback: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineDetails: {
    flex: 1,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  medicineName: {
    ...typography.label,
    color: colors.text,
    flex: 1,
  },
  medicinePrice: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  medicineMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  medicineDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  stockText: {
    ...typography.labelSmall,
    color: colors.success,
    marginTop: spacing.sm,
  },
});

export default PharmacyDetailScreen;
