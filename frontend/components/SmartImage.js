import React, { useState } from 'react';
import { Image } from 'react-native';

// Local fallback — always available, no network needed
const FALLBACK = require('../assets/icon.png');

/**
 * SmartImage: drop-in replacement for <Image> that falls back to a
 * local asset when the remote URI is empty, blank, or fails to load.
 *
 * Usage:
 *   <SmartImage uri={item.image} style={styles.myImage} />
 */
export default function SmartImage({ uri, style, resizeMode = 'cover' }) {
  const [failed, setFailed] = useState(false);

  const isValidUri = uri && typeof uri === 'string' && uri.trim() !== '';

  if (!isValidUri || failed) {
    return <Image source={FALLBACK} style={style} resizeMode={resizeMode} />;
  }

  return (
    <Image
      source={{ uri: uri.trim() }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
