const { withInfoPlist } = require('@expo/config-plugins');

module.exports = function withForceLandscape(config) {
  return withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;
    
    // Remove all portrait orientations for iPhone
    infoPlist.UISupportedInterfaceOrientations = [
      'UIInterfaceOrientationLandscapeLeft',
      'UIInterfaceOrientationLandscapeRight'
    ];
    
    // Remove all portrait orientations for iPad
    infoPlist['UISupportedInterfaceOrientations~ipad'] = [
      'UIInterfaceOrientationLandscapeLeft',
      'UIInterfaceOrientationLandscapeRight'
    ];
    
    // Force initial orientation
    infoPlist['UIInterfaceOrientation'] = 'UIInterfaceOrientationLandscapeLeft';
    infoPlist['UIInterfaceOrientation~ipad'] = 'UIInterfaceOrientationLandscapeLeft';
    
    // Require full screen on both devices
    infoPlist['UIRequiresFullScreen'] = true;
    infoPlist['UIRequiresFullScreen~ipad'] = true;
    
    // Disable status bar rotation
    infoPlist['UIViewControllerBasedStatusBarAppearance'] = false;
    infoPlist['UIViewControllerBasedStatusBarAppearance~ipad'] = false;
    
    return config;
  });
}; 