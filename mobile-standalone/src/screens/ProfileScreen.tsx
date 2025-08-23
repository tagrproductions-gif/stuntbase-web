import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export default function ProfileScreen() {
  const { signOut, user } = useAuth()

  const handleAction = (action: string) => {
    Alert.alert('Coming Soon', `${action} functionality will be available soon!`)
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c15f3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Manage your performer profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Preview */}
        <View style={styles.profileCard}>
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>📸</Text>
          </View>
          <Text style={styles.profileName}>{user?.email || 'Your Name'}</Text>
          <Text style={styles.profileLocation}>📍 Your Location</Text>
          <Text style={styles.profileBio}>
            Your professional bio will appear here...
          </Text>
        </View>

        {/* Profile Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Profile Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('Edit Profile')}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionSubtitle}>Update your information and photos</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('View Public Profile')}
          >
            <Text style={styles.actionIcon}>👁️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Public Profile</Text>
              <Text style={styles.actionSubtitle}>See how others see your profile</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('Manage Photos')}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Photos</Text>
              <Text style={styles.actionSubtitle}>Add, remove, or reorder photos</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('Skills & Certifications')}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Skills & Certifications</Text>
              <Text style={styles.actionSubtitle}>Update your abilities and credentials</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.actionIcon}>🚪</Text>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.signOutText]}>Sign Out</Text>
              <Text style={styles.actionSubtitle}>Sign out of your account</Text>
            </View>
            <Text style={[styles.actionArrow, styles.signOutText]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Profile Performance</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Profile Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Search Results</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Inquiries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Profile Complete</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Profile Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • Add professional headshots and action photos{'\n'}
              • Keep your bio concise but descriptive{'\n'}
              • List all relevant skills and certifications{'\n'}
              • Update your availability status regularly{'\n'}
              • Include your location and travel radius
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#c15f3c',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageText: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6c757d',
  },
  actionArrow: {
    fontSize: 20,
    color: '#c15f3c',
    fontWeight: 'bold',
  },
  signOutButton: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  signOutText: {
    color: '#e74c3c',
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#c15f3c',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  tipsSection: {
    marginBottom: 30,
  },
  tipCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },
})
