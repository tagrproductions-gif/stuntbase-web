import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'

interface PickerOption {
  label: string
  value: string
}

interface FormPickerProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: PickerOption[]
  error?: string
  required?: boolean
  placeholder?: string
}

export default function FormPicker({
  label,
  value,
  onValueChange,
  options,
  error,
  required = false,
  placeholder = "Select an option"
}: FormPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.pickerContainer, error && styles.pickerError]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          <Picker.Item label={placeholder} value="" color="#999" />
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
      {error && (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 50,
  },
  pickerError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fef5f5',
  },
  picker: {
    color: '#2c3e50',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
})
