import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'

export interface ResumeData {
  uri: string
  name: string
  type: string
  size: number
}

interface ResumeUploadProps {
  resume: ResumeData | null
  onResumeChange: (resume: ResumeData | null) => void
  currentResume?: {
    url: string
    filename: string
    size: number
    uploadedAt: string
  }
}

export default function ResumeUpload({ 
  resume, 
  onResumeChange,
  currentResume 
}: ResumeUploadProps) {
  const [loading, setLoading] = useState(false)

  const pickDocument = async () => {
    setLoading(true)
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        
        // Check file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB in bytes
        if (asset.size && asset.size > maxSize) {
          Alert.alert(
            'File Too Large',
            'Resume file must be smaller than 10MB. Please choose a smaller file.',
            [{ text: 'OK' }]
          )
          return
        }

        const resumeData: ResumeData = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
          size: asset.size || 0,
        }

        onResumeChange(resumeData)
        
        Alert.alert(
          'Resume Selected',
          `Selected: ${asset.name}`,
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.error('Error picking document:', error)
      Alert.alert(
        'Error',
        'Failed to select resume. Please try again.',
        [{ text: 'OK' }]
      )
    } finally {
      setLoading(false)
    }
  }

  const removeResume = () => {
    Alert.alert(
      'Remove Resume',
      'Are you sure you want to remove your resume?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onResumeChange(null)
        }
      ]
    )
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const hasResume = resume || currentResume

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resume Upload</Text>
        <Text style={styles.subtitle}>Upload your professional resume (PDF only)</Text>
      </View>

      {!hasResume && (
        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={pickDocument}
          disabled={loading}
        >
          <Text style={styles.uploadIcon}>📄</Text>
          <Text style={styles.uploadText}>
            {loading ? 'Selecting...' : 'Select Resume'}
          </Text>
          <Text style={styles.uploadSubtext}>
            PDF files only • Max 10MB
          </Text>
        </TouchableOpacity>
      )}

      {hasResume && (
        <View style={styles.resumeContainer}>
          <View style={styles.resumeInfo}>
            <Text style={styles.resumeIcon}>📄</Text>
            <View style={styles.resumeDetails}>
              <Text style={styles.resumeName}>
                {resume?.name || currentResume?.filename || 'Resume.pdf'}
              </Text>
              <Text style={styles.resumeSize}>
                {resume ? formatFileSize(resume.size) : 
                 currentResume ? formatFileSize(currentResume.size) : 'Unknown size'}
              </Text>
              {currentResume && !resume && (
                <Text style={styles.resumeDate}>
                  Uploaded: {new Date(currentResume.uploadedAt).toLocaleDateString()}
                </Text>
              )}
              {resume && (
                <Text style={styles.resumeStatus}>✅ Ready to upload</Text>
              )}
            </View>
          </View>
          
          <View style={styles.resumeActions}>
            <TouchableOpacity
              style={styles.replaceButton}
              onPress={pickDocument}
              disabled={loading}
            >
              <Text style={styles.replaceButtonText}>
                {loading ? 'Selecting...' : 'Replace'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeResume}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!hasResume && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📋</Text>
          <Text style={styles.emptyStateText}>No resume uploaded</Text>
          <Text style={styles.emptyStateSubtext}>
            Upload your resume to showcase your experience
          </Text>
        </View>
      )}

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>💡 Resume Tips:</Text>
        <Text style={styles.tipsText}>
          • Keep it concise (1-2 pages){'\n'}
          • Include relevant stunt experience{'\n'}
          • List special skills and training{'\n'}
          • Use PDF format for best compatibility
        </Text>
      </View>
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
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#c15f3c',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  resumeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resumeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  resumeDetails: {
    flex: 1,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  resumeSize: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  resumeDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  resumeStatus: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  replaceButton: {
    backgroundColor: '#c15f3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  replaceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  tips: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
  },
})
