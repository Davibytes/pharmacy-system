import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Icon from '../../components/Icon';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const goToAuth = (screen, role = 'customer') => {
    const rootNavigation =
      navigation.getParent()?.getParent?.() ||
      navigation.getParent() ||
      navigation;

    rootNavigation.navigate(screen, { role });
  };

  const performLogout = async () => {
    try {
      const result = await logout();
      if (!result.success) {
        Alert.alert('Error', result.error || 'Logout failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        performLogout();
      }
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: performLogout,
          style: 'destructive',
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.guestContainer}>
          <Card style={styles.headerCard}>
            <View style={styles.iconContainer}>
              <Icon name="person" size={40} color={colors.primary} />
            </View>
            <Text style={styles.name}>Guest browsing</Text>
            <Text style={styles.email}>
              Search medicines, view maps, and call pharmacies without an account.
            </Text>
          </Card>

          <Card style={styles.logoutCard}>
            <Button
              title="Sign In"
              onPress={() => goToAuth('Login')}
              fullWidth
            />
            <View style={styles.guestActionGap} />
            <Button
              title="Create Customer Account"
              onPress={() => goToAuth('Signup')}
              variant="outline"
              fullWidth
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.contentWrapper}>
          {/* Header */}
          <Card style={styles.headerCard}>
            <View style={styles.iconContainer}>
              <Icon name="person" size={40} color={colors.primary} />
            </View>
            <Text style={styles.name}>{user?.fullName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </Card>

          {/* Profile Info */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>User Type</Text>
              <Text style={styles.value}>Customer</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Recently'
                }
              </Text>
            </View>
          </Card>

          {/* Logout Button */}
          <Card style={styles.logoutCard}>
            <Button
              title="Logout"
              onPress={handleLogout}
              fullWidth
            />
            <Text style={styles.logoutText}>
              Sign out from your account
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  infoItem: {
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  logoutCard: {
    marginBottom: spacing.xl,
  },
  logoutText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  backButton: {
  paddingHorizontal: spacing.screenPadding,
  paddingVertical: spacing.md,
},
  guestContainer: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
  },
  guestActionGap: {
    height: spacing.md,
  },
});

export default ProfileScreen;
