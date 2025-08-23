import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native'
import { supabase } from '../config/supabase'

const { width } = Dimensions.get('window')

interface Profile {
  id: string
  full_name: string
  bio: string
  location: string
  profile_photos: any[]
}

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewStats, setViewStats] = useState({ views: 0, searches: 0 })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        // Navigate to login
        Alert.alert('Authentication Required', 'Please log in to access your dashboard.')
        return
      }

      setUser(user)
      
      // Get user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_photos (*)
        `)
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)
      
      // Mock view stats for now
      setViewStats({ views: 42, searches: 8 })
      
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    Alert.alert('Coming Soon', `${action} functionality will be available soon!`)
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c15f3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Overview */}
        {profile ? (
          <View style={styles.profileOverview}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>📸</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.full_name}</Text>
              <Text style={styles.profileLocation}>📍 {profile.location || 'Location not set'}</Text>
              <Text style={styles.profileBio} numberOfLines={2}>
                {profile.bio || 'No bio added yet'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noProfileCard}>
            <Text style={styles.noProfileIcon}>👤</Text>
            <Text style={styles.noProfileTitle}>No Profile Yet</Text>
            <Text style={styles.noProfileText}>
              Create your stunt performer profile to get discovered by casting directors
            </Text>
            <TouchableOpacity
              style={styles.createProfileButton}
              onPress={() => handleQuickAction('Create Profile')}
            >
              <Text style={styles.createProfileButtonText}>Create Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Cards */}
        {profile && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{viewStats.views}</Text>
              <Text style={styles.statLabel}>Profile Views</Text>
              <Text style={styles.statIcon}>👁️</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{viewStats.searches}</Text>
              <Text style={styles.statLabel}>Search Results</Text>
              <Text style={styles.statIcon}>🔍</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            {profile ? (
              <>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handleQuickAction('Edit Profile')}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                  <Text style={styles.actionTitle}>Edit Profile</Text>
                  <Text style={styles.actionSubtitle}>Update your info</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handleQuickAction('View Public Profile')}
                >
                  <Text style={styles.actionIcon}>👁️</Text>
                  <Text style={styles.actionTitle}>View Profile</Text>
                  <Text style={styles.actionSubtitle}>See public view</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionCard, styles.primaryAction]}
                onPress={() => handleQuickAction('Create Profile')}
              >
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionTitle}>Create Profile</Text>
                <Text style={styles.actionSubtitle}>Get started now</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('Search Performers')}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>Search</Text>
              <Text style={styles.actionSubtitle}>Find performers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('Settings')}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionSubtitle}>Account settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              🎬 Your profile appeared in 3 searches today{'\n'}
              👁️ 2 casting directors viewed your profile{'\n'}
              📈 Profile views increased by 15% this week
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  profileOverview: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileImageText: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  noProfileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noProfileIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noProfileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  noProfileText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createProfileButton: {
    backgroundColor: '#c15f3c',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#c15f3c',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 5,
  },
  statIcon: {
    fontSize: 20,
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 50) / 2,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryAction: {
    backgroundColor: '#c15f3c',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
  },
  activityText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },
})
