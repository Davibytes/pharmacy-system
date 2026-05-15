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

const LoginScreen = ({ route, navigation }) => {
  const authContext = useContext(AuthContext);
  const showBack = route.params?.showBack || false;
  
  const [email, setEmail] = useState(route.params?.email || '');
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

  const { customerLogin, loading } = authContext;

  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    const result = await customerLogin(email, password);

    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
       {showBack && (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
    )}
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
                Welcome Back
              </Text>
              
              <Text style={[
                styles.subtitle,
                isSmallScreen && styles.subtitleSmall,
              ]}>
                Sign in to your account
              </Text>
            </Card>

            {/* Form Card */}
            <Card style={styles.formCard}>
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
                  placeholder="Enter your password"
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
                title={loading ? 'Signing in...' : 'Sign In'}
                onPress={handleLogin}
                disabled={loading}
                fullWidth
              />

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => navigation.navigate('ForgotPassword', { email })}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </Card>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Do not have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup', { role: 'customer' })}>
                <Text style={styles.signupLink}>Sign up here</Text>
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  signupText: {
    ...typography.body,
    color: colors.text,
  },
  signupLink: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  forgotPasswordText: {
    ...typography.label,
    color: colors.primary,
  },
});

export default LoginScreen;
