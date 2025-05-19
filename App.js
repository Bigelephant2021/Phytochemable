import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View, FlatList } from "react-native";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import { ocrSpace } from "ocr-space-api-wrapper";
import { Card, Title, Paragraph } from "react-native-paper";
import NativeAds from "./Ads";
import phytochemicalData from "./phytochemicalData.json";

const { benefits, phytochemicals, validIngredients, artificialIngredients, phytochemicalAdditives, processedToPlantMap } = phytochemicalData;

/**
 * Parses a string of ingredients and classifies them into natural plant ingredients, plant ingredients from processed items, phytochemical additives, and artificial ingredients.
 * @param {string} input - The input string of ingredients (e.g., "Beef, p0rkk, patotoes, ketchap, curcummin, aspartam").
 * @param {string[]} validIngredients - List of valid plant-based ingredients.
 * @param {string[]} exclusionList - List of ingredients to exclude (e.g., non-plants).
 * @param {string[]} artificialIngredients - List of artificial ingredients.
 * @param {string[]} phytochemicalAdditives - List of phytochemical additives.
 * @param {Object} processedToPlantMap - Mapping of processed ingredients to plant-based ingredients.
 * @returns {Object} - Object with four keys: natural, processedPlants, additives, artificial.
 */
function parseIngredientsAndGetPhytochemicals(input, validIngredients, exclusionList, artificialIngredients, phytochemicalAdditives, processedToPlantMap) {
  // Step 1: Parse ingredients
  const rawIngredients = input
    .split(/[,;\n]+|\s{2,}/)
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);

  // Function to find the best match for a potentially misspelled ingredient
  const findBestMatch = (inputItem, referenceList, maxDistance) => {
    let bestMatch = null;
    let bestScore = Infinity;

    for (const refItem of referenceList) {
      const score = levenshteinDistance(inputItem, refItem.toLowerCase());
      if (score < bestScore && score <= maxDistance) {
        bestScore = score;
        bestMatch = refItem;
      }
    }

    return bestMatch;
  };

  // Function to check if an ingredient is in the exclusion list (with fuzzy matching)
  const isExcluded = (inputItem) => {
    for (const excluded of exclusionList) {
      const score = levenshteinDistance(inputItem, excluded.toLowerCase());
      if (score <= Math.min(2, inputItem.length / 3)) {
        return true;
      }
    }
    return false;
  };

  // Parse and classify ingredients
  const natural = {};
  const processedPlants = {};
  const additives = {};
  const artificial = [];

  rawIngredients.forEach(item => {
    if (isExcluded(item)) return;

    // Check for artificial ingredients (tighter matching)
    const artificialMatch = findBestMatch(item, artificialIngredients, Math.min(2, item.length / 3));
    if (artificialMatch) {
      artificial.push(artificialMatch);
      return;
    }

    // Check for phytochemical additives (tighter matching)
    const additiveMatch = findBestMatch(item, phytochemicalAdditives, Math.min(2, item.length / 3));
    if (additiveMatch) {
      additives[additiveMatch] = [{
        phytochemical: additiveMatch,
        benefits: benefits[additiveMatch] || "General antioxidant or anti-inflammatory properties"
      }];
      return;
    }

    // Check for processed ingredients (tighter matching)
    const processedKeys = Object.keys(processedToPlantMap);
    const processedMatch = findBestMatch(item, processedKeys, Math.min(2, item.length / 3));
    if (processedMatch) {
      const plantIngredients = processedToPlantMap[processedMatch];
      plantIngredients.forEach(plant => {
        const lowerPlant = plant.toLowerCase();
        if (validIngredients.includes(plant)) {
          processedPlants[plant] = (phytochemicals[lowerPlant] || []).map(phyto => ({
            phytochemical: phyto,
            benefits: benefits[phyto] || "General antioxidant or anti-inflammatory properties",
            source: processedMatch
          }));
        }
      });
      return;
    }

    // Check for natural plant ingredients (looser matching)
    const naturalMatch = findBestMatch(item, validIngredients, Math.min(3, item.length / 2));
    if (naturalMatch) {
      const lowerMatch = naturalMatch.toLowerCase();
      natural[naturalMatch] = (phytochemicals[lowerMatch] || []).map(phyto => ({
        phytochemical: phyto,
        benefits: benefits[phyto] || "General antioxidant or anti-inflammatory properties"
      }));
    }
  });

  return {
    natural: natural,
    processedPlants: processedPlants,
    additives: additives,
    artificial: [...new Set(artificial)] // Remove duplicates
  };
}

