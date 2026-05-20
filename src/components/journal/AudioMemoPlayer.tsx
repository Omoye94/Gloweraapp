import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface AudioMemoPlayerProps {
  uri: string;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const AudioMemoPlayer: React.FC<AudioMemoPlayerProps> = ({ uri }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const audioRef = useRef<any>(null);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // Reset player when URI changes (e.g. new recording replaces old)
  useEffect(() => {
    const prev = soundRef.current;
    if (prev) {
      prev.unloadAsync().catch(() => {});
      soundRef.current = null;
      setIsPlaying(false);
      setPositionMs(0);
      setDurationMs(0);
    }
  }, [uri]);

  const handleToggle = async () => {
    if (isPlaying) {
      await soundRef.current?.pauseAsync();
      setIsPlaying(false);
      return;
    }

    let Audio = audioRef.current;
    if (!Audio) {
      try {
        Audio = (await import('expo-av')).Audio;
        audioRef.current = Audio;
      } catch {
        return;
      }
    }

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status: any) => {
          if (!status.isLoaded) return;
          setPositionMs(status.positionMillis);
          setDurationMs(status.durationMillis ?? 0);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPositionMs(0);
            soundRef.current?.setPositionAsync(0).catch(() => {});
          }
        },
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <View style={styles.container}>
      <Pressable onPress={handleToggle} style={styles.playButton}>
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>

      <View style={styles.trackWrap}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.time}>
          {durationMs > 0
            ? `${formatDuration(positionMs)} / ${formatDuration(durationMs)}`
            : 'Voice memo'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(212,144,154,0.1)',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C45A82',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 12,
    color: '#FEFAF9',
  },
  trackWrap: {
    flex: 1,
    gap: 4,
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(212,144,154,0.25)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#C45A82',
    borderRadius: 9999,
  },
  time: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: '#9E8880',
  },
});
