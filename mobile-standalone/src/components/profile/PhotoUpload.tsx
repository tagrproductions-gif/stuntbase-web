import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'

export interface PhotoData {
  uri: string
  name: string
  type: string
  size?: number
}

interface PhotoUploadProps {
  photos: PhotoData[]
  onPhotosChange: (photos: PhotoData[]) => void
  maxPhotos?: number
}

const { width } = Dimensions.get('window')
const photoWidth = (width - 60) / 2 // Account for padding and gap

export default function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5 
}: PhotoUploadProps) {
  const [loading, setLoading] = useState(false)

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need camera and photo library permissions to upload photos.',
        [{ text: 'OK' }]
      )
      return false
    }
    return true
  }

  const compressImage = async (uri: string): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          // Resize if too large
          { resize: { width: 1200 } }
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      )
      return manipResult.uri
    } catch (error) {
      console.error('Error compressing image:', error)
      return uri // Return original if compression fails
    }
  }

  const processImage = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return
    }

    setLoading(true)

    try {
      const asset = result.assets[0]
      
      // Compress the image
      const compressedUri = await compressImage(asset.uri)
      
      const photoData: PhotoData = {
        uri: compressedUri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize,
      }

      onPhotosChange([...photos, photoData])
    } catch (error) {
      console.error('Error processing image:', error)
      Alert.alert('Error', 'Failed to process the image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const takePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can only add up to ${maxPhotos} photos`)
      return
    }

    const hasPermissions = await requestPermissions()
    if (!hasPermissions) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    await processImage(result)
  }

  const pickFromLibrary = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can only add up to ${maxPhotos} photos`)
      return
    }

    const hasPermissions = await requestPermissions()
    if (!hasPermissions) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    await processImage(result)
  }

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const removePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const newPhotos = photos.filter((_, i) => i !== index)
            onPhotosChange(newPhotos)
          }
        }
      ]
    )
  }

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos]
    const [moved] = newPhotos.splice(fromIndex, 1)
    newPhotos.splice(toIndex, 0, moved)
    onPhotosChange(newPhotos)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Photos * ({photos.length}/{maxPhotos})</Text>
        <Text style={styles.subtitle}>At least 1 photo is required. Add photos to showcase your work and appearance</Text>
      </View>

      {/* Upload Button */}
      {photos.length < maxPhotos && (
        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={showImageOptions}
          disabled={loading}
        >
          <Text style={styles.uploadIcon}>📸</Text>
          <Text style={styles.uploadText}>
            {loading ? 'Processing...' : 'Add Photo'}
          </Text>
          <Text style={styles.uploadSubtext}>
            Camera or Photo Library
          </Text>
        </TouchableOpacity>
      )}

      {/* Photos Grid */}
      {photos.length > 0 && (
        <View style={styles.photosSection}>
          <Text style={styles.photosTitle}>Uploaded Photos</Text>
          <ScrollView style={styles.photosScrollView}>
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  
                  {/* Primary badge */}
                  {index === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>⭐ Primary</Text>
                    </View>
                  )}

                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>

                  {/* Move buttons */}
                  <View style={styles.moveButtons}>
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => movePhoto(index, index - 1)}
                      >
                        <Text style={styles.moveButtonText}>←</Text>
                      </TouchableOpacity>
                    )}
                    {index < photos.length - 1 && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => movePhoto(index, index + 1)}
                      >
                        <Text style={styles.moveButtonText}>→</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Photo info */}
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoSize}>
                      {photo.size ? `${(photo.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
          
          {photos.length > 0 && (
            <Text style={styles.reorderHint}>
              The first photo will be your primary profile photo. Use arrows to reorder.
            </Text>
          )}
        </View>
      )}

      {photos.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📷</Text>
          <Text style={styles.emptyStateText}>No photos uploaded yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add photos to showcase your work and appearance
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
  photosSection: {
    marginBottom: 20,
  },
  photosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  photosScrollView: {
    maxHeight: 400,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: photoWidth,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  photo: {
    width: '100%',
    height: photoWidth * 0.75, // 4:3 aspect ratio
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#f39c12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moveButtons: {
    position: 'absolute',
    bottom: 30,
    right: 8,
    flexDirection: 'row',
  },
  moveButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  moveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  photoInfo: {
    padding: 8,
    backgroundColor: '#f8f9fa',
  },
  photoSize: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  reorderHint: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
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
})