/**
 * Computes the Levenshtein distance between two strings.
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @returns {number} - The Levenshtein distance.
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Exclusion list for non-plant or unwanted ingredients
const exclusionList = [
  "beef",
  "pork",
  "chicken",
  "turkey",
  "lamb",
  "goat",
  "duck",
  "fish",
  "salmon",
  "tuna",
  "cod",
  "shrimp",
  "crab",
  "lobster",
  "clams",
  "mussels",
  "oysters",
  "scallops",
  "egg",
  "eggs",
  "milk",
  "cheese",
  "yogurt",
  "butter",
  "cream",
  "sour cream",
  "ice cream",
  "honey",
  "gelatin",
  "lard",
  "suet",
  "bacon",
  "sausage",
  "ham",
  "sweeteners",
  "syrup"
];

const Camera = ({ onResults }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef(null);
  const [uri, setUri] = useState(null);
  const [mode] = useState("picture");
  const [facing] = useState("back");

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
        apiKey: "K86277899888957",
        language: "AUTO",
        scale: true,
        OCREngine: 2,
      });

      const ocrText = ocrResponse?.ParsedResults?.[0]?.ParsedText || "No text found";
      const result = parseIngredientsAndGetPhytochemicals(ocrText, validIngredients, exclusionList, artificialIngredients, phytochemicalAdditives, processedToPlantMap);
      onResults(result); // Pass results to parent
    } catch (error) {
      console.error("Error in next function:", error);
      throw error;
    }
  };

  const processing = async () => {
    await next();
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

const ResultsScreen = ({ results, onBack }) => {
  const { natural, processedPlants, additives, artificial } = results;

  const renderPlantItem = ({ item }) => {
    const ingredient = item[0];
    const phytochemicals = item[1];

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.ingredient}>
            {ingredient}{phytochemicals[0]?.source ? ` (from ${phytochemicals[0].source})` : ""}
          </Title>
          {phytochemicals.length > 0 ? (
            phytochemicals.map((phyto, index) => (
              <View key={index} style={styles.phytoContainer}>
                <Paragraph style={styles.phyto}>
                  • {phyto.phytochemical}: {phyto.benefits}
                </Paragraph>
              </View>
            ))
          ) : (
            <Paragraph style={styles.noPhyto}>No phytochemicals found</Paragraph>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderArtificialItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.ingredient}>{item}</Title>
        <Paragraph style={styles.noPhyto}>No phytochemicals (artificial ingredient)</Paragraph>
      </Card.Content>
    </Card>
  );

  const renderAdditiveItem = ({ item }) => {
    const additive = item[0];
    const phytochemical = item[1][0]; // Single phytochemical

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.ingredient}>{additive}</Title>
          <View style={styles.phytoContainer}>
            <Paragraph style={styles.phyto}>
              • {phytochemical.phytochemical}: {phytochemical.benefits}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.resultsContainer}>
      <Title style={styles.resultsHeader}>Results</Title>

      {/* Natural Plant Ingredients */}
      {Object.keys(natural).length > 0 && (
        <>
          <Title style={styles.sectionHeader}>Natural Plant Ingredients</Title>
          <FlatList
            data={Object.entries(natural)}
            renderItem={renderPlantItem}
            keyExtractor={(item) => `natural-${item[0]}`}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {/* Plant Ingredients in Processed Items */}
      {Object.keys(processedPlants).length > 0 && (
        <>
          <Title style={styles.sectionHeader}>Plant Ingredients in Processed Items</Title>
          <FlatList
            data={Object.entries(processedPlants)}
            renderItem={renderPlantItem}
            keyExtractor={(item) => `processed-${item[0]}`}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {/* Phytochemical Additives */}
      {Object.keys(additives).length > 0 && (
        <>
          <Title style={styles.sectionHeader}>Phytochemical Additives</Title>
          <FlatList
            data={Object.entries(additives)}
            renderItem={renderAdditiveItem}
            keyExtractor={(item) => `additive-${item[0]}`}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {/* Artificial Ingredients */}
      {artificial.length > 0 && (
        <>
          <Title style={styles.sectionHeader}>Artificial Ingredients</Title>
          <FlatList
            data={artificial}
            renderItem={renderArtificialItem}
            keyExtractor={(item) => `artificial-${item}`}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {/* No Results */}
      {Object.keys(natural).length === 0 && Object.keys(processedPlants).length === 0 && Object.keys(additives).length === 0 && artificial.length === 0 && (
        <Paragraph style={styles.noPhyto}>No ingredients detected</Paragraph>
      )}

      <Button onPress={onBack} title="Back to Camera" />
    </View>
  );
};

export default function App() {
  const [results, setResults] = useState(null);

  const handleResults = (result) => {
    setResults(result);
  };

  const handleBack = () => {
    setResults(null);
  };

  return (
    <View style={styles.appContainer}>
      {results ? (
        <ResultsScreen results={results} onBack={handleBack} />
      ) : (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Camera onResults={handleResults} />
              <Text style={styles.instruction}>
                Take a photo of your food nutrition label. The image shall be straight (not slanted) and should contain the ingredients list.
              </Text>
              <Text style={styles.footer}>Made by Elestudios software division.</Text>
            </Card.Content>
          </Card>
          <NativeAds />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  resultsHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  card: {
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  ingredient: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  phytoContainer: {
    marginVertical: 4,
  },
  phyto: {
    fontSize: 14,
    color: "#555",
  },
  noPhyto: {
    fontSize: 14,
    color: "#777",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
  },
  list: {
    paddingBottom: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 10,
    color: "#fff",
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
  instruction: {
    fontSize: 16,
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  footer: {
    fontSize: 12,
    color: "#777",
    marginTop: 8,
    textAlign: "center",
  },
});