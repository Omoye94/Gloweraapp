import React from 'react';
import { SvgXml } from 'react-native-svg';
import { SOLAR_ICONS } from '../../constants/solarIcons';

interface SolarIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function SolarIcon({ name, size = 24, color = 'currentColor' }: SolarIconProps) {
  const raw = SOLAR_ICONS[name];
  if (!raw) return null;
  const xml = raw.replace(/currentColor/g, color);
  return <SvgXml xml={xml} width={size} height={size} />;
}
