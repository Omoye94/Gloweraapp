import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

const EMOJIS = ['✨', '🌸', '💛', '🌿', '🌙', '🦋', '💫', '🌺'];

interface GratitudeEntryInputProps {
  onSubmit: (content: string, emoji: string) => void;
  disabled?: boolean;
}

export const GratitudeEntryInput: React.FC<GratitudeEntryInputProps> = ({
  onSubmit,
  disabled,
}) => {
  const [text, setText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, selectedEmoji);
    setText('');
    setSelectedEmoji('✨');
  };

  return (
    <View style={styles.container}>
        {/* Emoji row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.emojiRow}
        >
          {EMOJIS.map((emoji) => {
            const active = emoji === selectedEmoji;
            return (
              <Pressable
                key={emoji}
                onPress={() => setSelectedEmoji(emoji)}
                style={[styles.emojiBtn, active && styles.emojiBtnActive]}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Text input */}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="I'm grateful for..."
          placeholderTextColor="#B8A09C"
          multiline
          maxLength={200}
          style={styles.input}
          returnKeyType="done"
          blurOnSubmit
        />

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!text.trim() || disabled}
          style={({ pressed }) => [
            styles.button,
            (!text.trim() || disabled) && styles.buttonDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.buttonText}>Add to jar</Text>
        </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(254,250,249,0.7)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,144,154,0.2)',
    width: '100%',
    marginBottom: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(254,250,249,0.5)',
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: {
    borderColor: '#C45A82',
    backgroundColor: 'rgba(212,144,154,0.12)',
  },
  emojiText: {
    fontSize: 20,
  },
  input: {
    fontFamily: 'DMSans',
    fontSize: 15,
    color: '#3A2E2B',
    height: 60,
    textAlignVertical: 'top',
    paddingHorizontal: 4,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#3A2E2B',
    borderRadius: 9999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Raleway-SemiBold',
    color: '#FEFAF9',
    letterSpacing: 0.3,
  },
});
