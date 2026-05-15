import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Icon from '../../components/Icon';

const { width } = Dimensions.get('window');

const SignupScreen = ({ route, navigation }) => {
  const role = route.params?.role || 'customer';
  const authContext = useContext(AuthContext);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isSmallScreen = width < 500;
  const maxWidth = 500;

  if (!authContext) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { customerSignup, loading } = authContext;

  const handleSignup = async () => {
    setError('');

    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await customerSignup(fullName, email, password);

    if (!result.success) {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {/* Content Wrapper */}
          <View style={[styles.contentWrapper, { maxWidth: maxWidth }]}>
            {/* Header Card */}
            <Card style={styles.headerCard}>
              <Text style={[
                styles.headline,
                isSmallScreen && styles.headlineSmall,
              ]}>
                Create Account
              </Text>
              
              <Text style={[
                styles.subtitle,
                isSmallScreen && styles.subtitleSmall,
              ]}>
                Join us as a customer
              </Text>
            </Card>

            {/* Form Card */}
            <Card style={styles.formCard}>
              <Input
                label="Full Name"
                placeholder="e.g. Jean Marie Nkondock"
                value={fullName}
                onChangeText={setFullName}
              />

              <Input
                label="Email Address"
                placeholder="e.g. your@email.cm"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              {/* Password with Show/Hide */}
              <View style={styles.passwordContainer}>
                <Input
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordButton}
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title={loading ? 'Creating account...' : 'Sign Up'}
                onPress={handleSignup}
                disabled={loading}
                fullWidth
              />
            </Card>

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
                <Text style={styles.signinLink}>Sign in here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  backText: {
    ...typography.label,
    color: colors.primary,
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  headerCard: {
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.h1,
    marginBottom: spacing.sm,
    color: colors.text,
    textAlign: 'center',
  },
  headlineSmall: {
    fontSize: 24,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  subtitleSmall: {
    fontSize: 14,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  passwordContainer: {
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    right: spacing.lg,
    top: 38,
  },
  showPasswordText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: colors.danger + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    ...typography.bodySmall,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  signinText: {
    ...typography.body,
    color: colors.text,
  },
  signinLink: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;
