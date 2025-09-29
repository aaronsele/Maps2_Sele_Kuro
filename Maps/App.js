import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal,
  Button,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([
    {
      id: 1,
      title: 'Kiosco',
      coordinate: {
        latitude: -34.6096, // aprox Río de Janeiro y Mitre
        longitude: -58.4303,
      },
    },
    {
      id: 2,
      title: 'Casa de Torcha',
      coordinate: {
        latitude: -34.5909, // Jerónimo Salguero 1647
        longitude: -58.4172,
      },
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMarkerName, setNewMarkerName] = useState('');
  const [newMarkerLat, setNewMarkerLat] = useState('');
  const [newMarkerLng, setNewMarkerLng] = useState('');

  // Pedir permisos y activar ubicación en tiempo real
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso denegado');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc.coords);
        }
      );
    })();
  }, []);

  // Función para agregar marcador desde el modal
  const addMarker = () => {
    if (
      newMarkerName.trim() === '' ||
      newMarkerLat.trim() === '' ||
      newMarkerLng.trim() === ''
    ) {
      return;
    }

    setMarkers([
      ...markers,
      {
        id: Date.now(),
        title: newMarkerName,
        coordinate: {
          latitude: parseFloat(newMarkerLat),
          longitude: parseFloat(newMarkerLng),
        },
      },
    ]);

    // Reset form
    setNewMarkerName('');
    setNewMarkerLat('');
    setNewMarkerLng('');
    setModalVisible(false);
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg || 'Obteniendo ubicación...'}</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón flotante + */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Modal para agregar marcador */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar marcador</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={newMarkerName}
              onChangeText={setNewMarkerName}
            />
            <TextInput
              style={styles.input}
              placeholder="Latitud (ej: -34.6104)"
              value={newMarkerLat}
              onChangeText={setNewMarkerLat}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={styles.input}
              placeholder="Longitud (ej: -58.4107)"
              value={newMarkerLng}
              onChangeText={setNewMarkerLng}
              keyboardType="numbers-and-punctuation"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Agregar" onPress={addMarker} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Mapa */}
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
        {/* Markers hardcodeados + dinámicos */}
        {markers.map((m) => (
          <Marker key={m.id} coordinate={m.coordinate} title={m.title} />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
