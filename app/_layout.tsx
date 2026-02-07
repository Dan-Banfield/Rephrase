import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Tabs } from 'expo-router';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: colorScheme === 'dark' ? 'white' : 'black',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Rephrase',
            headerTransparent: false,
           }}
        />
        <Tabs.Screen
          name="social"
          options={{title: 'Socials'}}
          />
        <Tabs.Screen
          name="+not-found"
          options={{ href: null, headerShown: false }}
        />
      </Tabs>
      <PortalHost />
    </ThemeProvider>
  );
}

