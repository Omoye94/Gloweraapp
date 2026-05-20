import Animated from 'react-native-reanimated';
import { G, Circle, Ellipse, Path, GProps, CircleProps, EllipseProps, PathProps } from 'react-native-svg';
import { ComponentType } from 'react';

type AnimatedSvgComponent<P> = ComponentType<P & { animatedProps?: Partial<P> }>;

const create = Animated.createAnimatedComponent;

export const AnimatedG = create(G as any) as unknown as AnimatedSvgComponent<GProps>;
export const AnimatedCircle = create(Circle as any) as unknown as AnimatedSvgComponent<CircleProps>;
export const AnimatedEllipse = create(Ellipse as any) as unknown as AnimatedSvgComponent<EllipseProps>;
export const AnimatedPath = create(Path as any) as unknown as AnimatedSvgComponent<PathProps>;
