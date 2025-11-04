const AsyncStorage = require('@react-native-async-storage/async-storage').default;
AsyncStorage.removeItem('unlocked_all_levels').then(() => {
  console.log('✅ Cleared unlock status');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
