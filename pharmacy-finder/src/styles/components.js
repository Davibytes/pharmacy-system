import { StyleSheet } from 'react-native';
import colors from './colors';
import spacing from './spacing';

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export const refreshButton = {
  width: 48,
  height: 48,
  borderRadius: 8,
  backgroundColor: colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
};

export const actionCard = {
  flexDirection: 'row',
  backgroundColor: colors.white,
  borderRadius: 12,
  padding: spacing.lg,
  marginBottom: spacing.md,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: colors.border,
  gap: spacing.md,
};

export const card = {
  backgroundColor: colors.white,
  borderRadius: 12,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: spacing.md,
};