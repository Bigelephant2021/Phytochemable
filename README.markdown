# Phytochemable

Phytochemable is a mobile application developed by Elestudios to help users identify phytochemicals in foods by analyzing nutrition labels. Users can take a photo of a food label, and the app uses OCR (Optical Character Recognition) to extract the ingredients list, filter out non-plant-based ingredients, and map the remaining plant-based ingredients to their associated phytochemicals and health benefits.

## Features
- **Camera-Based Label Scanning**: Capture a photo of a food nutrition label using the device's camera.
- **OCR Processing**: Extracts ingredients from the image using the OCR Space API.
- **Ingredient Analysis**: Filters out non-plant-based ingredients (e.g., meat, dairy) and matches plant-based ingredients with a reference list using fuzzy matching (Levenshtein distance).
- **Phytochemical Mapping**: Provides a detailed list of phytochemicals and their health benefits for each identified plant-based ingredient.
- **Ad Integration**: Displays native ads via Google Mobile Ads, with proper consent handling for personalized ads.
- **Cross-Platform**: Built with React Native and Expo for iOS and Android compatibility.

## Tech Stack
- **Framework**: React Native, Expo
- **Dependencies**: 
  - `react-native-camera`, `expo-camera`, `expo-image` for camera and image handling
  - `react-native-google-mobile-ads` for ad integration
  - `ocr-space-api-wrapper` for OCR processing
  - `react-native-permissions` for handling camera and tracking permissions
  - `react-native-paper` for UI components
- **Other**: Levenshtein distance algorithm for fuzzy matching of ingredients

## Installation
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the app:
   - For Android: `npm run android`
   - For iOS: `npm run ios`
4. Ensure you have an OCR Space API key in `api.txt` or replace the key in `App.js`.

## Usage
1. Grant camera permissions when prompted.
2. Take a straight, clear photo of a food nutrition label containing the ingredients list.
3. The app processes the image, extracts the ingredients, and displays the plant-based ingredients along with their phytochemicals and benefits.

## License
This project is licensed under the Elestudios License. See the `LICENSE.md` file for details.

## Notes
- The app is designed for a school project (IS gp project).
- Ensure compliance with the Elestudios License, particularly restrictions on modifying monetization-related files.
- Replace the test ad unit ID in `Ads.js` with a production ad unit ID for deployment.