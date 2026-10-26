import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/TopBar';
import { TextField } from '@/components/ui/TextField';
import { FormCard } from '@/components/ui/FormCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/Icon';
import { AVATAR_MAX_BYTES } from '@/constants/config';
import { colors, press } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { isBlankOrTenDigitPhone, phoneDigits } from '@/lib/phone';
import { useAuth } from '@/store/auth';
import { useUpdateProfile } from '@/features/profile/hooks';
import { toUserMessage } from '@/utils/errors';

type PickedAvatar = { uri: string; name: string; type: string };

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const staff = useAuth((s) => s.staff);
  const update = useUpdateProfile();
  const [name, setName] = useState(staff?.name ?? '');
  const [mobile, setMobile] = useState(phoneDigits(staff?.mobile_number ?? ''));
  const [avatar, setAvatar] = useState<PickedAvatar | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nameValid = name.trim().length >= 2;
  const phoneValid = isBlankOrTenDigitPhone(mobile);
  const dirty =
    name.trim() !== (staff?.name ?? '').trim() ||
    mobile !== phoneDigits(staff?.mobile_number ?? '') ||
    Boolean(avatar);
  const canSave = dirty && nameValid && phoneValid && !update.isPending;

  async function pickAvatar(source: 'camera' | 'library') {
    setError(null);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t('editProfile.permissionDenied'));
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > AVATAR_MAX_BYTES) {
      setError(t('editProfile.photoTooLarge'));
      return;
    }
    const type = asset.mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
    setAvatar({
      uri: asset.uri,
      name: asset.fileName || `avatar.${type === 'image/png' ? 'png' : 'jpg'}`,
      type,
    });
  }

  async function onSave() {
    if (!canSave) return;
    setError(null);
    try {
      await update.mutateAsync({ name, mobileNumber: mobile, avatar });
      router.back();
    } catch (err) {
      setError(toUserMessage(err, t('editProfile.saveFailed')));
    }
  }

  return (
    <View style={styles.root}>
      <TopBar title={t('editProfile.title')} back />
      <Screen
        edges={['bottom']}
        footer={
          <Button
            label={update.isPending ? t('editProfile.saving') : t('editProfile.save')}
            onPress={() => void onSave()}
            disabled={!canSave}
            loading={update.isPending}
          />
        }
      >
        <View style={styles.hero}>
          <Avatar name={name} uri={avatar?.uri ?? staff?.avatar_url} size={88} />
          <View style={styles.photoActions}>
            <Pressable
              onPress={() => void pickAvatar('camera')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.photoBtn, pressed && { opacity: press.opacity }]}
            >
              <Icon name="camera" size={14} color={colors.brand600} />
              <Text style={[styles.photoText, { fontFamily: fonts.sansSemibold }]}>
                {t('editProfile.takePhoto')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void pickAvatar('library')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.photoBtn, pressed && { opacity: press.opacity }]}
            >
              <Icon name="file" size={14} color={colors.brand600} />
              <Text style={[styles.photoText, { fontFamily: fonts.sansSemibold }]}>
                {t('editProfile.choosePhoto')}
              </Text>
            </Pressable>
          </View>
        </View>

        <FormCard>
          <TextField
            label={t('common.name')}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={name.length > 0 && !nameValid ? t('editProfile.nameInvalid') : undefined}
          />
          <TextField
            label={t('common.phone')}
            value={mobile}
            onChangeText={(value) => setMobile(phoneDigits(value))}
            keyboardType="phone-pad"
            placeholder={t('editProfile.phonePlaceholder')}
            error={!phoneValid ? t('editProfile.phoneInvalid') : undefined}
          />
          <TextField label={t('common.email')} value={staff?.email ?? ''} editable={false} />
        </FormCard>
        {error ? <ErrorState message={error} /> : null}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  hero: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.brand50,
  },
  photoText: { fontSize: 13, color: colors.brand700 },
});
