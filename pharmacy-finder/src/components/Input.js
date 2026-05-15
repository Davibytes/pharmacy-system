import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import typography from '../styles/typography';

const Input = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  editable = true,
  keyboardType = 'default',
  error = ''
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          focused ? styles.inputFocused : null,
          !editable ? styles.disabled : null,
          error ? styles.inputError : null,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        placeholderTextColor={colors.textLight}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.danger,
  },
  disabled: {
    backgroundColor: colors.light,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.danger,
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
});

export default Input;
