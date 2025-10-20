import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';

const fallbackLugares = [
  { id: 1, title: 'Kiosco', coordinate: { latitude: -34.6096, longitude: -58.4303 } },
  { id: 2, title: 'Casa de Torcha', coordinate: { latitude: -34.5909, longitude: -58.4172 } },
];

export default function PlacesScreen() {
  const route = useRoute();
  const places = route.params?.places ?? fallbackLugares;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares Guardados</Text>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const lat = item.coordinate?.latitude?.toFixed(6);
          const lng = item.coordinate?.longitude?.toFixed(6);
          return (
            <View style={styles.item}>
              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={{ color: '#777', fontSize: 12 }}>Sin foto</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.coords}>
                  {lat && lng ? `Lat: ${lat}  |  Lng: ${lng}` : 'Coordenadas no disponibles'}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>
            Aún no hay lugares guardados.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f6f6f6',
    marginBottom: 10,
    borderRadius: 12,
  },
  thumb: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  thumbPlaceholder: { backgroundColor: '#e9e9e9', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  coords: { fontSize: 12, color: '#555', marginTop: 4 },
});
