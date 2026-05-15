import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../styles/colors';
import { spacing } from '../../styles/spacing';

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'pharmacies', label: 'Pharmacies' },
];

const SuperAdminDashboardScreen = () => {
  const [tab, setTab] = useState('users');

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Super Admin Dashboard</Text>
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
          {tab === 'users' && (
            <View style={styles.section}><Text style={styles.sectionTitle}>User Management (Coming Soon)</Text></View>
          )}
          {tab === 'pharmacies' && (
            <View style={styles.section}><Text style={styles.sectionTitle}>Pharmacy Management (Coming Soon)</Text></View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
});

export default SuperAdminDashboardScreen;
