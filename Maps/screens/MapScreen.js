import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';

const FALLBACK_REGION = {
  latitude: -34.6037,      // CABA
  longitude: -58.3816,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [markers, setMarkers] = useState([
    { id: 1, title: 'Kiosco', coordinate: { latitude: -34.6096, longitude: -58.4303 } },
    { id: 2, title: 'Casa de Torcha', coordinate: { latitude: -34.5909, longitude: -58.4172 } },
  ]);
  const navigation = useNavigation();
  const route = useRoute();

  // Obtener y agregar el nuevo marcador de la foto
  useEffect(() => {
    const incoming = route.params?.newMarker;
    if (incoming) {
      setMarkers(prev => [...prev, incoming]); // Agregar el nuevo marcador
    }
  }, [route.params?.newMarker]);

  // Pedir permisos de ubicación
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // No concedido, usamos ubicación de fallback
        return;
      }
      // Obtener la ubicación en cuanto el permiso sea concedido
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 5 },
        (loc) => setLocation(loc.coords)
      );
    })();
  }, []);

  // Si no hay ubicación, mostramos la ubicación de fallback
  const region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : FALLBACK_REGION;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
      >
        {markers.map(m => (
          <Marker key={m.id} coordinate={m.coordinate} title={m.title}>
            {/* Solo renderizamos la imagen si 'photoUri' existe */}
            {m.photoUri && (
              <Image 
                source={{ uri: m.photoUri }} 
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            )}
          </Marker>
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
  container: { flex: 1, backgroundColor: '#eee' },
  map: { flex: 1 },
  button: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    zIndex: 2,
    elevation: 2,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
