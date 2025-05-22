import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const manager = new BleManager();

export default function BluetoothScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        // Bluetooth ist eingeschaltet
      }
    }, true);

    return () => {
      subscription.remove();
    };
  }, []);

  const startScan = () => {
    setDevices([]);
    setIsScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        setIsScanning(false);
        return;
      }

      if (device) {
        setDevices((prevDevices) => {
          // Prüfe, ob das Gerät bereits in der Liste ist
          const deviceExists = prevDevices.some((d) => d.id === device.id);
          if (!deviceExists) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    // Stoppe den Scan nach 5 Sekunden
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 5000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      const connectedDevice = await device.connect();
      Alert.alert('Verbunden', `Erfolgreich verbunden mit ${device.name || device.id}`);
      // Hier können wir später die Daten von der Waage auslesen
    } catch (error) {
      console.error(error);
      Alert.alert('Fehler', 'Verbindung fehlgeschlagen');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Bluetooth Waage' }} />
      <TouchableOpacity
        style={[styles.button, isScanning && styles.buttonDisabled]}
        onPress={startScan}
        disabled={isScanning}
      >
        <Text style={styles.buttonText}>
          {isScanning ? 'Suche läuft...' : 'Nach Geräten suchen'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.deviceList}>
        {devices.map((device) => (
          <TouchableOpacity
            key={device.id}
            style={styles.deviceItem}
            onPress={() => connectToDevice(device)}
          >
            <Text style={styles.deviceName}>{device.name || 'Unbekanntes Gerät'}</Text>
            <Text style={styles.deviceId}>ID: {device.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
}); 