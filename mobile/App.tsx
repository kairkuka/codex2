import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { io, Socket } from 'socket.io-client';

type Mode = 'agent' | 'manual';

type SessionStep = {
  stepIndex: number;
  action: string;
  status: string;
};

type SessionUpdatePayload = {
  currentUrl?: string;
  steps?: SessionStep[];
  screenshotUrl?: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function App() {
  const [startUrl, setStartUrl] = useState('');
  const [command, setCommand] = useState('');
  const [mode, setMode] = useState<Mode>('agent');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('—');
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotTs, setScreenshotTs] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);

  const socket = useMemo<Socket>(
    () =>
      io(API_BASE_URL, {
        autoConnect: true,
        transports: ['websocket'],
      }),
    [],
  );

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      if (sessionId) {
        socket.emit('session:join', { sessionId });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onSessionUpdate = (payload: SessionUpdatePayload) => {
      if (payload.currentUrl) {
        setCurrentUrl(payload.currentUrl);
      }
      if (payload.steps) {
        setSteps(payload.steps);
      }
      if (payload.screenshotUrl) {
        setScreenshotUrl(payload.screenshotUrl);
        setScreenshotTs(Date.now());
      }
    };

    const onSessionDone = (payload: SessionUpdatePayload) => {
      onSessionUpdate(payload);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('session:update', onSessionUpdate);
    socket.on('session:done', onSessionDone);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('session:update', onSessionUpdate);
      socket.off('session:done', onSessionDone);
      socket.disconnect();
    };
  }, [sessionId, socket]);

  useEffect(() => {
    if (sessionId && socket.connected) {
      socket.emit('session:join', { sessionId });
    }
  }, [sessionId, socket]);

  const startSession = useCallback(async () => {
    if (!startUrl.trim() || !command.trim()) {
      Alert.alert('Validation', 'Please provide both Start URL and Command.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startUrl: startUrl.trim(),
          command: command.trim(),
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start session (${response.status})`);
      }

      const data = (await response.json()) as { sessionId: string };
      setSessionId(data.sessionId);
      setCurrentUrl(startUrl.trim());
      setSteps([]);
      setScreenshotUrl(null);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  }, [command, mode, startUrl]);

  const stopSession = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    setIsStopping(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/stop`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to stop session (${response.status})`);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsStopping(false);
    }
  }, [sessionId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Computer Use Live Execution</Text>
        <Text style={styles.subtitle}>API: {API_BASE_URL}</Text>
        <Text style={styles.connection}>Socket: {isConnected ? 'connected' : 'disconnected'}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Start URL</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            placeholder="https://example.com"
            value={startUrl}
            onChangeText={setStartUrl}
          />

          <Text style={styles.label}>Command</Text>
          <TextInput
            style={[styles.input, styles.commandInput]}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Describe what the agent should do..."
            value={command}
            onChangeText={setCommand}
          />

          <Text style={styles.label}>Mode</Text>
          <View>
            <Pressable style={styles.dropdownTrigger} onPress={() => setModeOpen((prev) => !prev)}>
              <Text>{mode}</Text>
            </Pressable>
            {modeOpen ? (
              <View style={styles.dropdownMenu}>
                {(['agent', 'manual'] as Mode[]).map((item) => (
                  <Pressable
                    key={item}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMode(item);
                      setModeOpen(false);
                    }}
                  >
                    <Text>{item}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.startButton} onPress={startSession} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start</Text>}
            </Pressable>
            <Pressable
              style={[styles.stopButton, !sessionId && styles.buttonDisabled]}
              onPress={stopSession}
              disabled={!sessionId || isStopping}
            >
              {isStopping ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Stop</Text>}
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sessionText}>Session ID: {sessionId ?? '—'}</Text>
          <Text style={styles.liveLabel}>Current URL</Text>
          <Text style={styles.liveValue}>{currentUrl}</Text>

          <Text style={styles.liveLabel}>Steps</Text>
          <FlatList
            data={steps}
            keyExtractor={(item, index) => `${item.stepIndex}-${index}`}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.stepRow}>
                <Text style={styles.stepIndex}>#{item.stepIndex}</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepAction}>{item.action}</Text>
                  <Text style={styles.stepStatus}>{item.status}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No steps yet</Text>}
          />

          <Text style={styles.liveLabel}>Last screenshot</Text>
          {screenshotUrl ? (
            <Image
              source={{ uri: `${API_BASE_URL}${screenshotUrl}?t=${screenshotTs}` }}
              style={styles.screenshot}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.emptyText}>No screenshot yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    padding: 16,
    gap: 16,
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: '#607080',
  },
  connection: {
    color: '#2f855a',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  commandInput: {
    minHeight: 90,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  startButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  sessionText: {
    fontWeight: '600',
  },
  liveLabel: {
    marginTop: 8,
    fontWeight: '700',
  },
  liveValue: {
    color: '#1a202c',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  stepIndex: {
    width: 46,
    fontWeight: '700',
    color: '#4a5568',
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepAction: {
    color: '#1a202c',
  },
  stepStatus: {
    color: '#718096',
    fontSize: 12,
  },
  emptyText: {
    color: '#718096',
    fontStyle: 'italic',
  },
  screenshot: {
    width: '100%',
    height: 360,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
