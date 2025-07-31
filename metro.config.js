const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push('sql');

// Ensure proper module resolution
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Fix for anonymous module issues
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;