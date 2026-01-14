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
    
    // Hide status bar completely
    infoPlist['UIStatusBarHidden'] = true;
    infoPlist['UIStatusBarHidden~ipad'] = true;
    infoPlist['UIViewControllerBasedStatusBarAppearance'] = false;
    infoPlist['UIViewControllerBasedStatusBarAppearance~ipad'] = false;
    
    // Prevent split view and slide over on iPad
    infoPlist['UIRequiresFullScreen'] = true;
    
    // Disable home indicator auto-hiding delay
    infoPlist['UIPreferredScreenEdgesDeferringSystemGestures'] = 15; // All edges
    
    return config;
  });
}; 