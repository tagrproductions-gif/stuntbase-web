import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native'

export interface SimpleCertification {
  name: string
}

interface CertificationsSelectorProps {
  certifications: SimpleCertification[]
  onCertificationsChange: (certifications: SimpleCertification[]) => void
  maxCertifications?: number
}

const normalizeText = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function CertificationsSelector({ 
  certifications, 
  onCertificationsChange, 
  maxCertifications = 10 
}: CertificationsSelectorProps) {
  const [certificationName, setCertificationName] = useState('')

  const addCertification = () => {
    if (!certificationName.trim()) {
      Alert.alert('Error', 'Please enter a certification name')
      return
    }
    
    if (certifications.length >= maxCertifications) {
      Alert.alert('Limit Reached', `You can only add up to ${maxCertifications} certifications`)
      return
    }
    
    const normalizedName = normalizeText(certificationName.trim())
    
    // Check if certification already exists
    if (certifications.some(cert => cert.name.toLowerCase() === normalizedName.toLowerCase())) {
      Alert.alert('Duplicate Certification', 'This certification has already been added')
      return
    }

    const newCertification: SimpleCertification = {
      name: normalizedName
    }

    onCertificationsChange([...certifications, newCertification])
    setCertificationName('')
  }

  const removeCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index)
    onCertificationsChange(updatedCertifications)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Certifications ({certifications.length}/{maxCertifications})</Text>
        <Text style={styles.subtitle}>Add your certifications and training</Text>
      </View>

      {/* Add new certification */}
      <View style={styles.addSection}>
        <TextInput
          style={styles.certificationInput}
          placeholder="Enter certification (e.g. CPR Certified, Stunt Safety, etc.)"
          placeholderTextColor="#999"
          value={certificationName}
          onChangeText={setCertificationName}
        />

        <TouchableOpacity
          style={[styles.addButton, (!certificationName.trim() || certifications.length >= maxCertifications) && styles.addButtonDisabled]}
          onPress={addCertification}
          disabled={!certificationName.trim() || certifications.length >= maxCertifications}
        >
          <Text style={styles.addButtonText}>+ Add Certification</Text>
        </TouchableOpacity>
      </View>

      {/* Certifications list */}
      {certifications.length > 0 && (
        <View style={styles.certificationsList}>
          <Text style={styles.certificationsListTitle}>Your Certifications</Text>
          <ScrollView style={styles.certificationsScrollView}>
            {certifications.map((certification, index) => (
              <View key={index} style={styles.certificationItem}>
                <View style={styles.certificationInfo}>
                  <Text style={styles.certificationName}>{certification.name}</Text>
                  <View style={styles.certificationBadge}>
                    <Text style={styles.certificationBadgeText}>🏆</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeCertification(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {certifications.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No certifications added yet. Add your certifications and training credentials.
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  addSection: {
    marginBottom: 20,
  },
  certificationInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#2c3e50',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#c15f3c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  certificationsList: {
    marginBottom: 20,
  },
  certificationsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  certificationsScrollView: {
    maxHeight: 200,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  certificationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  certificationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1565c0',
    marginRight: 12,
  },
  certificationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificationBadgeText: {
    fontSize: 12,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
})
