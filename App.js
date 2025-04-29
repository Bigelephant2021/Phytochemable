import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import { ocrSpace } from "ocr-space-api-wrapper";

const Camera = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode] = useState<CameraMode>("picture");
  const [facing] = useState<CameraType>("back");

  if (!permission) {
    return null; // Permissions are still loading
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    try {
      const photo = await ref.current?.takePictureAsync();
      setUri(photo?.uri);
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  const next = async () => {
    try {
      // Capture the image
      const photo = await ref.current?.takePictureAsync();
      if (!photo?.uri) {
        throw new Error("Failed to capture image");
      }

      // Convert the image to Base64
      const base64Data = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Perform OCR and retrieve the parsed text
      const ocrResponse = await ocrSpace(`data:image/png;base64,${base64Data}`, {
        apiKey: "K86277899888957", // Replace with your actual API key
        language: "AUTO", // Adjust language as needed
        scale: true, // Fix capitalization for proper syntax
        OCREngine: 2, // Use OCR Engine 2 for processing
      });

      const ocrText = ocrResponse?.ParsedResults?.[0]?.ParsedText || "No text found";

      // Return the final OCR text
      return ocrText;
    } catch (error) {
      console.error("Error in next function:", error);
      throw error; // Re-throw the error for the caller to handle
    }
  };

  const processing = async () => {
    try {
      const text = await next();
      console.log("Processed OCR Text:", text);
    } catch (error) {
      console.error("Error in processing function:", error);
    }
  };

  const renderPicture = () => (
    <View>
      <Image
        source={{ uri }}
        contentFit="contain"
        style={{ width: 300, aspectRatio: 1 }}
      />
      <Button onPress={() => setUri(null)} title="Retake Picture" />
      <Button onPress={processing} title="Next" />
    </View>
  );

  const renderCamera = () => (
    <CameraView
      style={styles.camera}
      ref={ref}
      mode={mode}
      facing={facing}
      responsiveOrientationWhenOrientationLocked
    >
      <View style={styles.shutterContainer}>
        <Pressable onPress={takePicture}>
          {({ pressed }) => (
            <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}>
              <View
                style={[
                  styles.shutterBtnInner,
                  { backgroundColor: mode === "picture" ? "white" : "red" },
                ]}
              />
            </View>
          )}
        </Pressable>
      </View>
    </CameraView>
  );

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
};

export default function App() {
  return <card><Camera /> <Text>
  Take a photo of your food nutrition label. The image shall be straight(not slanted) and should contain the ingredients list.
  </Text>
  <Text>Made by Elestudios software division.</Text>
  <NativeAds /></card>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Consistent dark background
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: 10,
    color: "#fff", // White text for contrast
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});
