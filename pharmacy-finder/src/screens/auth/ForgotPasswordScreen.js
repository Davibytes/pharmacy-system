import React, { useContext, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import Input from '../../components/Input';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const authContext = useContext(AuthContext);
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState(route.params?.resetToken || '');
  const [step, setStep] = useState(route.params?.resetToken ? 'reset' : 'request');
  const [localResetLink, setLocalResetLink] = useState('');
  const [localResetToken, setLocalResetToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestReset = async () => {
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setSubmitting(true);
    const result = await authContext.requestPasswordReset(email.trim());
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setLocalResetLink(result.data?.resetUrl || '');
    setLocalResetToken(result.data?.resetToken || '');
    setMessage('If that customer account exists, a reset link has been sent to its email address.');
  };

  const submitNewPassword = async () => {
    setError('');
    setMessage('');

    if (!password) {
      setError('New password is required');
      return;
    }

    if (!resetToken && !code.trim()) {
      setError('Reset link or reset code is required');
      return;
    }

    setSubmitting(true);
    const result = resetToken
      ? await authContext.resetPasswordWithToken(resetToken, password)
      : await authContext.resetPassword(email.trim(), code.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setMessage('Password reset successfully. You can now sign in.');
    setTimeout(() => navigation.replace('Login', { role: 'customer', email }), 800);
  };

  const openLocalResetLink = () => {
    if (!localResetToken) {
      return;
    }

    setResetToken(localResetToken);
    setStep('reset');
    setMessage('Reset link opened. Choose a new password.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.contentWrapper}>
            <Card style={styles.headerCard}>
              <Text style={styles.headline}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {step === 'request'
                  ? 'Enter your customer email to receive a reset link.'
                  : 'Choose a new password for your account.'}
              </Text>
            </Card>

            <Card style={styles.formCard}>
              <Input
                label="Email Address"
                placeholder="e.g. your@email.cm"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={step === 'request'}
              />

              {step === 'reset' ? (
                <>
                  {!resetToken ? (
                    <Input
                      label="Reset Code"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                    />
                  ) : null}

                  <View style={styles.passwordContainer}>
                    <Input
                      label="New Password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.showPasswordButton}
                    >
                      <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}

              {step === 'request' && localResetLink ? (
                <View style={styles.localLinkBox}>
                  <Text style={styles.localLinkLabel}>Local development email preview</Text>
                  <TouchableOpacity onPress={openLocalResetLink} style={styles.localLinkButton}>
                    <Text style={styles.localLinkText}>Open reset link</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {message ? (
                <View style={styles.messageContainer}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              ) : null}

              <Button
                title={
                  submitting
                    ? 'Please wait...'
                    : step === 'request'
                      ? 'Send Reset Link'
                      : 'Reset Password'
                }
                onPress={step === 'request' ? requestReset : submitNewPassword}
                disabled={submitting}
                fullWidth
              />
            </Card>
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
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  backText: {
    ...typography.label,
    color: colors.primary,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 500,
  },
  headerCard: {
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  localLinkBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  localLinkLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  localLinkButton: {
    alignSelf: 'flex-start',
  },
  localLinkText: {
    ...typography.label,
    color: colors.primary,
  },
  errorContainer: {
    backgroundColor: colors.danger + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  messageContainer: {
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  messageText: {
    ...typography.bodySmall,
    color: colors.success,
  },
});

export default ForgotPasswordScreen;
