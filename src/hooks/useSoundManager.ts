import { useEffect, useRef, useCallback } from 'react';
import type { Sound } from 'expo-av/build/Audio';

type SoundName =
  | 'water-drop'
  | 'sprout-pop'
  | 'branch-grow'
  | 'bloom-burst'
  | 'glow-ascend'
  | 'gentle-wind'
  | 'sparkle';

// Map sound names to require() paths
const SOUND_FILES: Partial<Record<SoundName, any>> = {
  'water-drop': require('../../assets/sounds/water-drop.mp3'),
  'sparkle': require('../../assets/sounds/sparkle.mp3'),
};

interface UseSoundManagerReturn {
  playSound: (name: SoundName) => Promise<void>;
  playAmbient: (name: SoundName) => Promise<void>;
  stopAmbient: () => Promise<void>;
  isReady: boolean;
}

export function useSoundManager(): UseSoundManagerReturn {
  const soundsRef = useRef<Map<SoundName, Sound>>(new Map());
  const ambientRef = useRef<Sound | null>(null);
  const audioRef = useRef<any>(null);
  const isReadyRef = useRef(false);

  // Preload sounds
  useEffect(() => {
    let mounted = true;

    const preload = async () => {
      try {
        const { Audio } = await import('expo-av');
        audioRef.current = Audio;

        // Set audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: false,
          staysActiveInBackground: false,
        });

        for (const [name, source] of Object.entries(SOUND_FILES)) {
          if (!mounted || !source) continue;
          try {
            const { sound } = await Audio.Sound.createAsync(source, {
              shouldPlay: false,
            });
            soundsRef.current.set(name as SoundName, sound);
          } catch {
            // Sound file not found, skip silently
          }
        }

        if (mounted) {
          isReadyRef.current = true;
        }
      } catch {
        // Audio not available
      }
    };

    preload();

    return () => {
      mounted = false;
      // Unload all sounds
      soundsRef.current.forEach((sound) => {
        sound.unloadAsync().catch(() => {});
      });
      soundsRef.current.clear();
      if (ambientRef.current) {
        ambientRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const playSound = useCallback(async (name: SoundName) => {
    const sound = soundsRef.current.get(name);
    if (!sound) return;

    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Playback error, ignore
    }
  }, []);

  const playAmbient = useCallback(async (name: SoundName) => {
    // Stop current ambient
    if (ambientRef.current) {
      await ambientRef.current.stopAsync().catch(() => {});
    }

    const source = SOUND_FILES[name];
    if (!source || !audioRef.current) return;

    try {
      const { sound } = await audioRef.current.Sound.createAsync(source, {
        shouldPlay: true,
        isLooping: true,
        volume: 0.3,
      });
      ambientRef.current = sound;
    } catch {
      // Ambient playback error, ignore
    }
  }, []);

  const stopAmbient = useCallback(async () => {
    if (ambientRef.current) {
      await ambientRef.current.stopAsync().catch(() => {});
      await ambientRef.current.unloadAsync().catch(() => {});
      ambientRef.current = null;
    }
  }, []);

  return {
    playSound,
    playAmbient,
    stopAmbient,
    isReady: isReadyRef.current,
  };
}
