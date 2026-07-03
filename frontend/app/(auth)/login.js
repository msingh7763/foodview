import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('customer@foodcorner.com');
  const [password, setPassword] = useState('Customer@123');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Error', error.message || 'Unable to sign in. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerArea}>
          <Ionicons name="star" size={48} color="#FFD700" />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to check ratings & delicious dishes</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo login</Text>
            <Text style={styles.demoText}>Customer: customer@foodcorner.com / Customer@123</Text>
            <Text style={styles.demoText}>Vendor: vendor@foodcorner.com / Vendor@123</Text>
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#8A89A6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@email.com"
              placeholderTextColor="#5C5B7A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#8A89A6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#5C5B7A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerLink}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0C1D'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16
  },
  subtitle: {
    color: '#8A89A6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8
  },
  formContainer: {
    backgroundColor: '#161530',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24234C'
  },
  demoBox: {
    backgroundColor: 'rgba(255, 62, 108, 0.08)',
    borderColor: '#FF3E6C',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  demoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6
  },
  demoText: {
    color: '#C5C5D8',
    fontSize: 12,
    lineHeight: 18
  },
  label: {
    color: '#C5C5D8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0C1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#24234C',
    paddingHorizontal: 12
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    height: 48,
    fontSize: 16
  },
  button: {
    backgroundColor: '#FF3E6C',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#FF3E6C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  footerText: {
    color: '#8A89A6',
    fontSize: 14
  },
  linkText: {
    color: '#FF3E6C',
    fontSize: 14,
    fontWeight: 'bold'
  }
});
