import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer'); // Customer or Vendor
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name || !email || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    // Strong password validation
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password, role);
    } catch (error) {
      Alert.alert('Signup Error', error.message || 'Unable to create account');
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
          <Text style={styles.title}>Join Food Corner</Text>
          <Text style={styles.subtitle}>Discover or showcase delicious meals</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#8A89A6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#5C5B7A"
              value={name}
              onChangeText={setName}
            />
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
              placeholder="At least 6 characters"
              placeholderTextColor="#5C5B7A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Register As</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'Customer' && styles.roleButtonActive]}
              onPress={() => setRole('Customer')}
            >
              <Text style={[styles.roleButtonText, role === 'Customer' && styles.roleButtonTextActive]}>
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'Vendor' && styles.roleButtonActive]}
              onPress={() => setRole('Vendor')}
            >
              <Text style={[styles.roleButtonText, role === 'Vendor' && styles.roleButtonTextActive]}>
                Vendor / Chef
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerLink}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.linkText}>Log In</Text>
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
    marginBottom: 30
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
  label: {
    color: '#C5C5D8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12
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
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  roleButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0D0C1D',
    borderWidth: 1,
    borderColor: '#24234C',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4
  },
  roleButtonActive: {
    backgroundColor: '#FF3E6C',
    borderColor: '#FF3E6C'
  },
  roleButtonText: {
    color: '#8A89A6',
    fontWeight: '600',
    fontSize: 14
  },
  roleButtonTextActive: {
    color: '#FFFFFF'
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
