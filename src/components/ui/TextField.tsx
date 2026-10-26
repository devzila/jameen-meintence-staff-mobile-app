import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radii, shadows } from '@/constants/theme';
import { Icon } from '@/components/Icon';
import { useAppFonts } from '@/lib/fonts';
import { useTranslation } from 'react-i18next';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  secureToggle?: boolean;
};

export function TextField({
  label,
  error,
  secureToggle,
  secureTextEntry,
  multiline,
  ...rest
}: TextFieldProps) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const fonts = useAppFonts();
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { fontFamily: fonts.sansMedium }]}>{label}</Text> : null}
      <View style={[styles.field, error ? styles.fieldError : null, multiline && styles.multiline]}>
        <TextInput
          {...rest}
          multiline={multiline}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          placeholderTextColor={colors.ink400}
          style={[styles.input, multiline && styles.inputMultiline, { fontFamily: fonts.sans }]}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('common.showPassword') : t('common.hidePassword')}
            hitSlop={8}
            style={styles.toggle}
          >
            <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.ink400} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { fontFamily: fonts.sans }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 12, color: colors.ink500 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ink200,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    ...shadows.e1,
  },
  multiline: { alignItems: 'flex-start' },
  fieldError: { borderColor: colors.danger },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink800,
  },
  inputMultiline: {
    minHeight: 96,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  toggle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 13, color: colors.danger },
});
