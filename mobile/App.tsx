import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function App() {
  const [startUrl, setStartUrl] = useState('');
  const [command, setCommand] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Computer Use</Text>

        <Text style={styles.label}>Start URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com"
          autoCapitalize="none"
          value={startUrl}
          onChangeText={setStartUrl}
        />

        <Text style={styles.label}>Command</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Enter command"
          value={command}
          onChangeText={setCommand}
        />

        <View style={styles.actions}>
          <Pressable style={[styles.button, styles.startButton]}>
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.stopButton]}>
            <Text style={styles.buttonText}>Stop</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  textarea: {
    minHeight: 90,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: '#2563eb',
  },
  stopButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
