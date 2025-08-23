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

export interface SimpleSkill {
  name: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

interface SkillsSelectorProps {
  skills: SimpleSkill[]
  onSkillsChange: (skills: SimpleSkill[]) => void
  maxSkills?: number
}

const normalizeText = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getProficiencyColor = (level: string) => {
  switch (level) {
    case 'beginner': return '#3498db'
    case 'intermediate': return '#27ae60'
    case 'advanced': return '#f39c12'
    case 'expert': return '#e74c3c'
    default: return '#95a5a6'
  }
}

export default function SkillsSelector({ 
  skills, 
  onSkillsChange, 
  maxSkills = 20 
}: SkillsSelectorProps) {
  const [skillName, setSkillName] = useState('')
  const [proficiencyLevel, setProficiencyLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate')

  const addSkill = () => {
    if (!skillName.trim()) {
      Alert.alert('Error', 'Please enter a skill name')
      return
    }
    
    if (skills.length >= maxSkills) {
      Alert.alert('Limit Reached', `You can only add up to ${maxSkills} skills`)
      return
    }
    
    const normalizedName = normalizeText(skillName.trim())
    
    // Check if skill already exists
    if (skills.some(skill => skill.name.toLowerCase() === normalizedName.toLowerCase())) {
      Alert.alert('Duplicate Skill', 'This skill has already been added')
      return
    }

    const newSkill: SimpleSkill = {
      name: normalizedName,
      proficiency_level: proficiencyLevel
    }

    onSkillsChange([...skills, newSkill])
    setSkillName('')
    setProficiencyLevel('intermediate')
  }

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index)
    onSkillsChange(updatedSkills)
  }

  const proficiencyOptions = [
    { label: 'Beginner', value: 'beginner' as const },
    { label: 'Intermediate', value: 'intermediate' as const },
    { label: 'Advanced', value: 'advanced' as const },
    { label: 'Expert', value: 'expert' as const },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Skills ({skills.length}/{maxSkills})</Text>
        <Text style={styles.subtitle}>Add your skills and proficiency levels</Text>
      </View>

      {/* Add new skill */}
      <View style={styles.addSection}>
        <TextInput
          style={styles.skillInput}
          placeholder="Enter skill (e.g. Martial Arts, Driving, etc.)"
          placeholderTextColor="#999"
          value={skillName}
          onChangeText={setSkillName}
        />
        
        <View style={styles.proficiencyContainer}>
          <Text style={styles.proficiencyLabel}>Proficiency Level:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proficiencyScroll}>
            {proficiencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.proficiencyButton,
                  proficiencyLevel === option.value && styles.proficiencyButtonActive,
                  { backgroundColor: proficiencyLevel === option.value ? getProficiencyColor(option.value) : '#f8f9fa' }
                ]}
                onPress={() => setProficiencyLevel(option.value)}
              >
                <Text style={[
                  styles.proficiencyButtonText,
                  proficiencyLevel === option.value && styles.proficiencyButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.addButton, (!skillName.trim() || skills.length >= maxSkills) && styles.addButtonDisabled]}
          onPress={addSkill}
          disabled={!skillName.trim() || skills.length >= maxSkills}
        >
          <Text style={styles.addButtonText}>+ Add Skill</Text>
        </TouchableOpacity>
      </View>

      {/* Skills list */}
      {skills.length > 0 && (
        <View style={styles.skillsList}>
          <Text style={styles.skillsListTitle}>Your Skills</Text>
          <ScrollView style={styles.skillsScrollView}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <View style={[styles.proficiencyBadge, { backgroundColor: getProficiencyColor(skill.proficiency_level) }]}>
                    <Text style={styles.proficiencyBadgeText}>{skill.proficiency_level}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeSkill(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {skills.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No skills added yet. Add your skills to showcase your abilities.
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
  skillInput: {
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
  proficiencyContainer: {
    marginBottom: 16,
  },
  proficiencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  proficiencyScroll: {
    flexGrow: 0,
  },
  proficiencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  proficiencyButtonActive: {
    borderColor: 'transparent',
  },
  proficiencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  proficiencyButtonTextActive: {
    color: 'white',
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
  skillsList: {
    marginBottom: 20,
  },
  skillsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  skillsScrollView: {
    maxHeight: 200,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  skillInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginRight: 12,
  },
  proficiencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proficiencyBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
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
