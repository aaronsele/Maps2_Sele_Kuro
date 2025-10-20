import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Importá tus pantallas
import MapScreen from '../screens/MapScreen';
import CameraScreen from '../screens/CameraScreen';
import PlacesScreen from '../screens/PlacesScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Bottom Tabs ---
function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="MapScreen"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0066ff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.3,
          height: 60,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'MapScreen') {
            iconName = 'map';
          } else if (route.name === 'CameraScreen') {
            iconName = 'camera';
          } else if (route.name === 'PlacesScreen') {
            iconName = 'location';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ title: 'Mapa' }}
      />
      <Tab.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{ title: 'Cámara' }}
      />
      <Tab.Screen
        name="PlacesScreen"
        component={PlacesScreen}
        options={{ title: 'Lugares' }}
      />
    </Tab.Navigator>
  );
}

// --- Stack principal ---
export default function RootNavigator() {
  return (
    <Stack.Navigator>
      {/* Tabs visibles abajo */}
      <Stack.Screen
        name="HomeTabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />

      {/* Pantalla de detalle (no aparece en la barra) */}
      <Stack.Screen
        name="PlaceDetailScreen"
        component={PlaceDetailScreen}
        options={{ title: 'Detalle del Lugar' }}
      />
    </Stack.Navigator>
  );
}
