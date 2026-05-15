import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { pharmacyAPI } from '../../services/api';

const DEFAULT_REGION = {
  latitude: 3.8480,
  longitude: 11.5021,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const isValidCoordinate = (coordinate) =>
  coordinate &&
  Number.isFinite(coordinate.latitude) &&
  Number.isFinite(coordinate.longitude) &&
  Math.abs(coordinate.latitude) <= 90 &&
  Math.abs(coordinate.longitude) <= 180 &&
  !(coordinate.latitude === 0 && coordinate.longitude === 0);

const getPharmacyCoordinates = (pharmacy) => {
  if (typeof pharmacy?.latitude === 'number' && typeof pharmacy?.longitude === 'number') {
    const coordinate = {
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
    };
    return isValidCoordinate(coordinate) ? coordinate : null;
  }

  const [longitude, latitude] = pharmacy?.location?.coordinates || [];
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    const coordinate = { latitude, longitude };
    return isValidCoordinate(coordinate) ? coordinate : null;
  }

  return null;
};

const getCurrentAccurateLocation = async () => {
  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
      mayShowUserSettingsDialog: true,
    });
  } catch (error) {
    const lastKnownLocation = await Location.getLastKnownPositionAsync({
      maxAge: 30000,
      requiredAccuracy: 100,
    });

    if (lastKnownLocation) {
      return lastKnownLocation;
    }

    throw error;
  }
};

const MapScreen = ({ route, navigation }) => {
  const focusedPharmacy = route.params?.pharmacy;
  const focusedCoordinates = useMemo(
    () => getPharmacyCoordinates(focusedPharmacy),
    [focusedPharmacy]
  );
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: focusedCoordinates?.latitude || DEFAULT_REGION.latitude,
    longitude: focusedCoordinates?.longitude || DEFAULT_REGION.longitude,
    latitudeDelta: DEFAULT_REGION.latitudeDelta,
    longitudeDelta: DEFAULT_REGION.longitudeDelta,
  });
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const getLocationAndFetchPharmacies = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const { status } = await Location.requestForegroundPermissionsAsync();
      let nextUserLocation = null;

      if (status === 'granted') {
        const currentLocation = await getCurrentAccurateLocation();
        nextUserLocation = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        if (!isValidCoordinate(nextUserLocation)) {
          nextUserLocation = null;
        }
      }

      setUserLocation(nextUserLocation);
      setRegion({
        latitude: focusedCoordinates?.latitude || nextUserLocation?.latitude || DEFAULT_REGION.latitude,
        longitude: focusedCoordinates?.longitude || nextUserLocation?.longitude || DEFAULT_REGION.longitude,
        latitudeDelta: focusedCoordinates ? 0.02 : 0.015,
        longitudeDelta: focusedCoordinates ? 0.02 : 0.015,
      });

      let response = nextUserLocation
        ? await pharmacyAPI.getNearby(
            nextUserLocation.latitude,
            nextUserLocation.longitude,
            50
          )
        : await pharmacyAPI.getAll();

      if (nextUserLocation && (response.data || []).length === 0) {
        response = await pharmacyAPI.getAll();
      }

      const nearbyPharmacies = response.data || [];

      setPharmacies(
        focusedPharmacy
          ? [
              focusedPharmacy,
              ...nearbyPharmacies.filter((pharmacy) => pharmacy._id !== focusedPharmacy._id),
            ]
          : nearbyPharmacies
      );

      if (nearbyPharmacies.length === 0 && !focusedPharmacy) {
        setError('No registered pharmacies with saved locations found');
      }
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
      setError('Error loading pharmacies');
    } finally {
      setLoading(false);
    }
  }, [focusedCoordinates, focusedPharmacy]);

  useEffect(() => {
    getLocationAndFetchPharmacies();
  }, [getLocationAndFetchPharmacies]);

  useEffect(() => {
    if (!mapRef.current || loading) return;

    const coordinates = [
      userLocation,
      ...pharmacies.map(getPharmacyCoordinates),
    ].filter(isValidCoordinate);

    if (coordinates.length < 2) return;

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {
        top: 80,
        right: 60,
        bottom: 160,
        left: 60,
      },
      animated: true,
    });
  }, [loading, pharmacies, userLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={getLocationAndFetchPharmacies} fullWidth />
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            followsUserLocation
            showsMyLocationButton
            showsCompass
            loadingEnabled
            onUserLocationChange={(event) => {
              const coordinate = event.nativeEvent.coordinate;
              if (isValidCoordinate(coordinate)) {
                setUserLocation({
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                });
              }
            }}
          >
            {userLocation && (
              <Marker coordinate={userLocation} title="Your Location" pinColor={colors.primary}>
                <View style={styles.userMarker}>
                  <Icon name="location-on" size={24} color={colors.white} />
                </View>
              </Marker>
            )}

            {pharmacies.map((pharmacy) => {
              const coordinates = getPharmacyCoordinates(pharmacy);
              if (!coordinates) return null;

              return (
                <Marker
                  key={pharmacy._id}
                  coordinate={coordinates}
                  title={pharmacy.pharmacyName}
                  description={pharmacy.address}
                  pinColor={colors.secondary}
                >
                  <View style={styles.pharmacyMarker}>
                    <Icon name="local-pharmacy" size={24} color={colors.white} />
                  </View>
                  <Callout
                    tooltip
                    onPress={() => navigation.navigate('PharmacyDetail', { pharmacy })}
                  >
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{pharmacy.pharmacyName}</Text>
                      <Text style={styles.calloutText}>{pharmacy.address}</Text>
                      <Text style={styles.calloutText}>{pharmacy.distance} km away</Text>
                      <Text style={styles.calloutPhone}>{pharmacy.phone}</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>

          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Icon name="info-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{pharmacies.length} pharmacies nearby</Text>
            </View>
            <TouchableOpacity onPress={getLocationAndFetchPharmacies} style={styles.refreshButton}>
              <Icon name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginTop: spacing.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  pharmacyMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  calloutContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    width: 200,
  },
  calloutTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  calloutText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  calloutPhone: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  infoCard: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.label,
    color: colors.text,
  },
  refreshButton: {
    padding: spacing.sm,
  },
  backButton: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
});

export default MapScreen;
