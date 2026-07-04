import React, { useEffect, useState } from 'react';
import { Image, View, Platform } from 'react-native';
import Constants from 'expo-constants';

// Local fallback — always available, no network needed
const FALLBACK = require('../assets/icon.png');

function getExpoHost() {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    if (hostUri) {
      return hostUri.split(':')[0];
    }
  } catch (_) {}
  return null;
}

function normalizeImageUri(uri) {
  if (typeof uri !== 'string') return '';

  const trimmed = uri.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
    return trimmed;
  }

  const addScheme = (value) => {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    if (value.startsWith('localhost') || value.startsWith('127.0.0.1') || value.startsWith('0.0.0.0')) {
      return `http://${value}`;
    }
    return `https://${value}`;
  };

  const withScheme = addScheme(trimmed);

  if (Platform.OS === 'android' && (withScheme.includes('localhost') || withScheme.includes('127.0.0.1') || withScheme.includes('0.0.0.0'))) {
    const expoHost = getExpoHost();
    const host = expoHost || '10.0.2.2';
    return withScheme
      .replace('localhost', host)
      .replace('127.0.0.1', host)
      .replace('0.0.0.0', host);
  }

  return withScheme;
}

/**
 * SmartImage: drop-in replacement for <Image> that falls back to a
 * local asset when the remote URI is empty, blank, or fails to load.
 *
 * Usage:
 *   <SmartImage uri={item.image} style={styles.myImage} />
 */
export default function SmartImage({ uri, style, resizeMode = 'cover' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const normalizedUri = normalizeImageUri(uri);
  const isValidUri = normalizedUri !== '';

  const imageSource = isValidUri ? { uri: normalizedUri } : null;

  if (!isValidUri || failed) {
    return null;
  }

  return (
    <Image
      source={imageSource}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
