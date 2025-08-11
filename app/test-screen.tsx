import { View, Text, StyleSheet, Button } from 'react-native';
import { Link } from 'expo-router';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen</Text>
      <Text style={styles.subtext}>If you can see this, navigation is working!</Text>
      
      <View style={styles.links}>
        <Link href="/(customer)" asChild>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Go to Customer Home</Text>
          </View>
        </Link>
        
        <Link href="/(auth)/login" asChild>
          <View style={[styles.button, { marginTop: 20 }]}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  links: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
