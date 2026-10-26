import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';

type Props = {
  open: boolean;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (actualCost: string | undefined) => void;
};

export function sanitizeCost(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
}

export function ResolveSheet({ open, busy, error, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const [cost, setCost] = useState('');
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setCost('');
  }

  return (
    <Sheet
      open={open}
      title={t('actions.resolveTitle')}
      subtitle={t('actions.resolveSubtitle')}
      onClose={() => {
        if (!busy) onCancel();
      }}
      footer={
        <>
          <Button
            label={t('actions.markResolved')}
            icon="check"
            loading={busy}
            onPress={() => onConfirm(cost ? cost : undefined)}
          />
          <Button label={t('common.cancel')} variant="ghost" onPress={onCancel} disabled={busy} />
        </>
      }
    >
      <TextField
        label={t('actions.actualCost')}
        placeholder={t('actions.actualCostPlaceholder')}
        keyboardType="decimal-pad"
        value={cost}
        onChangeText={(value) => setCost(sanitizeCost(value))}
      />
      {error ? <Text style={[styles.error, { fontFamily: fonts.sans }]}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: 13 },
});
