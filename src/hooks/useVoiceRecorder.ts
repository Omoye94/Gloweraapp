import { useState, useRef, useCallback } from 'react';
import { Alert } from 'react-native';

export type RecordingState = 'idle' | 'recording' | 'stopped';

interface UseVoiceRecorderReturn {
  recordingState: RecordingState;
  audioUri: string | null;
  durationMs: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const audioRef = useRef<any>(null);
  const recordingRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const { Audio } = await import('expo-av');
      audioRef.current = Audio;

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Microphone Access Needed',
          'Please allow microphone access in Settings to record voice reflections.',
          [{ text: 'OK' }],
        );
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      let recording: any;
      try {
        const result = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        recording = result.recording;
      } catch (e) {
        // createAsync can leave expo-av's internal _recorderExists flag stuck true if it
        // fails partway through prepareToRecordAsync. Unload the partially-created recording
        // so subsequent attempts don't hit "Only one Recording object can be prepared at a
        // given time."
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
        throw e;
      }

      recordingRef.current = recording;
      setAudioUri(null);
      setDurationMs(0);
      setRecordingState('recording');

      timerRef.current = setInterval(() => setDurationMs((d) => d + 1000), 1000);
    } catch (e) {
      console.error('[VoiceRecorder] startRecording failed:', e);
      Alert.alert(
        'Recording Unavailable',
        'Voice recording is not available in this build. Try again after rebuilding the app with audio support.',
      );
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      // Read URI before unloading — it becomes unavailable after
      const uri = recordingRef.current.getURI();
      await recordingRef.current.stopAndUnloadAsync();
      await audioRef.current?.setAudioModeAsync({ allowsRecordingIOS: false });
      recordingRef.current = null;
      setAudioUri(uri ?? null);
      setRecordingState('stopped');
    } catch (e) {
      console.error('[VoiceRecorder] stopRecording failed:', e);
      recordingRef.current = null;
      setRecordingState('idle');
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
    audioRef.current?.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    setAudioUri(null);
    setDurationMs(0);
    setRecordingState('idle');
  }, []);

  return { recordingState, audioUri, durationMs, startRecording, stopRecording, clearRecording };
}
