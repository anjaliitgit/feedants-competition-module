import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  View
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView
} from 'react-native-safe-area-context';

import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';
import { api, setToken } from './src/services/api';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loginDemoUser() {
      try {
        const response = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'participant2@feedants.local',
            password: 'Demo@123'
          })
        });

        setToken(response.token);

        console.log('Demo user logged in successfully');
      } catch (error) {
        console.error('Demo login failed:', error);
      } finally {
        setReady(true);
      }
    }

    loginDemoUser();
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>
            Connecting to Feedants...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <CompetitionDetailsScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
