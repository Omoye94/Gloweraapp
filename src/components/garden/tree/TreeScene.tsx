import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Svg from 'react-native-svg';
import { useAnimatedProps } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GrowthStage } from '../../../types/plant';
import { getInterpolatedConfig } from './treeConfigs';
import { STAGE_COLORS, COSMETIC_PARTICLE_COLORS } from './treeColors';
import { AnimatedG } from './AnimatedSvg';
import { TreeSoil } from './TreeSoil';
import { TreeTrunk } from './TreeTrunk';
import { TreeBranches } from './TreeBranches';
import { TreeCanopy } from './TreeCanopy';
import { TreeSeed } from './TreeSeed';
import { TreeGlow } from './TreeGlow';
import { TreeParticles } from './TreeParticles';
import { WaterDrops } from './WaterDrops';
import { useGardenAnimations } from '../../../hooks/useGardenAnimations';
import { GrowthPulse } from './GrowthPulse';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

const STAGE_INTENSITY: Record<GrowthStage, number> = {
  seed: 0.15,
  sprout: 0.35,
  bud: 0.55,
  bloom: 0.8,
  glow: 1.0,
};

interface TreeSceneProps {
  stage: GrowthStage;
  progressToNext: number;
  compact?: boolean;
  particleColorId?: string;
  onStageTransition?: (newStage: GrowthStage) => void;
  animated?: boolean;
  timeOfDay?: TimeOfDay;
  pointsTimestamp?: number;
}

const VIEWBOX_W = 300;
const VIEWBOX_H = 300;
const TREE_BASE_X = 150;
const TREE_BASE_Y = 240;
const SVG_SIZE = 220;

