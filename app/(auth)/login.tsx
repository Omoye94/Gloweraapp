import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isValidEmail } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Please enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setIsLoading(false);
      Alert.alert('Oops', error.message || 'Something went wrong. Please try again.');
    } else {
      router.replace('/');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/garden-path.jpeg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(20,12,32,0.72)', 'rgba(20,12,32,0.45)', 'rgba(20,12,32,0.80)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.inner}>

            {/* Heading */}
            <View style={styles.heading}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Continue where you left off</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255,255,255,0.38)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: undefined })); }}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.38)"
                  secureTextEntry
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
                  onSubmitEditing={handleLogin}
                  returnKeyType="done"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
            </View>

            {/* CTA */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
            >
              <LinearGradient
                colors={['#E87FA6', '#C45A82']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>{isLoading ? 'Signing in…' : 'Sign in'}</Text>
              </LinearGradient>
            </Pressable>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <Pressable
                onPress={() => router.replace('/(onboarding)/problem')}
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.footerLink}>Begin your journey</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    fontFamily: 'DMSans',
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
    gap: 32,
  },
  heading: {
    gap: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 38,
    color: '#FEFAF9',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'DMSans',
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 24,
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    fontFamily: 'DMSans',
    color: '#FEFAF9',
  },
  inputError: {
    borderColor: 'rgba(242,180,204,0.7)',
  },
  errorText: {
    fontFamily: 'DMSans',
    fontSize: 12,
    color: '#F2B4CC',
    marginTop: 6,
    marginLeft: 4,
  },
  ctaBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#E87FA6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 18,
  },
  ctaText: {
    fontFamily: 'DMSans',
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1028',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    color: 'rgba(255,255,255,0.38)',
  },
  footerLink: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(242,180,204,0.75)',
  },
});
