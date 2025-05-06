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

  /**
 * Parses a string of ingredients into plant-based ingredients and maps them to their phytochemicals and benefits.
 * @param {string} input - The input string of ingredients (e.g., "Beef, p0rkk, patotoes, carot, swe/eners").
 * @param {string[]} referenceList - The reference list of valid plant-based ingredients.
 * @param {string[]} exclusionList - The list of ingredients to exclude (e.g., non-plants).
 * @returns {Object} - Object mapping cleaned ingredients to their phytochemicals and benefits.
 */
function parseIngredientsAndGetPhytochemicals(input, referenceList, exclusionList) {
  // Step 1: Parse ingredients
  const rawIngredients = input
    .split(/[,;\n]+|\s{2,}/)
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);

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

  // Function to find the best match for a potentially misspelled ingredient
  const findBestMatch = (inputItem) => {
    let bestMatch = null;
    let bestScore = Infinity;

    for (const refItem of referenceList) {
      const score = levenshteinDistance(inputItem, refItem.toLowerCase());
      if (score < bestScore && score <= Math.min(3, inputItem.length / 2)) {
        bestScore = score;
        bestMatch = refItem;
      }
    }

    return bestMatch;
  };

  // Parse and filter ingredients
  const matchedIngredients = rawIngredients
    .filter(item => !isExcluded(item))
    .map(findBestMatch)
    .filter(item => item !== null);

  // Remove duplicates
  const cleanedIngredients = [...new Set(matchedIngredients)];

  // Step 2: Map to phytochemicals and benefits
  const phytochemicals = {
    "carrots": ["α-Carotene", "β-Carotene", "Lycopene", "Lutein"],
    "pumpkins": ["α-Carotene", "β-Carotene", "Zeaxanthin", "Lutein"],
    "maize": ["Saponins", "Zeaxanthin", "Limonene", "Phytosterols"],
    "tangerine": ["α-Carotene", "β-Cryptoxanthin", "Tangeritin"],
    "orange": ["α-Carotene", "Phytofluene", "Phytoene", "β-Cryptoxanthin", "Zeaxanthin", "Lutein", "Rutin", "Hesperidin", "Naringenin", "Eriodictyol", "Tangeritin", "Oxalic acid", "Coumarin"],
    "dark leafy greens": ["β-Carotene"],
    "red fruits": ["β-Carotene"],
    "yellow fruits": ["β-Carotene"],
    "Vietnamese Gac": ["Lycopene"],
    "tomatoes": ["Lycopene", "Neurosporene", "Rutin", "Kaempferol"],
    "grapefruit": ["Lycopene", "Neurosporene", "β-Cryptoxanthin", "Kaempferol", "Rutin"],
    "watermelon": ["Lycopene", "Neurosporene"],
    "guava": ["Lycopene", "Ellagic acid"],
    "apricots": ["Lycopene", "Rutin"],
    "autumn olive": ["Lycopene"],
    "star fruit": ["Phytofluene"],
    "sweet potato": ["Phytofluene", "Phytoene", "Lutein", "Oxalic acid"],
    "paprika": ["Canthaxanthin"],
    "mushrooms": ["Chitin"],
    "mango": ["β-Cryptoxanthin", "Lutein", "Gallic acid"],
    "papaya": ["β-Cryptoxanthin", "Lutein"],
    "peaches": ["β-Cryptoxanthin", "Lutein", "Rutin", "Peonidin", "Cyanidin"],
    "avocado": ["β-Cryptoxanthin", "Lutein", "beta Sitosterol", "Tartaric acid"],
    "pea": ["β-Cryptoxanthin"],
    "kiwi": ["β-Cryptoxanthin", "Lutein"],
    "wolfberry": ["Zeaxanthin"],
    "spinach": ["Zeaxanthin", "Lutein", "Kaempferol", "Oxalic acid", "Chlorophyllin"],
    "kale": ["Zeaxanthin", "Kaempferol", "Indole-3-carbinol", "3,3'-Diindolylmethane"],
    "turnip greens": ["Zeaxanthin", "Lutein"],
    "red pepper": ["Zeaxanthin", "Lutein"],
    "squash": ["Lutein"],
    "brassicas": ["Lutein", "Kaempferol", "Glucoraphanin", "Sulforaphane"],
    "prunes": ["Lutein", "Ursolic acid"],
    "honeydew melon": ["Lutein"],
    "rhubarb": ["Lutein", "Rutin", "Gallic acid", "Oxalic acid"],
    "plum": ["Lutein", "Cyanidin"],
    "pear": ["Lutein", "Caffeic acid", "Cyanidin"],
    "cilantro": ["Lutein"],
    "microalgae": ["Astaxanthin"],
    "yeast": ["Astaxanthin"],
    "rose hip": ["Rubixanthin"],
    "soybeans": ["Saponins", "Phytosterols", "beta Sitosterol", "Daidzein", "Genistein", "Glycitein", "Phytic acid"],
    "beans": ["Saponins", "Quercetin"],
    "legumes": ["Saponins", "Daidzein", "Genistein"],
    "alfalfa": ["Saponins"],
    "American pokeweed": ["Oleanolic acid"],
    "honey mesquite": ["Oleanolic acid"],
    "garlic": ["Oleanolic acid", "Limonene", "Polysulfides", "Diallyl disulfide", "Alliin"],
    "java apple": ["Oleanolic acid"],
    "cloves": ["Oleanolic acid"],
    "Syzygium species": ["Oleanolic acid", "Betulinic acid"],
    "apples": ["Ursolic acid", "Quercetin", "Kaempferol", "Rutin", "Cyanidin", "Malic acid"],
    "basil": ["Ursolic acid", "beta Sitosterol", "Limonene", "Caffeic acid"],
    "bilberries": ["Ursolic acid", "Pelargonidin", "Peonidin", "Cyanidin", "Delphinidin", "Malvidin"],
    "cranberries": ["Ursolic acid", "Quercetin", "Kaempferol", "Peonidin", "Cyanidin", "Secoisolariciresinol", "Ellagic acid"],
    "elder flower": ["Ursolic acid"],
    "peppermint": ["Ursolic acid", "Salicylic acid"],
    "lavender": ["Ursolic acid"],
    "oregano": ["Ursolic acid", "Carvacrol", "Caffeic acid"],
    "thyme": ["Ursolic acid", "Carvacrol", "Caffeic acid"],
    "hawthorn": ["Ursolic acid", "beta Sitosterol", "Caffeic acid", "Cyanidin"],
    "Ber tree": ["Betulinic acid"],
    "white birch": ["Betulinic acid"],
    "winged beans": ["Betulinic acid"],
    "Triphyophyllum peltatum": ["Betulinic acid"],
    "Ancistrocladus heyneanus": ["Betulinic acid"],
    "Diospyros leucomelas": ["Betulinic acid"],
    "Tetracera boiviniana": ["Betulinic acid"],
    "jambul": ["Betulinic acid"],
    "chaga": ["Betulinic acid"],
    "Rhus javanica": ["Moronic acid"],
    "mistletoe": ["Moronic acid"],
    "Coffea arabica": ["Cafestol"],
    "citrus": ["Limonene", "Perillyl alcohol", "Rutin", "Hesperidin", "Naringenin", "Eriodictyol", "Coumarin"],
    "cherries": ["Limonene", "Peonidin", "Cyanidin"],
    "spearmint": ["Limonene"],
    "dill": ["Limonene", "Dillapiole"],
    "celery": ["Limonene", "Apiole", "Luteolin"],
    "rosemary": ["Limonene", "Carnosol"],
    "ginger": ["Limonene", "Gingerol", "Oxalic acid"],
    "hops": ["Perillyl alcohol"],
    "caraway": ["Perillyl alcohol"],
    "mints": ["Perillyl alcohol", "Luteolin"],
    "Thyme": ["Thujones"],
    "Sage": ["Thujones"],
    "Mugwort": ["Thujones"],
    "Juniper": ["Thujones"],
    "almonds": ["Phytosterols", "Phytic acid"],
    "cashews": ["Phytosterols", "Anacardic acid"],
    "peanuts": ["Phytosterols", "beta Sitosterol", "Daidzein", "Genistein", "Resveratrol", "Salicylic acid", "Ferulic acid"],
    "sesame seeds": ["Phytosterols", "Matairesinol", "Secoisolariciresinol", "Phytic acid"],
    "sunflower seeds": ["Phytosterols", "Secoisolariciresinol", "Phytic acid"],
    "whole wheat": ["Phytosterols", "Alkylresorcinols", "Phytic acid"],
    "vegetable oils": ["Phytosterols"],
    "buckwheat": ["Campesterol", "beta Sitosterol", "Stigmasterol", "Quercetin", "Rutin"],
    "rice bran": ["beta Sitosterol"],
    "wheat germ": ["beta Sitosterol"],
    "corn oils": ["beta Sitosterol"],
    "fennel": ["beta Sitosterol", "Dillapiole"],
    "parsley": ["Apiole", "Rutin", "Apigenin", "Luteolin"],
    "celery leaf": ["Apiole"],
    "sage": ["Carnosol"],
    "pepperwort": ["Carvacrol"],
    "wild bergamot": ["Carvacrol"],
    "fennel root": ["Dillapiole"],
    "red onions": ["Quercetin"],
    "yellow onions": ["Quercetin"],
    "tea": ["Quercetin", "Kaempferol", "Catechins", "(-)-Epigallocatechin gallate", "Theaflavin", "Theaflavin-3-gallate", "Thearubigins", "Rutin", "Punicalagins", "Gallic acid", "Oxalic acid"],
    "wine": ["Quercetin", "Myricetin", "Catechins", "Resveratrol"],
    "lovage": ["Quercetin"],
    "strawberries": ["Kaempferol", "Fisetin", "Matairesinol", "Secoisolariciresinol", "Gallic acid", "Ellagic acid", "Pelargonidin"],
    "gooseberries": ["Kaempferol"],
    "peas": ["Kaempferol", "Coumestrol"],
    "broccoli": ["Kaempferol", "Matairesinol", "Glucoraphanin", "Sulforaphane", "Indole-3-carbinol", "3,3'-Diindolylmethane"],
    "brussels sprouts": ["Kaempferol", "Coumestrol", "Glucoraphanin", "Sulforaphane", "Sinigrin", "Indole-3-carbinol", "3,3'-Diindolylmethane"],
    "cabbage": ["Kaempferol", "Glucoraphanin", "Sulforaphane", "Indole-3-carbinol", "3,3'-Diindolylmethane"],
    "chives": ["Kaempferol", "Polysulfides"],
    "endive": ["Kaempferol"],
    "leek": ["Kaempferol", "Polysulfides"],
    "grapes": ["Myricetin", "Resveratrol", "Pterostilbene", "Catechins", "Proanthocyanidins", "Ellagic acid", "Caftaric acid", "Coutaric acid", "Fertaric acid"],
    "berries": ["Myricetin", "Lignans", "Punicalagins"],
    "walnuts": ["Myricetin", "Ellagic acid"],
    "cucumbers": ["Fisetin"],
    "lemons": ["Rutin"],
    "limes": ["Rutin"],
    "pagoda tree fruits": ["Rutin"],
    "asparagus": ["Rutin"],
    "red turnip": ["Isorhamnetin"],
    "goldenrod": ["Isorhamnetin"],
    "mustard leaf": ["Isorhamnetin"],
    "ginkgo biloba": ["Isorhamnetin"],
    "onion": ["Isorhamnetin", "Polysulfides", "Syn-propanethial-S-oxide"],
    "milk thistle": ["Silybin", "Silymarin"],
    "Robinia pseudoacacia": ["Acacetin"],
    "Tumera diffusa": ["Acacetin"],
    "chamomile": ["Apigenin", "Luteolin"],
    "Passiflora caerulea": ["Chrysin"],
    "Pleurotus ostreatus": ["Chrysin"],
    "Oroxylum indicum": ["Chrysin"],
    "Vicia": ["Diosmetin"],
    "beets": ["Luteolin", "Betacyanins", "Indicaxanthin", "Vulgaxanthin", "Betanin"],
    "artichokes": ["Luteolin", "Silymarin", "Caffeic acid", "Ferulic acid"],
    "celeriac": ["Luteolin"],
    "rutabaga": ["Luteolin", "Indole-3-carbinol"],
    "lemongrass": ["Luteolin"],
    "chrysanthemum": ["Luteolin"],
    "white tea": ["Catechins"],
    "green tea": ["Catechins", "(-)-Epigallocatechin gallate"],
    "black tea": ["Catechins", "Theaflavin", "Theaflavin-3-gallate", "Thearubigins"],
    "apple juice": ["Catechins"],
    "cocoa": ["Catechins", "Cyanidin"],
    "lentils": ["Catechins"],
    "blackeyed peas": ["Catechins"],
    "red wine": ["Anthocyanidins", "Myricetin"],
    "blueberries": ["Peonidin", "Cyanidin", "Delphinidin", "Malvidin", "Pterostilbene", "Secoisolariciresinol"],
    "raspberry": ["Pelargonidin"],
    "cherry": ["Peonidin", "Cyanidin"],
    "blackberry": ["Cyanidin", "Ellagic acid"],
    "loganberry": ["Cyanidin"],
    "eggplant": ["Delphinidin"],
    "malve": ["Malvidin"],
    "spirulina": ["Phycocyanin"],
    "alfalfa sprouts": ["Daidzein", "Genistein", "Coumestrol"],
    "red clover": ["Daidzein", "Genistein", "Coumestrol"],
    "chickpeas": ["Daidzein", "Genistein"],
    "kudzu": ["Daidzein"],
    "flax seed": ["Matairesinol", "Secoisolariciresinol"],
    "rye bran": ["Matairesinol"],
    "oat bran": ["Matairesinol"],
    "poppy seed": ["Matairesinol"],
    "blackcurrants": ["Matairesinol", "Secoisolariciresinol"],
    "zucchini": ["Secoisolariciresinol"],
    "pumpkin": ["Secoisolariciresinol", "Phytic acid"],
    "Brassica vegetables": ["Pinoresinol", "Lariciresinol"],
    "Japanese Knotweed root": ["Resveratrol"],
    "turmeric": ["Curcumin"],
    "mustard": ["Curcumin", "Sinigrin", "Allyl isothiocyanate"],
    "horse chestnut": ["Proanthocyanidins"],
    "cranberry juice": ["Proanthocyanidins"],
    "peanut skin": ["Proanthocyanidins"],
    "oak wood": ["Vescalagins"],
    "brown alga": ["Phlorotannins"],
    "sea oak": ["Phlorotannins"],
    "Mongolian Oak": ["Flavono-ellagitannins"],
    "licorice": ["Salicylic acid"],
    "wheat": ["Salicylic acid", "Hexose", "Phytic acid"],
    "burdock": ["Caffeic acid"],
    "pineapple": ["Caffeic acid", "Ferulic acid"],
    "coffee": ["Caffeic acid", "Oxalic acid"],
    "sunflower": ["Caffeic acid", "Tartaric acid"],
    "echinacea": ["Chlorogenic acid"],
    "cinnamon": ["Cinnamic acid"],
    "aloe": ["Cinnamic acid"],
    "oats": ["Ferulic acid", "Lignans"],
    "rice": ["Ferulic acid"],
    "acai oil": ["Ferulic acid"],
    "olive oil": ["Tyrosol", "Hydroxytyrosol", "Oleocanthal", "Oleuropein", "Caffeic acid"],
    "chilli peppers": ["Capsaicin"],
    "black pepper": ["Piperine"],
    "black mustard": ["Sinigrin"],
    "cauliflower": ["Glucoraphanin", "Sulforaphane"],
    "horseradish": ["Allyl isothiocyanate"],
    "wasabi": ["Allyl isothiocyanate"],
    "onions": ["Polysulfides", "Diallyl disulfide"],
    "leeks": ["Polysulfides", "Diallyl disulfide"],
    "shallots": ["Polysulfides", "Diallyl disulfide"],
    "mustard greens": ["Indole-3-carbinol"],
    "chard": ["Betacyanins"],
    "Amaranthus tricolor": ["Betacyanins"],
    "sicilian prickly pear": ["Indicaxanthin"],
    "cereals": ["Phytic acid", "Lignin"],
    "nuts": ["Phytic acid"],
    "banana": ["Oxalic acid"],
    "bell pepper": ["Oxalic acid"],
    "tamarind": ["Tartaric acid"],
    "beetroot": ["Betanin"],
    "barley": ["Hexose", "Alkylresorcinols"],
    "rye": ["Pentose", "Alkylresorcinols"],
    "oat": ["Pentose"],
    "topinambour": ["Inulins"],
    "chicory": ["Inulins"],
    "quince": ["Pectins"],
    "fruit skin": ["Pectins"],
    "shiitake": ["Lentinan"],
    "potatoes": ["Protease inhibitors"]
  };

  // Common phytochemical benefits (generalized based on scientific knowledge)
  const phytochemicalBenefits = {
    "α-Carotene": "Antioxidant, supports eye health, may reduce cancer risk",
    "β-Carotene": "Antioxidant, converts to vitamin A, supports immune function",
    "Lycopene": "Antioxidant, may reduce heart disease and cancer risk",
    "Lutein": "Supports eye health, antioxidant, may protect against age-related macular degeneration",
    "Zeaxanthin": "Supports eye health, antioxidant, protects against UV damage",
    "Phytofluene": "Antioxidant, may support skin health",
    "Phytoene": "Antioxidant, may support skin health",
    "β-Cryptoxanthin": "Antioxidant, converts to vitamin A, supports lung health",
    "Canthaxanthin": "Antioxidant, may support skin and eye health",
    "Astaxanthin": "Potent antioxidant, anti-inflammatory, supports skin and eye health",
    "Rubixanthin": "Antioxidant, may support immune function",
    "Saponins": "May lower cholesterol, anti-inflammatory, supports immune function",
    "Oleanolic acid": "Anti-inflammatory, may support liver health",
    "Ursolic acid": "Anti-inflammatory, may support muscle health and metabolism",
    "Betulinic acid": "Anti-inflammatory, may have anti-cancer properties",
    "Moronic acid": "Antiviral, may support immune function",
    "Cafestol": "May have anti-inflammatory and cholesterol-modulating effects",
    "Limonene": "Antioxidant, anti-inflammatory, may support digestion",
    "Perillyl alcohol": "May have anti-cancer properties, supports immune function",
    "Thujones": "May have antimicrobial properties",
    "Phytosterols": "Lowers cholesterol, supports heart health",
    "Campesterol": "Lowers cholesterol, supports heart health",
    "beta Sitosterol": "Lowers cholesterol, supports prostate health",
    "Stigmasterol": "Lowers cholesterol, anti-inflammatory",
    "Apiole": "Antioxidant, may support digestion",
    "Carnosol": "Antioxidant, anti-inflammatory, may protect against cancer",
    "Carvacrol": "Antimicrobial, antioxidant, supports immune function",
    "Dillapiole": "Antioxidant, may support digestion",
    "Quercetin": "Antioxidant, anti-inflammatory, may reduce allergy symptoms",
    "Kaempferol": "Antioxidant, may reduce cancer and heart disease risk",
    "Myricetin": "Antioxidant, anti-inflammatory, may support brain health",
    "Fisetin": "Antioxidant, may support brain health and longevity",
    "Rutin": "Antioxidant, supports vascular health",
    "Isorhamnetin": "Antioxidant, may support heart health",
    "Hesperidin": "Antioxidant, supports vascular health",
    "Naringenin": "Antioxidant, anti-inflammatory, may support metabolism",
    "Silybin": "Supports liver health, antioxidant",
    "Eriodictyol": "Antioxidant, may support heart health",
    "Acacetin": "Anti-inflammatory, may support immune function",
    "Apigenin": "Anti-inflammatory, may support brain health",
    "Chrysin": "Antioxidant, may support hormone balance",
    "Diosmetin": "Antioxidant, anti-inflammatory",
    "Tangeritin": "Antioxidant, may have anti-cancer properties",
    "Luteolin": "Antioxidant, anti-inflammatory, may support brain health",
    "Catechins": "Antioxidant, anti-inflammatory, supports heart health",
    "(-)-Epigallocatechin gallate": "Potent antioxidant, may reduce cancer risk",
    "Theaflavin": "Antioxidant, may support heart health",
    "Theaflavin-3-gallate": "Antioxidant, may support heart health",
    "Thearubigins": "Antioxidant, may support gut health",
    "Proanthocyanidins": "Antioxidant, supports vascular health",
    "Anthocyanidins": "Antioxidant, may support brain and heart health",
    "Pelargonidin": "Antioxidant, may support heart health",
    "Peonidin": "Antioxidant, may support brain health",
    "Cyanidin": "Antioxidant, may support heart and brain health",
    "Delphinidin": "Antioxidant, may support vascular health",
    "Malvidin": "Antioxidant, may support brain health",
    "Phycocyanin": "Antioxidant, anti-inflammatory, supports immune function",
    "Daidzein": "Phytoestrogen, may support bone and heart health",
    "Genistein": "Phytoestrogen, may reduce cancer risk",
    "Glycitein": "Phytoestrogen, may support heart health",
    "Coumestrol": "Phytoestrogen, may support bone health",
    "Matairesinol": "Phytoestrogen, may support heart health",
    "Secoisolariciresinol": "Phytoestrogen, may support heart health",
    "Pinoresinol": "Antioxidant, may support heart health",
    "Lariciresinol": "Antioxidant, may support heart health",
    "Resveratrol": "Antioxidant, anti-inflammatory, may support heart health",
    "Pterostilbene": "Antioxidant, may support brain and heart health",
    "Curcumin": "Anti-inflammatory, antioxidant, may support brain health",
    "Punicalagins": "Antioxidant, may support heart health",
    "Vescalagins": "Antioxidant, may support heart health",
    "Flavono-ellagitannins": "Antioxidant, may support gut health",
    "Salicylic acid": "Anti-inflammatory, may support heart health",
    "Gallic acid": "Antioxidant, may support heart health",
    "Ellagic acid": "Antioxidant, may reduce cancer risk",
    "Caffeic acid": "Antioxidant, anti-inflammatory",
    "Chlorogenic acid": "Antioxidant, may support metabolism",
    "Cinnamic acid": "Antioxidant, antimicrobial",
    "Ferulic acid": "Antioxidant, may support skin health",
    "Coumarin": "Anticoagulant, may support blood flow",
    "Tyrosol": "Antioxidant, may support heart health",
    "Hydroxytyrosol": "Antioxidant, may support heart health",
    "Oleocanthal": "Anti-inflammatory, may support joint health",
    "Oleuropein": "Antioxidant, may support heart health",
    "Capsaicin": "Pain relief, may support metabolism",
    "Gingerol": "Anti-inflammatory, supports digestion",
    "Alkylresorcinols": "Antioxidant, may support heart health",
    "Piperine": "Enhances nutrient absorption, may support metabolism",
    "Sinigrin": "May have anti-cancer properties",
    "Glucoraphanin": "Precursor to sulforaphane, may reduce cancer risk",
    "Sulforaphane": "Antioxidant, may reduce cancer risk",
    "Allyl isothiocyanate": "Antimicrobial, may have anti-cancer properties",
    "Polysulfides": "Antimicrobial, may support heart health",
    "Diallyl disulfide": "Antimicrobial, may support immune function",
    "Alliin": "Precursor to allicin, antimicrobial",
    "Syn-propanethial-S-oxide": "Antimicrobial, may support immune function",
    "Indole-3-carbinol": "May reduce cancer risk, supports hormone balance",
    "3,3'-Diindolylmethane": "May reduce cancer risk, supports hormone balance",
    "Betacyanins": "Antioxidant, may support liver health",
    "Betanin": "Antioxidant, may support liver health",
    "Indicaxanthin": "Antioxidant, may support eye health",
    "Vulgaxanthin": "Antioxidant, may support immune function",
    "Chlorophyllin": "Antioxidant, may support detoxification",
    "Phytic acid": "Antioxidant, may reduce mineral absorption",
    "Oxalic acid": "May bind minerals, limited direct benefits",
    "Tartaric acid": "Antioxidant, supports digestion",
    "Anacardic acid": "Antimicrobial, may support immune function",
    "Malic acid": "Supports energy production, aids digestion",
    "Caftaric acid": "Antioxidant, may support heart health",
    "Coutaric acid": "Antioxidant, may support heart health",
    "Fertaric acid": "Antioxidant, may support heart health",
    "Hexose": "Energy source, limited direct phytochemical benefits",
    "Pentose": "Energy source, limited direct phytochemical benefits",
    "Chitin": "Supports gut health, may reduce cholesterol",
    "Lentinan": "Supports immune function, may have anti-cancer properties",
    "Inulins": "Prebiotic, supports gut health",
    "Lignin": "Supports gut health, may reduce cholesterol",
    "Pectins": "Supports gut health, may lower cholesterol",
    "Protease inhibitors": "May have anti-cancer properties, supports digestion"
  };

  // Map cleaned ingredients to phytochemicals and benefits
  const result = {};
  cleanedIngredients.forEach(ingredient => {
    const lowerIngredient = ingredient.toLowerCase();
    if (phytochemicals[lowerIngredient]) {
      result[ingredient] = phytochemicals[lowerIngredient].map(phyto => ({
        phytochemical: phyto,
        benefits: phytochemicalBenefits[phyto] || "General antioxidant or anti-inflammatory properties"
      }));
    } else {
      result[ingredient] = [];
    }
  });

  return result;
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

