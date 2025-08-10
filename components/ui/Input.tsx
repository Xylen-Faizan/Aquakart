import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, commonStyles } from '@/src/design-system'; // Import from the new design system

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused, // Use focused style from commonStyles
          error ? styles.inputContainerError : null, // Add error style
          icon ? styles.withIcon : null
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, style]} // Apply base input style
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    ...commonStyles.text.bodySmall, // Use text style from commonStyles
    marginBottom: 8,
  },
  inputContainer: {
    ...commonStyles.input, // Apply base input container styles
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerFocused: {
    ...commonStyles.inputFocused, // Apply focused styles
  },
  inputContainerError: {
    borderColor: colors.error, // Use error color from design system
  },
  withIcon: {
    paddingLeft: 40, // Adjust padding if there is an icon
  },
  input: {
    flex: 1,
    height: '100%',
    // The text color and font size are already in commonStyles.input,
    // so we don't need to repeat them here.
  },
  iconContainer: {
    position: 'absolute',
    left: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  errorText: {
    ...commonStyles.text.caption, // Use text style from commonStyles
    color: colors.error, // Use error color
    marginTop: 4,
  },
});

export default Input;