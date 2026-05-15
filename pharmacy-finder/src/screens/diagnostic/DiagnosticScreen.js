import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const DiagnosticScreen = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>NO AUTH CONTEXT</Text>
      </SafeAreaView>
    );
  }

  const { user, userType, loading, token } = authContext;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>APP DIAGNOSTIC</Text>

        <View style={styles.section}>
          <Text style={styles.label}>User:</Text>
          <Text style={styles.value}>{user ? JSON.stringify(user, null, 2) : 'NULL'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>UserType:</Text>
          <Text style={styles.value}>{userType || 'NULL'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Loading:</Text>
          <Text style={styles.value}>{String(loading)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Token:</Text>
          <Text style={styles.value}>{token ? 'EXISTS' : 'NULL'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Should Show:</Text>
          <Text style={styles.value}>
            {loading ? 'LOADING SPINNER' : user ? 'USER DASHBOARD' : 'WELCOME SCREEN'}
          </Text>
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
  scroll: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.lg,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.body,
    color: colors.text,
    fontFamily: 'monospace',
  },
  error: {
    ...typography.h2,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default DiagnosticScreen;