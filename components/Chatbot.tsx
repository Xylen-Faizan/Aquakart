import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Easing
} from 'react-native';
import { MessageCircle, X, Send, MessageSquare } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (message.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. Our support team will get back to you soon!',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={toggleChat}
        activeOpacity={0.8}
      >
        {isOpen ? (
          <X size={24} color="#FFFFFF" />
        ) : (
          <MessageSquare size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={toggleChat}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim
              }
            ]}
          >
            <View style={styles.chatHeader}>
              <View style={styles.headerContent}>
                <MessageCircle size={24} color="#FFFFFF" />
                <Text style={styles.headerText}>Support Chat</Text>
              </View>
              <TouchableOpacity onPress={toggleChat} style={styles.closeButton}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.messagesContainer}>
              {messages.map((msg) => (
                <View 
                  key={msg.id} 
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userBubble : styles.botBubble
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userText : styles.botText
                  ]}>
                    {msg.text}
                  </Text>
                  <Text style={styles.timestamp}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
              ))}
            </View>
            
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputContainer}
            >
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSend}
                disabled={message.trim() === ''}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    width: '100%',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  botBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#1F2937',
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 120,
    marginRight: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chatbot;