export const TreeScene: React.FC<TreeSceneProps> = ({
  stage,
  progressToNext,
  compact = false,
  particleColorId = 'default',
  animated = true,
  timeOfDay = 'day',
  pointsTimestamp,
}) => {
  const [showWater, setShowWater] = useState(false);
  const waterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldAnimate = false; // Reanimated+SVG crash — organic growth still works via config interpolation
  const intensity = STAGE_INTENSITY[stage];
  const animations = useGardenAnimations(intensity);

  const config = useMemo(
    () => getInterpolatedConfig(stage, progressToNext),
    [stage, progressToNext],
  );

  const colors = STAGE_COLORS[stage];
  const cosmetic = COSMETIC_PARTICLE_COLORS[particleColorId] || COSMETIC_PARTICLE_COLORS.default;
  const canopyCenterY = TREE_BASE_Y - config.trunkHeight - config.canopyRadius * 0.3;

  // Night: boost glow intensity
  const glowIntensity = timeOfDay === 'night' ? config.glowIntensity * 1.4 : config.glowIntensity;

  const handleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowWater(true);
    if (waterTimeoutRef.current) clearTimeout(waterTimeoutRef.current);
    waterTimeoutRef.current = setTimeout(() => setShowWater(false), 1200);
  }, []);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Breathe scale for entire tree
  const breatheProps = useAnimatedProps(() => {
    if (!shouldAnimate) return {} as any;
    const s = animations.breatheScale.value;
    return {
      transform: [
        { translateX: TREE_BASE_X },
        { translateY: TREE_BASE_Y },
        { scale: s },
        { translateX: -TREE_BASE_X },
        { translateY: -TREE_BASE_Y },
      ],
    } as any;
  });

  // Compact mode
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Svg width={48} height={48} viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}>
          <TreeSoil
            baseY={TREE_BASE_Y}
            centerX={TREE_BASE_X}
            moundHeight={config.soilMoundHeight}
            colors={colors}
            width={120}
          />
          {config.seedVisible ? (
            <TreeSeed
              centerX={TREE_BASE_X}
              baseY={TREE_BASE_Y}
              sinkDepth={config.seedSinkDepth}
              crackSize={config.seedCrackSize}
              sproutHeight={config.sproutHeight}
              colors={colors}
              progress={progressToNext}
            />
          ) : (
            <TreeTrunk
              baseX={TREE_BASE_X}
              baseY={TREE_BASE_Y}
              height={config.trunkHeight}
              width={config.trunkWidth}
              curve={config.trunkCurve}
              colors={colors}
            />
          )}
        </Svg>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleTap}
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={styles.container}
    >
      <Svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      >
        {/* Glow aura */}
        <TreeGlow
          centerX={TREE_BASE_X}
          centerY={canopyCenterY}
          intensity={glowIntensity}
          radius={config.glowRadius}
          colors={colors}
          glowPulse={shouldAnimate ? animations.glowPulse : undefined}
        />

        {/* Particles */}
        {config.particleCount > 0 && (
          <TreeParticles
            centerX={TREE_BASE_X}
            centerY={canopyCenterY}
            radius={config.canopyRadius + 20}
            count={config.particleCount}
            types={config.particleTypes}
            colors={colors}
            particleColor={cosmetic.primary}
            particleAltColor={cosmetic.secondary}
            particleDriftY={shouldAnimate ? animations.particleDriftY : undefined}
            particleDriftX={shouldAnimate ? animations.particleDriftX : undefined}
            particleFade={shouldAnimate ? animations.particleFade : undefined}
          />
        )}

        {/* Soil */}
        <TreeSoil
          baseY={TREE_BASE_Y}
          centerX={TREE_BASE_X}
          moundHeight={config.soilMoundHeight}
          colors={colors}
          width={160}
        />

        {/* Morning dew drops */}
        {timeOfDay === 'morning' && !config.seedVisible && (
          <>
            <AnimatedG>
              {/* Small dew drops near soil */}
              <TreeGlow
                centerX={TREE_BASE_X - 30}
                centerY={TREE_BASE_Y - 5}
                intensity={0.3}
                radius={4}
                colors={{ ...colors, glowAura: '#B8D8E8', flowerGlow: '#D0E8F0' }}
              />
              <TreeGlow
                centerX={TREE_BASE_X + 25}
                centerY={TREE_BASE_Y - 3}
                intensity={0.25}
                radius={3}
                colors={{ ...colors, glowAura: '#B8D8E8', flowerGlow: '#D0E8F0' }}
              />
            </AnimatedG>
          </>
        )}

        {/* Animated tree wrapper */}
        {shouldAnimate ? (
          <AnimatedG animatedProps={breatheProps}>
            {/* Seed stage */}
            {config.seedVisible && (
              <TreeSeed
                centerX={TREE_BASE_X}
                baseY={TREE_BASE_Y}
                sinkDepth={config.seedSinkDepth}
                crackSize={config.seedCrackSize}
                sproutHeight={config.sproutHeight}
                colors={colors}
                progress={progressToNext}
                breatheScale={animations.breatheScale}
              />
            )}

            {/* Tree */}
            {!config.seedVisible && (
              <>
                <TreeTrunk
                  baseX={TREE_BASE_X}
                  baseY={TREE_BASE_Y}
                  height={config.trunkHeight}
                  width={config.trunkWidth}
                  curve={config.trunkCurve}
                  colors={colors}
                />
                <TreeBranches
                  baseX={TREE_BASE_X}
                  baseY={TREE_BASE_Y}
                  trunkHeight={config.trunkHeight}
                  trunkWidth={config.trunkWidth}
                  trunkCurve={config.trunkCurve}
                  branchCount={config.branchCount}
                  branchLength={config.branchLength}
                  branchAngle={config.branchAngle}
                  colors={colors}
                />
                <TreeCanopy
                  centerX={TREE_BASE_X}
                  centerY={canopyCenterY}
                  canopyRadius={config.canopyRadius}
                  leafCount={config.leafClusterCount}
                  leafSize={config.leafSize}
                  flowerCount={config.flowerCount}
                  flowerSize={config.flowerSize}
                  flowerOpenness={config.flowerOpenness}
                  colors={colors}
                  swayRotation={animations.swayRotation}
                />
              </>
            )}
          </AnimatedG>
        ) : (
          <>
            {/* Seed stage */}
            {config.seedVisible && (
              <TreeSeed
                centerX={TREE_BASE_X}
                baseY={TREE_BASE_Y}
                sinkDepth={config.seedSinkDepth}
                crackSize={config.seedCrackSize}
                sproutHeight={config.sproutHeight}
                colors={colors}
                progress={progressToNext}
              />
            )}

            {/* Tree */}
            {!config.seedVisible && (
              <>
                <TreeTrunk
                  baseX={TREE_BASE_X}
                  baseY={TREE_BASE_Y}
                  height={config.trunkHeight}
                  width={config.trunkWidth}
                  curve={config.trunkCurve}
                  colors={colors}
                />
                <TreeBranches
                  baseX={TREE_BASE_X}
                  baseY={TREE_BASE_Y}
                  trunkHeight={config.trunkHeight}
                  trunkWidth={config.trunkWidth}
                  trunkCurve={config.trunkCurve}
                  branchCount={config.branchCount}
                  branchLength={config.branchLength}
                  branchAngle={config.branchAngle}
                  colors={colors}
                />
                <TreeCanopy
                  centerX={TREE_BASE_X}
                  centerY={canopyCenterY}
                  canopyRadius={config.canopyRadius}
                  leafCount={config.leafClusterCount}
                  leafSize={config.leafSize}
                  flowerCount={config.flowerCount}
                  flowerSize={config.flowerSize}
                  flowerOpenness={config.flowerOpenness}
                  colors={colors}
                />
              </>
            )}
          </>
        )}

        {/* Growth pulse — disabled pending Reanimated 4 + SVG compat fix */}
        {/* pointsTimestamp && (
          <GrowthPulse
            centerX={TREE_BASE_X}
            centerY={config.seedVisible ? TREE_BASE_Y - 20 : canopyCenterY}
            pointsTimestamp={pointsTimestamp}
          />
        ) */}

        {/* Water drops */}
        {showWater && (
          <WaterDrops
            centerX={TREE_BASE_X}
            topY={config.seedVisible ? TREE_BASE_Y - 40 : canopyCenterY - 30}
            baseY={TREE_BASE_Y}
          />
        )}
      </Svg>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SVG_SIZE,
    height: SVG_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    width: 48,
    height: 48,
  },
});
