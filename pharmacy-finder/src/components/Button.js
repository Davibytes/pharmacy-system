import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import typography from '../styles/typography';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline
  size = 'large',       // large, medium, small
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}) => {
  const isLarge = size === 'large';
  const isMedium = size === 'medium';
  const isSmall = size === 'small';

  let backgroundColor = colors.primary;
  let textColor = colors.white;

  if (variant === 'secondary') {
    backgroundColor = colors.secondary;
  } else if (variant === 'outline') {
    backgroundColor = colors.white;
    textColor = colors.primary;
  }

  if (disabled) {
    backgroundColor = colors.disabled;
    textColor = colors.disabledText;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor,
          height: isLarge ? spacing.buttonHeight : isMedium ? spacing.smallButtonHeight : 40,
          width: fullWidth ? '100%' : 'auto',
          paddingHorizontal: isLarge ? spacing.lg : spacing.md,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isLarge ? 16 : isMedium ? 14 : 12,
          },
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.borderRadiusMedium,
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
});

export default Button;