import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const lugares = [
  { id: '1', nombre: 'Kiosco', direccion: 'Río de Janeiro y Mitre' },
  { id: '2', nombre: 'Casa de Torcha', direccion: 'Jerónimo Salguero 1647' },
];

export default function PlacesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares Guardados</Text>
      <FlatList
        data={lugares}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.nombre}</Text>
            <Text style={styles.address}>{item.direccion}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  item: { padding: 15, backgroundColor: '#f2f2f2', marginBottom: 10, borderRadius: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  address: { fontSize: 14, color: '#555' },
});
