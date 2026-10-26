import { Image } from 'react-native';

export function BrandMark({ size = 96 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/images/logo-mark.png')}
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
      resizeMode="contain"
      accessibilityLabel="Jameen Maintenance"
    />
  );
}
