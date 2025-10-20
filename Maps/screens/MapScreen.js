import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

const FALLBACK_REGION = {
  latitude: -34.6037, // CABA
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

  const [savedPlaces, setSavedPlaces] = useState([
    { id: 1, title: 'Kiosco', coordinate: { latitude: -34.6096, longitude: -58.4303 } },
    { id: 2, title: 'Casa de Torcha', coordinate: { latitude: -34.5909, longitude: -58.4172 } },
  ]);

  const navigation = useNavigation();
  const route = useRoute();

  // --- agregar nuevo marcador cuando vuelve desde CameraScreen
  useEffect(() => {
    const incoming = route.params?.newMarker;
    if (incoming && !markers.some(m => m.id === incoming.id)) {
      setMarkers(prev => [...prev, incoming]);
      setSavedPlaces(prev => [...prev, incoming]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.newMarker]);

  // --- permisos y watch de ubicación del usuario
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 5 },
        (loc) => setLocation(loc.coords)
      );
    })();
  }, []);

  const region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : FALLBACK_REGION;

  // -----------------------
  //   NUEVA FUNCIÓN “+”
  // -----------------------
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]); // [{ uri, fileName? }, ...]
  const [tempCoordinate, setTempCoordinate] = useState(null); // { latitude, longitude }
  const [selectingLocation, setSelectingLocation] = useState(false); // modo “tocar mapa”
  const [saving, setSaving] = useState(false);

  // Permisos con hooks (mejor UX y manejo de denegación permanente)
  const [libPerm, requestLibPerm] = ImagePicker.useMediaLibraryPermissions();
  const [camPerm, requestCamPerm] = ImagePicker.useCameraPermissions();

  const ensureLibraryPermission = useCallback(async () => {
    // ya concedido
    if (libPerm?.granted) return true;
    // si está "blocked" (denegado permanente), mandar a settings
    if (libPerm && libPerm.canAskAgain === false) {
      Alert.alert(
        'Permiso requerido',
        'Habilitá el permiso de Fotos/Galería en Configuración para seleccionar imágenes.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir configuración', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    // pedir
    const res = await requestLibPerm();
    return !!res.granted;
  }, [libPerm, requestLibPerm]);

  const ensureCameraPermission = useCallback(async () => {
    if (camPerm?.granted) return true;
    if (camPerm && camPerm.canAskAgain === false) {
      Alert.alert(
        'Permiso de cámara',
        'Habilitá el permiso de Cámara en Configuración.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir configuración', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    const res = await requestCamPerm();
    return !!res.granted;
  }, [camPerm, requestCamPerm]);

  const openAddFlow = useCallback(async () => {
    const ok = await ensureLibraryPermission();
    if (!ok) return;
    setPhotoName('');
    setAddressText('');
    setSelectedImages([]);
    setTempCoordinate(null);
    setAddModalVisible(true);
  }, [ensureLibraryPermission]);

  const pickImages = useCallback(async () => {
    try {
      const ok = await ensureLibraryPermission();
      if (!ok) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // SDK 49+ soporta múltiple
        quality: 0.9,
        selectionLimit: 10, // opcional
      });

      if (!result.canceled) {
        setSelectedImages(result.assets.map(a => ({ uri: a.uri, fileName: a.fileName })));
      }
    } catch (e) {
      console.warn('Error al seleccionar imágenes:', e);
    }
  }, [ensureLibraryPermission]);

  const takePhotoNow = useCallback(async () => {
    try {
      const ok = await ensureCameraPermission();
      if (!ok) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        cameraType: ImagePicker.CameraType.back,
      });
      if (!result.canceled) {
        setSelectedImages(prev => [...prev, ...result.assets.map(a => ({ uri: a.uri, fileName: a.fileName }))]);
      }
    } catch (e) {
      console.warn('Error al abrir cámara:', e);
    }
  }, [ensureCameraPermission]);

  const useCurrentLocation = useCallback(async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Ubicación no disponible', 'No se concedió el permiso de ubicación.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setTempCoordinate({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      console.warn('No se pudo obtener ubicación actual:', e);
    }
  }, []);

  const geocodeAddress = useCallback(async () => {
    if (!addressText.trim()) {
      Alert.alert('Dirección vacía', 'Ingresá una dirección para geocodificar.');
      return;
    }
    try {
      const results = await Location.geocodeAsync(addressText.trim());
      if (!results || results.length === 0) {
        Alert.alert('Sin resultados', 'No se pudo encontrar esa dirección.');
        return;
      }
      const { latitude, longitude } = results[0];
      setTempCoordinate({ latitude, longitude });
    } catch (e) {
      console.warn('Error geocodificando dirección:', e);
      Alert.alert('Error', 'No se pudo convertir la dirección en coordenadas.');
    }
  }, [addressText]);

  const startPickOnMap = useCallback(() => {
    Keyboard.dismiss();
    setAddModalVisible(false);     // oculto modal para poder tocar el mapa
    setSelectingLocation(true);    // mostrar banner y esperar un toque en el mapa
  }, []);

  // Capturar toque en el mapa cuando estamos en “selectingLocation”
  const handleMapPress = useCallback((e) => {
    if (!selectingLocation) return;
    const coord = e.nativeEvent.coordinate;
    setTempCoordinate(coord);
    setSelectingLocation(false);
    setAddModalVisible(true); // reabrimos el modal con la coord elegida
  }, [selectingLocation]);

  const saveFromAddFlow = useCallback(async () => {
    if (!photoName.trim()) {
      Alert.alert('Falta el nombre', 'Ingresá un nombre para las fotos.');
      return;
    }
    if (!selectedImages.length) {
      Alert.alert('Sin fotos', 'Seleccioná al menos una foto.');
      return;
    }

    setSaving(true);

    try {
      let finalCoord = tempCoordinate;

      // Si no hay coord seleccionada y hay dirección, intentamos geocodificar
      if (!finalCoord && addressText.trim()) {
        try {
          const results = await Location.geocodeAsync(addressText.trim());
          if (results?.length) {
            finalCoord = { latitude: results[0].latitude, longitude: results[0].longitude };
          }
        } catch (e) {
          console.warn('Geocode al guardar falló:', e);
        }
      }

      // Si sigue sin coord, probamos ubicación actual
      if (!finalCoord) {
        try {
          const perm = await Location.requestForegroundPermissionsAsync();
          if (perm.status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            finalCoord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          }
        } catch (e) {
          console.warn('Ubicación actual al guardar falló:', e);
        }
      }

      // Fallback final si no se obtuvo nada
      if (!finalCoord) {
        finalCoord = { latitude: FALLBACK_REGION.latitude, longitude: FALLBACK_REGION.longitude };
      }

      // Crear un marcador por cada foto seleccionada
      const baseTitle = photoName.trim();
      const newItems = selectedImages.map((img, idx) => ({
        id: Date.now() + idx,
        title: selectedImages.length > 1 ? `${baseTitle} (${idx + 1})` : baseTitle,
        coordinate: finalCoord,
        photoUri: img.uri,
      }));

      setMarkers(prev => [...prev, ...newItems]);
      setSavedPlaces(prev => [...prev, ...newItems]);

      // limpiar y cerrar
      setAddModalVisible(false);
      setPhotoName('');
      setAddressText('');
      setSelectedImages([]);
      setTempCoordinate(null);
    } finally {
      setSaving(false);
    }
  }, [photoName, selectedImages, tempCoordinate, addressText]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        onPress={handleMapPress}
      >
        {markers.map(m => (
          <Marker key={m.id} coordinate={m.coordinate} title={m.title}>
            {m.photoUri && (
              <Image
                source={{ uri: m.photoUri }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            )}
          </Marker>
        ))}

        {/* Pin temporal mientras el usuario elige coord */}
        {selectingLocation && tempCoordinate && (
          <Marker coordinate={tempCoordinate} title="Ubicación seleccionada" />
        )}
      </MapView>

      {/* Banner cuando está en modo seleccionar en el mapa */}
      {selectingLocation && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Tocá en el mapa para elegir la ubicación</Text>
        </View>
      )}

      {/* Botón abrir cámara */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CameraScreen')}
      >
        <Text style={styles.fabText}>📷</Text>
      </TouchableOpacity>

      {/* Botón ver lugares */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 100 }]}
        onPress={() => navigation.navigate('PlacesScreen', { places: savedPlaces })}
      >
        <Text style={styles.fabText}>📄</Text>
      </TouchableOpacity>

      {/* NUEVO: Botón “+” para agregar desde galería / cámara y elegir ubicación */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 160 }]}
        onPress={openAddFlow}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Modal de alta de lugares */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={{ maxHeight: '80%', width: '100%' }}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Agregar fotos al mapa</Text>

              <ScrollView
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
              >
                <View>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    value={photoName}
                    onChangeText={setPhotoName}
                    placeholder="Ej: Plaza Francia"
                    placeholderTextColor="#888"
                    style={styles.input}
                    returnKeyType="done"
                  />
                </View>

                <View>
                  <Text style={styles.label}>Ubicación</Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#4CAF50' }]} onPress={useCurrentLocation}>
                      <Text style={styles.btnText}>Usar ubicación actual</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.row}>
                    <TextInput
                      value={addressText}
                      onChangeText={setAddressText}
                      placeholder="Dirección (opcional)"
                      placeholderTextColor="#888"
                      style={[styles.input, { flex: 1 }]}
                      returnKeyType="search"
                      onSubmitEditing={geocodeAddress}
                    />
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#2196F3', marginLeft: 8 }]} onPress={geocodeAddress}>
                      <Text style={styles.btnText}>Buscar</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF9800' }]} onPress={startPickOnMap}>
                      <Text style={styles.btnText}>Elegir en el mapa</Text>
                    </TouchableOpacity>
                  </View>

                  {tempCoordinate && (
                    <Text style={styles.coordsText}>
                      Seleccionado: {tempCoordinate.latitude.toFixed(6)} , {tempCoordinate.longitude.toFixed(6)}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={styles.label}>Fotos</Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#9C27B0', flex: 1 }]} onPress={pickImages}>
                      <Text style={styles.btnText}>Seleccionar de galería</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#673AB7', flex: 1, marginLeft: 8 }]} onPress={takePhotoNow}>
                      <Text style={styles.btnText}>Tomar foto ahora</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView horizontal contentContainerStyle={{ gap: 8, marginTop: 8 }}>
                    {selectedImages.map((img, idx) => (
                      <Image key={idx} source={{ uri: img.uri }} style={styles.thumb} />
                    ))}
                  </ScrollView>
                  {selectedImages.length === 0 && (
                    <Text style={{ color: '#666', marginTop: 6 }}>No hay imágenes seleccionadas.</Text>
                  )}
                </View>

                <View style={[styles.row, { justifyContent: 'flex-end', marginTop: 8 }]}>
                  <TouchableOpacity style={[styles.btn, { backgroundColor: '#9E9E9E' }]} onPress={() => setAddModalVisible(false)}>
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: saving ? '#A5D6A7' : '#4CAF50', marginLeft: 8 }]}
                    onPress={saveFromAddFlow}
                    disabled={saving}
                  >
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eee' },
  map: { flex: 1 },

  // FABs
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    elevation: 3,
  },
  fabText: { color: '#fff', fontSize: 22, fontWeight: '900' },

  // Banner selección
  banner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 10,
    zIndex: 4,
  },
  bannerText: { color: '#fff', textAlign: 'center', fontWeight: '600' },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  coordsText: { marginTop: 6, color: '#333' },

  thumb: { width: 64, height: 64, borderRadius: 8 },
});
