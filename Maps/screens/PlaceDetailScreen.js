import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function PlaceDetailScreen({ route }) {
  const { place } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{place.title}</Text>
      <Text style={styles.coords}>
        Lat: {place.coordinate.latitude.toFixed(4)}, Lng: {place.coordinate.longitude.toFixed(4)}
      </Text>
      {place.photo && (
        <Image source={{ uri: place.photo }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  coords: { fontSize: 16, marginBottom: 20 },
  image: { width: '100%', height: 300, borderRadius: 10 },
});
