import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { pharmacyAPI } from '../../services/api';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const DEFAULT_LOCATION = {
  latitude: 3.8480,
  longitude: 11.5021,
};

const MAP_DELTA = 0.08;
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

let googleMapsScriptPromise;

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

const getOpenStreetMapUrl = ({ latitude, longitude }) => {
  const bbox = [
    longitude - MAP_DELTA,
    latitude - MAP_DELTA,
    longitude + MAP_DELTA,
    latitude + MAP_DELTA,
  ].join(',');

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
};

const getMapEmbedUrl = ({ latitude, longitude }) => {
  return getOpenStreetMapUrl({ latitude, longitude });
};

const getDirectionsUrl = (pharmacy) => {
  const coordinates = pharmacy?.mapCoordinates || getPharmacyCoordinates(pharmacy);
  if (!coordinates) return null;

  const destination = `${coordinates.latitude},${coordinates.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};

const loadGoogleMapsScript = () => {
  if (!GOOGLE_MAPS_API_KEY || typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-pharmacy-google-maps]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google.maps));
        existingScript.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.dataset.pharmacyGoogleMaps = 'true';
      script.onload = () => resolve(window.google.maps);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return googleMapsScriptPromise;
};

const GooglePharmacyMap = ({ center, pharmacies, selectedPharmacyId, onSelectPharmacy }) => {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript()
      .then((maps) => {
        if (!isMounted || !maps || !mapElementRef.current) return;

        if (!mapRef.current) {
          mapRef.current = new maps.Map(mapElementRef.current, {
            center,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
        }
      })
      .catch((error) => {
        console.error('Google Maps script failed to load:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [center]);

  useEffect(() => {
    const maps = typeof window !== 'undefined' ? window.google?.maps : null;
    if (!maps || !mapRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new maps.LatLngBounds();

    pharmacies.forEach((pharmacy) => {
      const position = pharmacy.mapCoordinates;
      if (!position) return;

      const marker = new maps.Marker({
        position,
        map: mapRef.current,
        title: pharmacy.pharmacyName,
        label: pharmacy._id === selectedPharmacyId ? 'P' : undefined,
      });

      marker.addListener('click', () => onSelectPharmacy(pharmacy._id));
      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, 72);
    } else {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(13);
    }
  }, [center, pharmacies, selectedPharmacyId, onSelectPharmacy]);

  useEffect(() => {
    const selectedPharmacy = pharmacies.find((pharmacy) => pharmacy._id === selectedPharmacyId);
    if (mapRef.current && selectedPharmacy?.mapCoordinates) {
      mapRef.current.panTo(selectedPharmacy.mapCoordinates);
    }
  }, [pharmacies, selectedPharmacyId]);

  return React.createElement('div', {
    ref: mapElementRef,
    style: styles.googleMap,
  });
};

const MapScreen = ({ route, navigation }) => {
  const focusedPharmacy = route.params?.pharmacy;
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(focusedPharmacy?._id || null);

  const mappedPharmacies = useMemo(
    () =>
      (focusedPharmacy
        ? [focusedPharmacy, ...pharmacies.filter((pharmacy) => pharmacy._id !== focusedPharmacy._id)]
        : pharmacies
      )
        .map((pharmacy) => ({
          ...pharmacy,
          mapCoordinates: getPharmacyCoordinates(pharmacy),
        }))
        .filter((pharmacy) => pharmacy.mapCoordinates),
    [focusedPharmacy, pharmacies]
  );

  const selectedPharmacy =
    mappedPharmacies.find((pharmacy) => pharmacy._id === selectedPharmacyId) ||
    mappedPharmacies[0];
  const mapCenter = selectedPharmacy?.mapCoordinates || userLocation;
  const directionsUrl = selectedPharmacy ? getDirectionsUrl(selectedPharmacy) : null;

  const getLocationAndFetchPharmacies = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let coordinates = DEFAULT_LOCATION;
      let hasUserLocation = false;
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coordinates = currentLocation.coords;
        hasUserLocation = true;
      }

      const { latitude, longitude } = coordinates;
      setUserLocation({ latitude, longitude });

      let response = hasUserLocation
        ? await pharmacyAPI.getNearby(latitude, longitude, 50)
        : await pharmacyAPI.getAll();

      if (hasUserLocation && (response.data || []).length === 0) {
        response = await pharmacyAPI.getAll();
      }

      setPharmacies(response.data);
      setSelectedPharmacyId(focusedPharmacy?._id || response.data[0]?._id || null);

      if (response.data.length === 0 && !focusedPharmacy) {
        setError('No registered pharmacies with saved locations found');
      }
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
      setError('Error loading pharmacies');
    } finally {
      setLoading(false);
    }
  }, [focusedPharmacy]);

  useEffect(() => {
    getLocationAndFetchPharmacies();
  }, [getLocationAndFetchPharmacies]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapHeader}>
        <View style={styles.mapHeaderIcon}>
          <Icon name="map" size={36} color={colors.primary} />
        </View>
        <View style={styles.mapHeaderText}>
          <Text style={styles.title}>Nearby Map</Text>
          <Text style={styles.subtitle}>
            Showing pharmacies near {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
        <TouchableOpacity onPress={getLocationAndFetchPharmacies} style={styles.refreshButton}>
          <Icon name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={getLocationAndFetchPharmacies} fullWidth />
        </View>
      ) : (
        <View style={styles.mapArea}>
          <View style={styles.mapFrame}>
            {GOOGLE_MAPS_API_KEY ? (
              <GooglePharmacyMap
                center={mapCenter}
                pharmacies={mappedPharmacies}
                selectedPharmacyId={selectedPharmacy?._id}
                onSelectPharmacy={setSelectedPharmacyId}
              />
            ) : (
              React.createElement('iframe', {
                title: selectedPharmacy
                  ? `${selectedPharmacy.pharmacyName} map`
                  : 'Nearby pharmacies map',
                src: getMapEmbedUrl(mapCenter),
                style: styles.mapEmbed,
                loading: 'lazy',
                referrerPolicy: 'no-referrer-when-downgrade',
              })
            )}
          </View>

          {selectedPharmacy ? (
            <View style={styles.selectedPanel}>
              <TouchableOpacity
                style={styles.pharmacyCard}
                onPress={() => navigation.navigate('PharmacyDetail', { pharmacy: selectedPharmacy })}
                activeOpacity={0.86}
              >
                <View style={styles.markerBadge}>
                  <Icon name="local-pharmacy" size={22} color={colors.white} />
                </View>
                <View style={styles.pharmacyInfo}>
                  <Text style={styles.pharmacyName}>{selectedPharmacy.pharmacyName}</Text>
                  <Text style={styles.pharmacyAddress}>{selectedPharmacy.address}</Text>
                  <Text style={styles.pharmacyMeta}>
                    {selectedPharmacy.distance !== undefined ? `${selectedPharmacy.distance} km away` : 'Distance unavailable'}
                    {selectedPharmacy.phone ? ` . ${selectedPharmacy.phone}` : ''}
                  </Text>
                </View>
                <Icon name="chevron-right" size={22} color={colors.textLight} />
              </TouchableOpacity>

              {directionsUrl ? (
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => Linking.openURL(directionsUrl)}
                >
                  <Icon name="directions" size={18} color={colors.white} />
                  <Text style={styles.directionsText}>Get Directions</Text>
                </TouchableOpacity>
              ) : null}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pharmacyList}
              >
                {mappedPharmacies.map((pharmacy) => {
                  const isSelected = pharmacy._id === selectedPharmacy?._id;
                  return (
                    <TouchableOpacity
                      key={pharmacy._id}
                      style={[
                        styles.pharmacyListItem,
                        isSelected && styles.pharmacyListItemActive,
                      ]}
                      onPress={() => setSelectedPharmacyId(pharmacy._id)}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.pharmacyListName,
                          isSelected && styles.pharmacyListNameActive,
                        ]}
                      >
                        {pharmacy.pharmacyName}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.pharmacyListMeta,
                          isSelected && styles.pharmacyListMetaActive,
                        ]}
                      >
                        {pharmacy.distance !== undefined ? `${pharmacy.distance} km` : 'location saved'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Icon name="location-off" size={34} color={colors.textLight} />
              <Text style={styles.emptyText}>No pharmacies with map coordinates found nearby.</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mapHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapHeaderText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
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
  mapArea: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  mapFrame: {
    flex: 1,
    minHeight: 420,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  mapEmbed: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    borderStyle: 'none',
  },
  googleMap: {
    width: '100%',
    height: '100%',
  },
  selectedPanel: {
    gap: spacing.sm,
  },
  pharmacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  directionsButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  directionsText: {
    ...typography.label,
    color: colors.white,
  },
  pharmacyList: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pharmacyListItem: {
    width: 170,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  pharmacyListItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pharmacyListName: {
    ...typography.labelSmall,
    color: colors.text,
  },
  pharmacyListNameActive: {
    color: colors.white,
  },
  pharmacyListMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  pharmacyListMetaActive: {
    color: colors.white,
  },
  markerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pharmacyAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  pharmacyMeta: {
    ...typography.labelSmall,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default MapScreen;
