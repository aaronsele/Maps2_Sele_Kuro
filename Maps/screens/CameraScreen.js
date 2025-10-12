import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Camera from 'expo-camera';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);

  // Función para pedir permisos
  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  // Cada vez que entramos a la pantalla, pedimos permiso
  useEffect(() => {
    setHasPermission(null); // Resetear estado
    requestPermissions();
  }, []);

  if (hasPermission === null)
    return (
      <View style={styles.center}>
        <Text>Solicitando permisos...</Text>
      </View>
    );

  if (hasPermission === false)
    return (
      <View style={styles.center}>
        <Text>Permiso denegado</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Volver a pedir permiso</Text>
        </TouchableOpacity>
      </View>
    );

  // Tomar foto
  const takePhoto = async () => {
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync();
      setPhoto(pic.uri);
    }
  };

  return (
    <View style={styles.container}>
      {!photo ? (
        <Camera.Camera style={styles.camera} ref={cameraRef}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Tomar Foto</Text>
          </TouchableOpacity>
        </Camera.Camera>
      ) : (
        <View style={styles.container}>
          <Image source={{ uri: photo }} style={styles.photo} />
          <TouchableOpacity style={styles.button} onPress={() => setPhoto(null)}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  photo: { flex: 1, width: '100%' },
});
