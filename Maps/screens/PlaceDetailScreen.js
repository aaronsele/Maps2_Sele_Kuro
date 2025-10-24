import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function PlacesDetailScreen() {
  const route = useRoute();
  const { place } = route.params;

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
        {place.photoUri ? (
          <Image
            source={{ uri: place.photoUri }}
            style={[styles.image, { width: screenWidth - 32, height: (screenWidth - 32) * 0.75 }]}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: '#777' }}>No hay foto</Text>
          </View>
        )}
        <Text style={styles.name}>{place.title}</Text>
        {place.coordinate && (
          <Text style={styles.coords}>
            Lat: {place.coordinate.latitude.toFixed(6)} | Lng: {place.coordinate.longitude.toFixed(6)}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  name: { fontSize: 20, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  coords: { fontSize: 14, color: '#555', textAlign: 'center' },
});
