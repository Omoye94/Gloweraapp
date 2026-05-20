import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const JAR_HEIGHT = 140;
const JAR_WIDTH = 100;
const MAX_FILL = 50;

const SPARKLE_EMOJIS = ['✨', '💫', '🌸'];
const SPARKLE_X = [-28, 0, 28]; // horizontal spread relative to jar center

// ─── Bubble (floats up inside the jar) ────────────────────────────────────────

interface BubbleCfg {
  x: number;
  size: number;
  color: string;
}

const BUBBLES: BubbleCfg[] = [
  { x: 20, size: 6, color: 'rgba(255,255,255,0.55)' },
  { x: 50, size: 4, color: 'rgba(255,255,255,0.45)' },
  { x: 72, size: 5, color: 'rgba(255,255,255,0.5)' },
];

function useBubbleAnims() {
  return BUBBLES.map(() => ({
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  }));
}

function useSparkleAnims() {
  return SPARKLE_EMOJIS.map(() => ({
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0.4)).current,
  }));
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface GratitudeJarVisualProps {
  entryCount: number;
}

export const GratitudeJarVisual: React.FC<GratitudeJarVisualProps> = ({ entryCount }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const prevCountRef = useRef(entryCount);

  const bubbleAnims = useBubbleAnims();
  const sparkleAnims = useSparkleAnims();

  // Fill level animation (useNativeDriver: false — animates height)
  useEffect(() => {
    const ratio = Math.min(entryCount / MAX_FILL, 1);
    const targetHeight = ratio * (JAR_HEIGHT - 16);
    Animated.timing(fillAnim, {
      toValue: targetHeight,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [entryCount]);

  // Trigger bubble + sparkle burst when count increases
  useEffect(() => {
    if (entryCount <= prevCountRef.current) {
      prevCountRef.current = entryCount;
      return;
    }
    prevCountRef.current = entryCount;

    // Bubbles
    bubbleAnims.forEach(({ y, opacity }, i) => {
      y.setValue(0);
      opacity.setValue(0);
      Animated.sequence([
        Animated.delay(i * 120),
        Animated.parallel([
          Animated.timing(y, {
            toValue: -55,
            duration: 1100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.75, duration: 180, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 700, delay: 200, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    });

    // Sparkles
    sparkleAnims.forEach(({ y, opacity, scale }, i) => {
      y.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.4);
      Animated.sequence([
        Animated.delay(i * 80),
        Animated.parallel([
          Animated.timing(y, {
            toValue: -52,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 500, delay: 250, useNativeDriver: true }),
          ]),
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, [entryCount]);

  const label =
    entryCount === 0
      ? 'Your jar is empty — add your first gratitude'
      : entryCount === 1
      ? '1 gratitude collected'
      : `${entryCount} gratitudes collected`;

  return (
    <View style={styles.wrapper}>
      {/* Sparkles — positioned above the jar, relative to wrapper */}
      {sparkleAnims.map((anim, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.sparkle,
            {
              left: JAR_WIDTH / 2 + SPARKLE_X[i] - 10,
              opacity: anim.opacity,
              transform: [{ translateY: anim.y }, { scale: anim.scale }],
            },
          ]}
        >
          {SPARKLE_EMOJIS[i]}
        </Animated.Text>
      ))}

      <View style={styles.lid} />

      <View style={styles.jar}>
        {/* Fill */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: fillAnim,
            backgroundColor: '#C8A0C8',
            borderRadius: 18,
          }}
        />

        {/* Bubbles inside jar (clipped by overflow: hidden) */}
        {bubbleAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              bottom: 8,
              left: BUBBLES[i].x,
              width: BUBBLES[i].size,
              height: BUBBLES[i].size,
              borderRadius: BUBBLES[i].size / 2,
              backgroundColor: BUBBLES[i].color,
              opacity: anim.opacity,
              transform: [{ translateY: anim.y }],
            }}
          />
        ))}

        <View style={styles.shine} />
      </View>

      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
    // Extra top padding so sparkles don't get clipped
    paddingTop: 64,
  },
  sparkle: {
    position: 'absolute',
    top: 20,
    fontSize: 18,
  },
  lid: {
    width: JAR_WIDTH - 20,
    height: 14,
    borderRadius: 6,
    backgroundColor: 'rgba(254,250,249,0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,144,154,0.35)',
    marginBottom: -2,
    zIndex: 1,
  },
  jar: {
    width: JAR_WIDTH,
    height: JAR_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'rgba(254,250,249,0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,144,154,0.3)',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 12,
    left: 10,
    width: 8,
    height: 80,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  label: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#9E8880',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
