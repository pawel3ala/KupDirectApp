import React, { useEffect } from 'react';
import { ScreenOrientation } from 'expo';
import { WebView } from 'react-native-webview';

export default function LinksScreen() {

  useEffect(() => {
    async function changeOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    changeOrientation()
  }, []);

  return (
    <WebView scalesPageToFit = 'false' source={{ uri: 'http://kup.direct/mobileservice-test/page.php?page=1' }} />
  );
}
