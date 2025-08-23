import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native'

const { width } = Dimensions.get('window')

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    height: '',
    skills: '',
    experience: '',
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c15f3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Performers</Text>
        <Text style={styles.subtitle}>Find the perfect talent for your project</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, skills, or location..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Quick Filters</Text>
          
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Location</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. Los Angeles"
                placeholderTextColor="#999"
                value={filters.location}
                onChangeText={(text) => setFilters({...filters, location: text})}
              />
            </View>
            
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Height</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. 5'8 inches"
                placeholderTextColor="#999"
                value={filters.height}
                onChangeText={(text) => setFilters({...filters, height: text})}
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Skills</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. Martial Arts"
                placeholderTextColor="#999"
                value={filters.skills}
                onChangeText={(text) => setFilters({...filters, skills: text})}
              />
            </View>
            
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Experience</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. 5+ years"
                placeholderTextColor="#999"
                value={filters.experience}
                onChangeText={(text) => setFilters({...filters, experience: text})}
              />
            </View>
          </View>
        </View>

        {/* Popular Searches */}
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          <View style={styles.popularTags}>
            {[
              'Martial Arts',
              'Stunt Driving',
              'Wire Work',
              'Parkour',
              'Weapons',
              'Fire Stunts',
              'High Falls',
              'Motorcycle',
            ].map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularTag}
                onPress={() => setSearchQuery(tag)}
              >
                <Text style={styles.popularTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoonSection}>
          <Text style={styles.comingSoonTitle}>🚀 Advanced Filters Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            • Filter by union status{'\n'}
            • Availability calendar{'\n'}
            • Certification verification{'\n'}
            • Distance radius{'\n'}
            • Rate ranges
          </Text>
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#c15f3c',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  filtersSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 5,
  },
  filterInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  popularSection: {
    marginBottom: 30,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  popularTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  popularTagText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  comingSoonSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 22,
  },
})
