import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";

export default function CameraScreen() {
  const navigation = useNavigation();

  // Permisos de cámara (hook nativo de expo-camera)
  const [camPermission, requestCamPermission] = useCameraPermissions();

  // Estado de cámara
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState("back"); // "back" | "front"
  const [torchOn, setTorchOn] = useState(false); // linterna continua
  const [photoUri, setPhotoUri] = useState(null);

  // Pedir permisos de cámara + ubicación al entrar
  useEffect(() => {
    (async () => {
      // Cámara
      if (!camPermission?.granted) {
        await requestCamPermission();
      }
      // Ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // seguimos, pero sin guardar ubicación
      }
    })();
  }, []);

  // Estados intermedios de permisos
  if (!camPermission) {
    return (
      <View style={styles.center}>
        <Text>Solicitando permisos...</Text>
      </View>
    );
  }
  if (!camPermission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: "center", marginBottom: 12 }}>
          La app necesita permiso para usar la cámara.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestCamPermission}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFacing = () => setFacing((prev) => (prev === "back" ? "front" : "back"));
  const toggleTorch = () => setTorchOn((t) => !t);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const pic = await cameraRef.current.takePictureAsync({
      quality: 0.9,
      skipProcessing: true,
    });
    setPhotoUri(pic?.uri ?? null);
  };

  const discardPhoto = () => setPhotoUri(null);

  const savePhoto = async () => {
    try {
      // Obtener ubicación actual (si el usuario lo permitió)
      let coords = null;
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
  
      // Armar nuevo marcador para el mapa
      const newMarker = {
        id: Date.now(),
        title: "Foto guardada",
        coordinate: coords ?? { latitude: -34.6037, longitude: -58.3816 }, // fallback si no hay permisos
        photoUri: photoUri,
      };
  
      // Navegar al mapa pasando el marcador
      navigation.navigate("MapScreen", { newMarker });
  
      // Limpiar estado local
      setPhotoUri(null);
    } catch (e) {
      console.warn("No se pudo guardar la foto:", e);
    }
  };

  return (
    <View style={styles.container}>
      {!photoUri ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}           // "back" | "front"
            enableTorch={torchOn}     // linterna continua
          />

          {/* Controles superpuestos */}
          <View style={styles.controlsBar}>
            <TouchableOpacity style={styles.smallBtn} onPress={toggleFacing}>
              <Text style={styles.smallBtnText}>↺ Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterBtn} onPress={takePhoto}>
              <Text style={styles.shutterText}>●</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallBtn} onPress={toggleTorch}>
              <Text style={styles.smallBtnText}>{torchOn ? "Linterna: ON" : "Linterna: OFF"}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.preview}>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />

          <View style={styles.previewButtons}>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#f44336" }]} onPress={discardPhoto}>
              <Text style={styles.buttonText}>Descartar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: "#4CAF50" }]} onPress={savePhoto}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  camera: { flex: 1 },
  controlsBar: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  smallBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  smallBtnText: { color: "#fff", fontWeight: "600" },
  shutterBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  shutterText: { color: "#fff", fontSize: 28, fontWeight: "900" },
  preview: { flex: 1, backgroundColor: "#000" },
  photo: { flex: 1, width: "100%", height: "100%" },
  previewButtons: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
