import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ScreenTone = 'default' | 'transformation';

interface OnboardingScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'soft' | 'warm';
  tone?: ScreenTone;
}

// Gradient palettes per tone. `default` matches the home screen (warm peach
// dusk) for visual continuity with the rest of the app. `transformation` is
// a softer purple-to-pink-to-peach gradient reserved for "magical reveal"
// screens (firstgrowth, analyzing, results, welcome) so the eye registers a
// narrative shift without leaving the brand palette.
const TONE_GRADIENTS: Record<ScreenTone, readonly [string, string, string]> = {
  default: ['#F5E6E0', '#EDD5CB', '#E8C9BC'],
  transformation: ['#D8C9EC', '#F2B4CC', '#FBD4BF'],
};

export function OnboardingScreen({
  children,
  style,
  variant = 'default',
  tone = 'default',
}: OnboardingScreenProps) {
  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <LinearGradient
        colors={TONE_GRADIENTS[tone]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <WatercolorAccents variant={variant} />
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

function WatercolorAccents({ variant }: { variant: 'default' | 'soft' | 'warm' }) {
  const variants = {
    default: {
      topLeft: ['rgba(232,127,166,0.24)', 'transparent'] as const,
      topRight: ['rgba(155,134,212,0.16)', 'transparent'] as const,
      bottomLeft: ['rgba(196,90,130,0.14)', 'transparent'] as const,
      bottomRight: ['rgba(255,255,255,0.28)', 'transparent'] as const,
    },
    soft: {
      topLeft: ['rgba(232,127,166,0.18)', 'transparent'] as const,
      topRight: ['rgba(216,201,236,0.18)', 'transparent'] as const,
      bottomLeft: ['rgba(255,255,255,0.25)', 'transparent'] as const,
      bottomRight: ['rgba(196,90,130,0.12)', 'transparent'] as const,
    },
    warm: {
      topLeft: ['rgba(244,168,136,0.28)', 'transparent'] as const,
      topRight: ['rgba(232,127,166,0.22)', 'transparent'] as const,
      bottomLeft: ['rgba(255,255,255,0.32)', 'transparent'] as const,
      bottomRight: ['rgba(196,90,130,0.14)', 'transparent'] as const,
    },
  };
  const v = variants[variant];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={v.topLeft}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.blob, styles.blobTopLeft]}
      />
      <LinearGradient
        colors={v.topRight}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.blob, styles.blobTopRight]}
      />
      <LinearGradient
        colors={v.bottomLeft}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.blob, styles.blobBottomLeft]}
      />
      <LinearGradient
        colors={v.bottomRight}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={[styles.blob, styles.blobBottomRight]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4E8E0',
  },
  content: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    opacity: 1,
  },
  blobTopLeft: {
    top: -120,
    left: -140,
  },
  blobTopRight: {
    top: -100,
    right: -160,
    width: 380,
    height: 380,
    borderRadius: 190,
  },
  blobBottomLeft: {
    bottom: -160,
    left: -180,
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  blobBottomRight: {
    bottom: -120,
    right: -120,
    width: 440,
    height: 440,
    borderRadius: 220,
  },
});
