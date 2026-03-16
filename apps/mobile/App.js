import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';

function App() {
  console.log('App is mounting...');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🍕 QUERO UM PEDADINHO</Text>
      <Text style={styles.subtext}>App Preview Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E74011',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtext: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
    opacity: 0.8,
  },
});

registerRootComponent(App);
