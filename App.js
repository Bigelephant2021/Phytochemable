import React from 'react';
import { SafeAreaView, Text, StyleSheet, Button, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera'; // Import react-native-camera
import { Card } from 'react-native-paper';

export default function App() {
  let camera;

  const capturePhoto = async () => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      try {
        const data = await camera.takePictureAsync(options);
        Alert.alert('Photo captured!', `Saved at: ${data.uri}`);
      } catch (error) {
        Alert.alert('Error capturing photo', error.message);
      }
    } else {
      Alert.alert('Camera not ready, try again');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.paragraph}>
        Phytochemable, the app for finding phytochemicals.
      </Text>
      <Card>
        <RNCamera
          ref={(ref) => {
            camera = ref;
          }}
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
        />
        <Button
          title="Capture Label"
          onPress={capturePhoto} // Link the button to the capturePhoto function
        />
        <text>Take a photo of your food nutrition label. The image shall be straight(not slanted) and should contain the ingredients list.</text>
        <text>Made by Elestudios software division.</text>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '50%',
  },
});
