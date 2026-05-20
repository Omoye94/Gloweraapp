import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Pressable,
  Easing,
} from 'react-native';
import { GrowthStage, PlantMood } from '../../types/plant';
import * as Haptics from 'expo-haptics';

const MOOD_POSE: Record<PlantMood, { translateY: number; rotate: string; opacity: number }> = {
  glowing: { translateY: -2, rotate: '0deg',  opacity: 1 },
  happy:   { translateY: 0,  rotate: '0deg',  opacity: 1 },
  sleepy:  { translateY: 4,  rotate: '-2deg', opacity: 0.92 },
  wilting: { translateY: 8,  rotate: '-4deg', opacity: 0.78 },
};

const STAGE_IMAGES: Record<GrowthStage, any> = {
  seed:   require('../../../assets/plants/seed.png'),
  sprout: require('../../../assets/plants/sprout.png'),
  bud:    require('../../../assets/plants/bud.png'),
  bloom:  require('../../../assets/plants/bloom.png'),
  glow:   require('../../../assets/plants/glow.png'),
};

const STAGE_ORDER: GrowthStage[] = ['seed', 'sprout', 'bud', 'bloom', 'glow'];

function getNextStage(stage: GrowthStage): GrowthStage | null {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
}

interface GloweraPlantProps {
  stage: GrowthStage;
  progressToNext: number;
  size?: number;
  pointsAdded?: number;
  mood?: PlantMood;
}

export function GloweraPlant({ stage, progressToNext, size = 280, pointsAdded, mood = 'happy' }: GloweraPlantProps) {
  const nextStage = getNextStage(stage);

  // JS-driver only — no native driver mixing
  const fadeAnim    = useRef(new Animated.Value(1)).current;
  const nextOpacity = useRef(new Animated.Value(progressToNext / 100)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const moodTiltRaw  = useRef(new Animated.Value(0)).current; // interpolates rotate
  const moodTranslate = useRef(new Animated.Value(MOOD_POSE[mood].translateY)).current;
  const moodOpacity  = useRef(new Animated.Value(MOOD_POSE[mood].opacity)).current;

  const prevStageRef  = useRef<GrowthStage>(stage);
  const prevPointsRef = useRef<number | undefined>(pointsAdded);
  const [displayStage, setDisplayStage] = useState<GrowthStage>(stage);
  const [displayNext,  setDisplayNext]  = useState<GrowthStage | null>(nextStage);

  // Glow pulse — bloom/glow only
  useEffect(() => {
    if (stage === 'bloom' || stage === 'glow') {
      const anim = Animated.loop(Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 1,   duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(glowOpacity, { toValue: 0.4, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]));
      anim.start();
      return () => anim.stop();
    }
    glowOpacity.setValue(0);
  }, [stage]);

  // Mood pose transition — droop/upright/dim
  useEffect(() => {
    const pose = MOOD_POSE[mood];
    const rotateDeg = parseFloat(pose.rotate) || 0;
    Animated.parallel([
      Animated.timing(moodTiltRaw,   { toValue: rotateDeg,     duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(moodTranslate, { toValue: pose.translateY, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(moodOpacity,   { toValue: pose.opacity,    duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, [mood]);

  // Stage crossfade
  useEffect(() => {
    if (stage === prevStageRef.current) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
      setDisplayStage(stage);
      setDisplayNext(getNextStage(stage));
      prevStageRef.current = stage;
      nextOpacity.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start();
    });
  }, [stage]);

  // Progress crossfade to next stage
  useEffect(() => {
    Animated.timing(nextOpacity, {
      toValue: progressToNext / 100,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progressToNext]);

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable onPress={handleTap}>
      {/* Glow ring */}
      {(stage === 'bloom' || stage === 'glow') && (
        <Animated.View style={[styles.glowRing, {
          width: size + 50,
          height: size + 50,
          borderRadius: (size + 50) / 2,
          backgroundColor: stage === 'glow' ? 'rgba(255,212,170,0.2)' : 'rgba(244,198,204,0.15)',
          opacity: glowOpacity,
        }]} />
      )}

      {/* Image container */}
      <Animated.View
        style={{
          width: size,
          height: size,
          opacity: Animated.multiply(fadeAnim, moodOpacity),
          transform: [
            { translateY: moodTranslate },
            {
              rotate: moodTiltRaw.interpolate({
                inputRange: [-10, 10],
                outputRange: ['-10deg', '10deg'],
              }),
            },
          ],
        }}
      >
        <Image
          source={STAGE_IMAGES[displayStage]}
          style={styles.image}
          resizeMode="contain"
        />
        {displayNext && (
          <Animated.Image
            source={STAGE_IMAGES[displayNext]}
            style={[styles.image, { opacity: nextOpacity }]}
            resizeMode="contain"
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glowRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: -25,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
