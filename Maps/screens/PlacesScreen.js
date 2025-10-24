import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';

const fallbackLugares = [
  { id: 1, title: 'Kiosco', coordinate: { latitude: -34.6096, longitude: -58.4303 } },
  { id: 2, title: 'Casa de Torcha', coordinate: { latitude: -34.5909, longitude: -58.4172 } },
];

export default function PlacesScreen() {
  const route = useRoute();
  const places = route.params?.places ?? fallbackLugares;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Lugares Guardados</Text>
      </View>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, paddingTop: 8 }}
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
          <Text style={{ textAlign: 'center', color: '#777', marginTop: 20, fontSize: 16 }}>
            Aún no hay lugares guardados.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  thumb: { width: 64, height: 64, borderRadius: 10, marginRight: 14 },
  thumbPlaceholder: {
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  coords: { fontSize: 12, color: '#555' },
});
