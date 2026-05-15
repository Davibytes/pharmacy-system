import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  // Display - Large titles
  display: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.text,
  },
  
  // Heading - Section titles
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: colors.text,
  },
  
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: colors.text,
  },
  
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.text,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text,
  },
  
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  },
  
  // Labels and buttons
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.text,
  },
  
  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.textSecondary,
  },
  
  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textLight,
  },
  
  captionSmall: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
    color: colors.textLight,
  },
});

export default typography;