import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { isValidEmail } from '../../lib/utils';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { signUp, isLoading } = useAuthStore();

  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    const { error } = await signUp(email, password);

    if (error) {
      Alert.alert('Oops!', error.message || 'Something went wrong. Please try again.');
    } else {
      router.replace('/(auth)/onboarding');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Header */}
          <View className="items-center mb-12">
            <Text className="text-4xl font-bold text-primary mb-2">Glowera</Text>
            <Text className="text-text-light text-base">Glow With Every Habit</Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text className="text-2xl font-semibold text-text mb-2">Create your account</Text>
            <Text className="text-text-light">
              Start your journey to a more radiant you
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-text mb-2 font-medium">Email</Text>
              <TextInput
                className={`bg-surface border ${
                  errors.email ? 'border-red-300' : 'border-primary/20'
                } rounded-soft px-4 py-4 text-text`}
                placeholder="your@email.com"
                placeholderTextColor="#8A8A8A"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email && (
                <Text className="text-red-400 text-sm mt-1">{errors.email}</Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-text mb-2 font-medium">Password</Text>
              <TextInput
                className={`bg-surface border ${
                  errors.password ? 'border-red-300' : 'border-primary/20'
                } rounded-soft px-4 py-4 text-text`}
                placeholder="Create a password"
                placeholderTextColor="#8A8A8A"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {errors.password && (
                <Text className="text-red-400 text-sm mt-1">{errors.password}</Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-text mb-2 font-medium">Confirm Password</Text>
              <TextInput
                className={`bg-surface border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-primary/20'
                } rounded-soft px-4 py-4 text-text`}
                placeholder="Confirm your password"
                placeholderTextColor="#8A8A8A"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {errors.confirmPassword && (
                <Text className="text-red-400 text-sm mt-1">{errors.confirmPassword}</Text>
              )}
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            className={`mt-8 bg-primary rounded-soft py-4 items-center ${
              isLoading ? 'opacity-70' : ''
            }`}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-lg">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-text-light">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Terms */}
          <Text className="text-text-light text-center text-sm mt-8 px-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
