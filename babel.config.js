const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Required for expo-router
      "expo-router/babel",
      // Module path aliases
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // This needs to be mirrored in tsconfig.json
            '@': './',
          },
        },
      ],
      // Optional: For advanced features like reanimated
      "react-native-reanimated/plugin",
    ],
  };
};