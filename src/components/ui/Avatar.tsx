import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/constants/theme';
import { getInitials } from '@/utils/initials';
import { useAppFonts } from '@/lib/fonts';

type AvatarProps = {
  name?: string;
  initials?: string;
  uri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function Avatar({ name, initials, uri, size = 32, style, children }: AvatarProps) {
  const label = initials || getInitials(name);
  const fonts = useAppFonts();
  const round = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.fallback, round, style]}>
      {children ??
        (uri ? (
          <Image source={{ uri }} style={round} contentFit="cover" transition={150} />
        ) : (
          <Text
            style={[styles.initials, { fontSize: size * 0.34, fontFamily: fonts.sansSemibold }]}
          >
            {label}
          </Text>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: colors.brand700,
  },
});