// Reference list of valid plant-based ingredients
const phytochemicalKeys = [
  "carrots",
  "pumpkins",
  "maize",
  "tangerine",
  "orange",
  "dark leafy greens",
  "red fruits",
  "yellow fruits",
  "Vietnamese Gac",
  "tomatoes",
  "grapefruit",
  "watermelon",
  "guava",
  "apricots",
  "autumn olive",
  "star fruit",
  "sweet potato",
  "paprika",
  "mushrooms",
  "mango",
  "papaya",
  "peaches",
  "avocado",
  "pea",
  "kiwi",
  "wolfberry",
  "spinach",
  "kale",
  "turnip greens",
  "red pepper",
  "squash",
  "brassicas",
  "prunes",
  "honeydew melon",
  "rhubarb",
  "plum",
  "pear",
  "cilantro",
  "microalgae",
  "yeast",
  "rose hip",
  "soybeans",
  "beans",
  "legumes",
  "alfalfa",
  "American pokeweed",
  "honey mesquite",
  "garlic",
  "java apple",
  "cloves",
  "Syzygium species",
  "apples",
  "basil",
  "bilberries",
  "cranberries",
  "elder flower",
  "peppermint",
  "lavender",
  "oregano",
  "thyme",
  "hawthorn",
  "Ber tree",
  "white birch",
  "winged beans",
  "Triphyophyllum peltatum",
  "Ancistrocladus heyneanus",
  "Diospyros leucomelas",
  "Tetracera boiviniana",
  "jambul",
  "chaga",
  "Rhus javanica",
  "mistletoe",
  "Coffea arabica",
  "citrus",
  "cherries",
  "spearmint",
  "dill",
  "celery",
  "rosemary",
  "ginger",
  "hops",
  "caraway",
  "mints",
  "Thyme",
  "Sage",
  "Mugwort",
  "Juniper",
  "almonds",
  "cashews",
  "peanuts",
  "sesame seeds",
  "sunflower seeds",
  "whole wheat",
  "vegetable oils",
  "buckwheat",
  "rice bran",
  "wheat germ",
  "corn oils",
  "fennel",
  "parsley",
  "celery leaf",
  "sage",
  "pepperwort",
  "wild bergamot",
  "fennel root",
  "red onions",
  "yellow onions",
  "tea",
  "wine",
  "lovage",
  "strawberries",
  "gooseberries",
  "peas",
  "broccoli",
  "brussels sprouts",
  "cabbage",
  "chives",
  "endive",
  "leek",
  "grapes",
  "berries",
  "walnuts",
  "cucumbers",
  "lemons",
  "limes",
  "pagoda tree fruits",
  "asparagus",
  "red turnip",
  "goldenrod",
  "mustard leaf",
  "ginkgo biloba",
  "onion",
  "milk thistle",
  "Robinia pseudoacacia",
  "Tumera diffusa",
  "chamomile",
  "Passiflora caerulea",
  "Pleurotus ostreatus",
  "Oroxylum indicum",
  "Vicia",
  "beets",
  "artichokes",
  "celeriac",
  "rutabaga",
  "lemongrass",
  "chrysanthemum",
  "white tea",
  "green tea",
  "black tea",
  "apple juice",
  "cocoa",
  "lentils",
  "blackeyed peas",
  "red wine",
  "blueberries",
  "raspberry",
  "cherry",
  "blackberry",
  "loganberry",
  "eggplant",
  "malve",
  "spirulina",
  "alfalfa sprouts",
  "red clover",
  "chickpeas",
  "kudzu",
  "flax seed",
  "rye bran",
  "oat bran",
  "poppy seed",
  "blackcurrants",
  "zucchini",
  "pumpkin",
  "Brassica vegetables",
  "Japanese Knotweed root",
  "turmeric",
  "mustard",
  "horse chestnut",
  "cranberry juice",
  "peanut skin",
  "oak wood",
  "brown alga",
  "sea oak",
  "Mongolian Oak",
  "licorice",
  "wheat",
  "burdock",
  "pineapple",
  "coffee",
  "sunflower",
  "echinacea",
  "cinnamon",
  "aloe",
  "oats",
  "rice",
  "acai oil",
  "olive oil",
  "chilli peppers",
  "black pepper",
  "black mustard",
  "cauliflower",
  "horseradish",
  "wasabi",
  "onions",
  "leeks",
  "shallots",
  "mustard greens",
  "chard",
  "Amaranthus tricolor",
  "sicilian prickly pear",
  "cereals",
  "nuts",
  "banana",
  "bell pepper",
  "tamarind",
  "beetroot",
  "barley",
  "rye",
  "oat",
  "topinambour",
  "chicory",
  "quince",
  "fruit skin",
  "shiitake",
  "potatoes"
];

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
  "sugar",
  "syrup",
  "molasses",
  "mayonnaise",
  "ketchup",
  "mustard",
  "soy sauce",
  "vinegar",
  "crustaceans",
  "krill"
];

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
      const result = parseIngredientsAndGetPhytochemicals(ocrText, phytochemicalKeys, exclusionList);

      // Return the final OCR text
      return result;
    } catch (error) {
      console.error("Error in next function:", error);
      throw error; // Re-throw the error for the caller to handle
    }
  };

  const processing = async () => {
    try {
      const text = await next();
      console.log(text);
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
