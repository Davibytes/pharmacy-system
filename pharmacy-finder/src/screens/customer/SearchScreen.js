import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { AppContext } from '../../context/AppContext';
import { medicineAPI, pharmacyAPI } from '../../services/api';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import PharmacySkeleton from '../../components/PharmacySkeleton';

const SearchScreen = ({ navigation }) => {
  const appContext = useContext(AppContext);
  const setSharedPharmacies = appContext?.setPharmacies;
  const [pharmacies, setLocalPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');

  const contentMaxWidth = 600;

  const applyFiltersAndSort = React.useCallback(() => {
    let results = [...pharmacies];

    if (openOnly) {
      results = results.filter((p) => p.isOpen);
    }

    if (sortBy === 'distance') {
      results = pharmacyAPI.sortByDistance(results);
    } else if (sortBy === 'rating') {
      results = pharmacyAPI.sortByRating(results);
    } else if (sortBy === 'name') {
      results = pharmacyAPI.sortByName(results);
    }

    setFilteredPharmacies(results);
  }, [pharmacies, openOnly, sortBy]);

  const fetchPharmacies = React.useCallback(async (queryValue = '') => {
    const trimmedQuery = queryValue.trim();

    if (!trimmedQuery) {
      setHasSearched(false);
      setLocalPharmacies([]);
      setFilteredPharmacies([]);
      if (setSharedPharmacies) {
        setSharedPharmacies([]);
      }
      setError('Enter a medicine or product name to search.');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      let locationCoords = null;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        locationCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } else {
        setError('Location is off. Showing basic search results without distance.');
      }

      const response = await medicineAPI.search(
        trimmedQuery,
        locationCoords?.latitude,
        locationCoords?.longitude
      );
      
      setLocalPharmacies(response.data);
      if (setSharedPharmacies) {
        setSharedPharmacies(response.data);
      }

      if (trimmedQuery && response.data.length === 0) {
        setError(
          locationCoords
            ? `No nearby pharmacies found with "${trimmedQuery}" in stock.`
            : `No pharmacies found with "${trimmedQuery}" in stock.`
        );
      }
    } catch (err) {
      setError('Failed to load pharmacies. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [setSharedPharmacies]);

  const handleSearch = React.useCallback(() => {
    fetchPharmacies(searchQuery);
  }, [fetchPharmacies, searchQuery]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const callPharmacy = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`);
  };

  const renderPharmacy = ({ item }) => (
    <Card style={styles.pharmacyCard}>
      <View style={styles.pharmacyHeader}>
        <View style={styles.pharmacyInfo}>
          <Text style={styles.pharmacyName}>{item.pharmacyName}</Text>
          
          <View style={styles.addressContainer}>
            <Icon name="location-on" size={14} color={colors.textSecondary} />
            <Text style={styles.pharmacyAddress}>
              {item.address}
              {item.distance && ` (${item.distance} km)`}
            </Text>
          </View>

          {item.rating && (
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}

          {item.matchingMedicines?.length > 0 && (
            <View style={styles.matchesContainer}>
              <Text style={styles.matchesLabel}>Available medicine</Text>
              {item.matchingMedicines.slice(0, 3).map((medicine) => (
                <View key={medicine._id} style={styles.matchItem}>
                  {medicine.imageUrl ? (
                    <Image
                      source={{ uri: medicine.imageUrl }}
                      style={styles.matchImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.matchImageFallback}>
                      <Icon name="local-pharmacy" size={18} color={colors.textLight} />
                    </View>
                  )}
                  <Text style={styles.matchText}>
                    {medicine.name}
                    {medicine.dosage ? `, ${medicine.dosage}` : ''}
                    {medicine.quantity !== undefined ? `, ${medicine.quantity} in stock` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View
          style={[
            styles.statusBadge,
            item.isOpen ? styles.openBadge : styles.closedBadge,
          ]}
        >
          <Icon
            name={item.isOpen ? 'check-circle' : 'cancel'}
            size={16}
            color={item.isOpen ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.statusText,
              { color: item.isOpen ? colors.success : colors.danger },
            ]}
          >
            {item.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>

      <View style={styles.pharmacyFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Map', { pharmacy: item })}
        >
          <Icon name="location-on" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>Locate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => callPharmacy(item.phone)}
        >
          <Icon name="call" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PharmacyDetail', { pharmacy: item })}
        >
          <Icon name="information-circle" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name={hasSearched ? 'search-off' : 'search'} size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>
        {hasSearched ? 'No pharmacies found' : 'Search for medicine'}
      </Text>
      <Text style={styles.emptyText}>
        {hasSearched
          ? 'Try another medicine name, dosage, or product spelling.'
          : 'Enter a medicine or product name to see pharmacies that have it in stock.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <View style={[styles.searchHeader, { maxWidth: contentMaxWidth }]}>
        <View style={styles.searchInputWrapper}>
          <Input
            placeholder="Search medicine or product..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Icon name={loading ? 'hourglass-empty' : 'search'} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={[styles.errorContainer, { maxWidth: contentMaxWidth }]}>
          <Icon name="error" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && pharmacies.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              openOnly && styles.filterButtonActive,
            ]}
            onPress={() => setOpenOnly(!openOnly)}
          >
            <Icon
              name={openOnly ? 'check-circle' : 'radio-button-unchecked'}
              size={16}
              color={openOnly ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.filterButtonText,
                openOnly && styles.filterButtonTextActive,
              ]}
            >
              Open Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'distance' && styles.filterButtonActive,
            ]}
            onPress={() => setSortBy('distance')}
          >
            <Icon
              name="near-me"
              size={16}
              color={sortBy === 'distance' ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.filterButtonText,
                sortBy === 'distance' && styles.filterButtonTextActive,
              ]}
            >
              Distance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'rating' && styles.filterButtonActive,
            ]}
            onPress={() => setSortBy('rating')}
          >
            <Icon
              name="star"
              size={16}
              color={sortBy === 'rating' ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.filterButtonText,
                sortBy === 'rating' && styles.filterButtonTextActive,
              ]}
            >
              Rating
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'name' && styles.filterButtonActive,
            ]}
            onPress={() => setSortBy('name')}
          >
            <Icon
              name="sort-by-alpha"
              size={16}
              color={sortBy === 'name' ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.filterButtonText,
                sortBy === 'name' && styles.filterButtonTextActive,
              ]}
            >
              Name
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {!loading && pharmacies.length > 0 && (
        <View style={styles.resultCounter}>
          <Text style={styles.resultCountText}>
            {filteredPharmacies.length} result{filteredPharmacies.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={() => <PharmacySkeleton />}
            scrollEnabled={false}
          />
        </View>
      ) : filteredPharmacies.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredPharmacies}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
          ]}
          renderItem={renderPharmacy}
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    alignSelf: 'center',
    width: '100%',
  },
  searchInputWrapper: {
    flex: 1,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  errorContainer: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
    backgroundColor: colors.danger + '20',
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    alignSelf: 'center',
  },
  errorText: {
    color: colors.danger,
    ...typography.bodySmall,
    flex: 1,
  },
  filterBar: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  filterBarContent: {
    gap: spacing.sm,
    paddingRight: spacing.screenPadding,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  resultCounter: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  resultCountText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pharmacyCard: {
    marginBottom: spacing.md,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    ...typography.label,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  pharmacyAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  ratingText: {
    ...typography.labelSmall,
    color: '#FFB800',
  },
  matchesContainer: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  matchesLabel: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  matchText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  matchImage: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.light,
  },
  matchImageFallback: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  openBadge: {
    backgroundColor: colors.success + '20',
  },
  closedBadge: {
    backgroundColor: colors.danger + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pharmacyFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.light,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  backButton: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
});

export default SearchScreen;
