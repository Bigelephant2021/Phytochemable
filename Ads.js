import React, { useState, useEffect } from 'react';
import { Image, Text } from 'react-native';
import { 
  check, 
  request, 
  PERMISSIONS, 
  RESULTS 
} from 'react-native-permissions';
import mobileAds, { 
  AdsConsent, 
  NativeAd, 
  NativeAdView, 
  NativeAsset, 
  NativeAssetType, 
  NativeMediaView, 
  TestIds 
} from 'react-native-google-mobile-ads';

/**
 * Initializes the ads SDK after checking ATT and gathering EEA consent.
 */
const initializeAdsSDK = async () => {
  try {
    // Check for Apple's App Tracking Transparency permission (iOS only)
    const attResult = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    if (attResult === RESULTS.DENIED) {
      // Request the permission if it hasn't been requested yet.
      await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    }

    // Request updated consent info
    // (Optional debug parameters are provided here for testing purposes.)
    await AdsConsent.requestInfoUpdate({
      testDeviceIdentifiers: ['TEST-DEVICE-HASHED-ID'] // Your test device ID(s)
    });

    // This helper method will load and present the consent form if required.
    await AdsConsent.gatherConsent();
    console.log("User consent gathered successfully.");

    // Now that consent is gathered, initialize the Mobile Ads SDK.
    await mobileAds().initialize();
  } catch (error) {
    console.error("Error during ads initialization and consent gathering:", error);
    // Even if consent gathering fails, you may still choose to initialize ads.
    await mobileAds().initialize();
  }
};

const NativeAds = () => {
  const [nativeAd, setNativeAd] = useState(null);

  useEffect(() => {
    (async () => {
      // Initialize ATT and consent flow then load ads
      await initializeAdsSDK();

      // Once the SDK is ready, load your native ad using the test ad unit.
      // Replace TestIds.NATIVE with your production ad unit id when ready.
      NativeAd.createForAdRequest(TestIds.NATIVE)
        .then(setNativeAd)
        .catch(console.error);
    })();
  }, []);

  if (!nativeAd) return null;

  return (
    // Wrap your ad assets in NativeAdView and register the nativeAd instance.
    <NativeAdView nativeAd={nativeAd}>
      {/* Display the icon asset if available */}
      {nativeAd.icon && (
        <NativeAsset assetType={NativeAssetType.ICON}>
          <Image 
            source={{ uri: nativeAd.icon.url }} 
            style={{ width: 24, height: 24 }} 
          />
        </NativeAsset>
      )}

      {/* Display the headline asset */}
      <NativeAsset assetType={NativeAssetType.HEADLINE}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {nativeAd.headline}
        </Text>
      </NativeAsset>

      {/* Always denote the view as sponsored */}
      <Text>Sponsored</Text>

      {/* Display the media asset */}
      <NativeMediaView />
    </NativeAdView>
  );
};

export default NativeAds;
