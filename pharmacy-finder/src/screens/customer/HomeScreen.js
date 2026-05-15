import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import Card from '../../components/Card';
import Icon from '../../components/Icon';

const HomeScreen = ({ navigation }) => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { user } = authContext;
  const contentMaxWidth = 600;
  const displayName = user?.fullName || 'Guest';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <View>
          <Text style={styles.greeting}>Welcome</Text>
          <Text style={styles.userName}>{displayName}</Text>
        </View>
        <View style={styles.navIcons}>
          <TouchableOpacity>
            <Icon name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions Section */}
        <View style={[styles.section, { maxWidth: contentMaxWidth }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Search')}
          >
            <View style={styles.actionIconBox}>
              <Icon name="search" size={32} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Search Medicine</Text>
              <Text style={styles.actionDesc}>Find pharmacies with products in stock</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Map')}
          >
            <View style={styles.actionIconBox}>
              <Icon name="map" size={32} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View on Map</Text>
              <Text style={styles.actionDesc}>See all pharmacies</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Information Card */}
        <View style={[styles.section, { maxWidth: contentMaxWidth }]}>
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="info" size={24} color={colors.primary} />
              <Text style={styles.infoTitle}>How to Use</Text>
            </View>
            <Text style={styles.infoText}>
              Search for a medicine or product, then choose a pharmacy to view stock, contact details, map location, and directions.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
  },
  navIcons: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  section: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  actionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 0,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoTitle: {
    ...typography.label,
    color: colors.primary,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
  },
});

export default HomeScreen;
