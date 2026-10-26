import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NavRow } from '@/components/ui/NavRow';
import { colors } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { HOLD_REASONS } from '@/lib/requestStatus';
import type { HoldReason } from '@/types/maintenance';

type Props = {
  open: boolean;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (reason: HoldReason) => void;
};

export function HoldReasonSheet({ open, busy, error, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const [reason, setReason] = useState<HoldReason | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setReason(null);
  }

  return (
    <Sheet
      open={open}
      title={t('actions.holdTitle')}
      subtitle={t('actions.holdSubtitle')}
      onClose={() => {
        if (!busy) onCancel();
      }}
      footer={
        <>
          <Button
            label={t('actions.hold')}
            icon="pause"
            disabled={!reason}
            loading={busy}
            onPress={() => reason && onConfirm(reason)}
          />
          <Button label={t('common.cancel')} variant="ghost" onPress={onCancel} disabled={busy} />
        </>
      }
    >
      <Card style={styles.card}>
        {HOLD_REASONS.map((item, index) => (
          <NavRow
            key={item}
            title={t(`holdReason.${item}`)}
            selected={reason === item}
            showChevron={false}
            last={index === HOLD_REASONS.length - 1}
            onPress={() => setReason(item)}
          />
        ))}
      </Card>
      {error ? <Text style={[styles.error, { fontFamily: fonts.sans }]}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  error: { color: colors.danger, fontSize: 13 },
});
