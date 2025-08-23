import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
  Animated
} from 'react-native'
import { ChatMessage, Profile } from '../types'
import { ChatService } from '../services/chat'

const { width, height } = Dimensions.get('window')

export default function HomeScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingText, setTypingText] = useState('')
  
  const scrollViewRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const cursorAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Animate in the initial UI
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    // Blinking cursor animation
    const blinkCursor = () => {
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => blinkCursor())
    }
    blinkCursor()
  }, [])

  const typeMessage = async (text: string) => {
    setIsTyping(true)
    setTypingText('')
    
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20))
      setTypingText(text.slice(0, i))
    }
    
    setIsTyping(false)
    setTypingText('')
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setHasSearched(true)

    // Add user message to chat
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(updatedMessages)

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      const response = await ChatService.sendMessage(userMessage, messages)
      
      // Type out the response
      await typeMessage(response.response)
      
      // Add assistant response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.response 
      }])
      
      // Update profiles if any were returned
      if (response.profiles?.length > 0) {
        setProfiles(response.profiles)
        
        // Animate profile cards in
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 500)
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage = 'Sorry, I encountered an error. Please try again.'
      await typeMessage(errorMessage)
      
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c15f3c" />
      
      {/* Enhanced Header with Gradient */}
      <View style={styles.header}>
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>StuntPitch</Text>
          <Text style={styles.subtitle}>Find Stunt Performers with AI</Text>
          
          {!hasSearched && (
            <View style={styles.featureIcons}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🎬</Text>
                <Text style={styles.featureLabel}>Profiles</Text>
              </View>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🤖</Text>
                <Text style={styles.featureLabel}>AI Search</Text>
              </View>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>✅</Text>
                <Text style={styles.featureLabel}>Verified</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && !hasSearched && (
            <Animated.View 
              style={[
                styles.emptyState,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.emptyIcon}>🎭</Text>
              <Text style={styles.emptyTitle}>You Search, I'll Pitch</Text>
              <Text style={styles.emptySubtitle}>
                Ask me to find stunt performers for your project
              </Text>
              
              <View style={styles.exampleQueries}>
                <TouchableOpacity 
                  style={styles.exampleQuery}
                  onPress={() => setInput("I need a 5'8 martial artist in Atlanta")}
                >
                  <Text style={styles.exampleQueryText}>🥋 "I need a 5'8 martial artist in Atlanta"</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.exampleQuery}
                  onPress={() => setInput("Find me stunt drivers in Los Angeles")}
                >
                  <Text style={styles.exampleQueryText}>🏎️ "Find me stunt drivers in Los Angeles"</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {messages.map((message, index) => (
            <Animated.View
              key={index}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.botAvatar}>
                  <Text style={styles.botAvatarText}>🤖</Text>
                </View>
              )}
              
              <View style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userMessageBubble : styles.assistantMessageBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
                ]}>
                  {message.content}
                </Text>
              </View>

              {message.role === 'user' && (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>👤</Text>
                </View>
              )}
            </Animated.View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <Animated.View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.assistantMessageBubble]}>
                <Text style={styles.assistantMessageText}>
                  {typingText}
                  <Animated.Text style={[styles.cursor, { opacity: cursorAnim }]}>|</Animated.Text>
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Loading Indicator */}
          {loading && !isTyping && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.assistantMessageBubble]}>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#c15f3c" />
                  <Text style={[styles.assistantMessageText, styles.loadingText]}>
                    Searching for performers...
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Enhanced Profile Cards */}
          {profiles.length > 0 && (
            <Animated.View style={styles.profilesContainer}>
              <Text style={styles.profilesTitle}>
                🎯 Found {profiles.length} performers
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.profilesScroll}
              >
                {profiles.map((profile, index) => (
                  <TouchableOpacity key={profile.id} style={styles.profileCard}>
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileImageText}>🎭</Text>
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName} numberOfLines={1}>
                        {profile.full_name}
                      </Text>
                      <Text style={styles.profileLocation} numberOfLines={1}>
                        📍 {profile.location}
                      </Text>
                      {profile.height_feet && (
                        <Text style={styles.profileHeight}>
                          📏 {profile.height_feet}'{profile.height_inches || 0}"
                        </Text>
                      )}
                      <TouchableOpacity style={styles.viewProfileButton}>
                        <Text style={styles.viewProfileButtonText}>View Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </ScrollView>

        {/* Enhanced Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="I need a 5'8 martial artist in ATL..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.sendButtonText}>🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  featureIcon: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconText: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  exampleQueries: {
    width: '100%',
  },
  exampleQuery: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#c15f3c',
  },
  exampleQueryText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botAvatarText: {
    fontSize: 16,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#c15f3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userAvatarText: {
    fontSize: 16,
    color: 'white',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: '#c15f3c',
    borderBottomRightRadius: 4,
  },
  assistantMessageBubble: {
    backgroundColor: '#f1f3f4',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: '#2c3e50',
  },
  cursor: {
    opacity: 0.7,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  profilesContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  profilesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
    marginLeft: 16,
  },
  profilesScroll: {
    paddingLeft: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#c15f3c',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageText: {
    fontSize: 48,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  profileHeight: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  viewProfileButton: {
    backgroundColor: '#c15f3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewProfileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#c15f3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  sendButtonText: {
    fontSize: 18,
  },
})
