import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen';
import CameraScreen from '../screens/CameraScreen';
import PlacesScreen from '../screens/PlacesScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="MapScreen">
      <Stack.Screen 
        name="MapScreen" 
        component={MapScreen} 
        options={{ title: 'Mapa de Lugares' }}
      />
      <Stack.Screen 
        name="CameraScreen" 
        component={CameraScreen} 
        options={{ title: 'Cámara' }}
      />
      <Stack.Screen 
        name="PlacesScreen" 
        component={PlacesScreen} 
        options={{ title: 'Lugares Guardados' }}
      />
    </Stack.Navigator>
  );
}