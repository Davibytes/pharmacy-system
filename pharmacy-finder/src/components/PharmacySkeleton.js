import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const PharmacySkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.textLine} />
        <View style={[styles.textLine, styles.shortLine]} />
      </View>
      <View style={[styles.textLine, styles.footerLine]} />
      <View style={styles.actionsRow}>
        <View style={styles.actionButton} />
        <View style={styles.actionButton} />
        <View style={styles.actionButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    marginBottom: spacing.md,
  },
  textLine: {
    height: 16,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  shortLine: {
    width: '60%',
  },
  footerLine: {
    height: 14,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    height: 36,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
  },
});

export default PharmacySkeleton;