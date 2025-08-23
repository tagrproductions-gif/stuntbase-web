import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { useAuth } from '../../contexts/AuthContext'

interface VerifyOTPScreenProps {
  navigation: any
  route: any
}

export default function VerifyOTPScreen({ navigation, route }: VerifyOTPScreenProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { verifyOTP, resendOTP } = useAuth()
  
  // Get email from navigation params
  const email = route.params?.email || ''

  useEffect(() => {
    if (!email) {
      setError('Email address is missing')
    }
  }, [email])

  const handleVerifyOTP = async () => {
    if (!email) {
      setError('Email address is missing')
      return
    }

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await verifyOTP(email, otp)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Show success message briefly then navigate
        setTimeout(() => {
          // Navigation will be handled automatically by auth state change
        }, 2000)
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) return
    
    setResendLoading(true)
    setError(null)

    try {
      const { error } = await resendOTP(email)

      if (error) {
        setError(error.message)
      } else {
        Alert.alert('Success', 'New verification code sent!')
      }
    } catch (err) {
      setError('Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Email Verified!</Text>
        <Text style={styles.successText}>Your account has been successfully verified</Text>
        <ActivityIndicator size="small" color="#c15f3c" style={styles.successLoader} />
        <Text style={styles.successSubtext}>Redirecting to your dashboard...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#c15f3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>StuntPitch</Text>
        <Text style={styles.subtitle}>Verify your email</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.description}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="numeric"
              maxLength={6}
              editable={!loading}
              textAlign="center"
            />
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, (loading || otp.length !== 6) && styles.verifyButtonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={resendLoading}
          >
            <Text style={styles.resendButtonText}>
              {resendLoading ? 'Sending...' : "Didn't receive a code? Resend"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backLink}>← Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#c15f3c',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  form: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  otpInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#2c3e50',
    letterSpacing: 8,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#c15f3c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendButtonText: {
    color: '#c15f3c',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  backLink: {
    fontSize: 16,
    color: '#6c757d',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#27ae60',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 30,
    textAlign: 'center',
  },
  successLoader: {
    marginBottom: 10,
  },
  successSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
})