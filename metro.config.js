const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable fast refresh and hot reloading
config.transformer.enableBabelRCLookup = true;
config.transformer.enableBabelRuntime = false;

// Enable experimental features for better development experience
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Improve watchman file watching
config.watchFolders = [__dirname];

// Enable source maps for better debugging
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config; 