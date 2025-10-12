import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [markers, setMarkers] = useState([
    { id: 1, title: 'Kiosco', coordinate: { latitude: -34.6096, longitude: -58.4303 } },
    { id: 2, title: 'Casa de Torcha', coordinate: { latitude: -34.5909, longitude: -58.4172 } },
  ]);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        loc => setLocation(loc.coords)
      );
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Obteniendo ubicación...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {markers.map(m => (
          <Marker key={m.id} coordinate={m.coordinate} title={m.title} />
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CameraScreen')}
      >
        <Text style={styles.buttonText}>Abrir Cámara</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { bottom: 100 }]}
        onPress={() => navigation.navigate('PlacesScreen')}
      >
        <Text style={styles.buttonText}>Ver Lugares Guardados</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  button: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    zIndex: 2,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
