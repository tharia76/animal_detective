const { withDangerousMod, withAppDelegate } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withiOSLandscapeOnly(config) {
  return withAppDelegate(config, async (config) => {
    const fileContents = config.modResults.contents;
    
    // Add the orientation methods to AppDelegate
    const orientationMethods = `
  // Force landscape orientation for all presentations including modals
  public override func application(
    _ application: UIApplication,
    supportedInterfaceOrientationsFor window: UIWindow?
  ) -> UIInterfaceOrientationMask {
    return [.landscapeLeft, .landscapeRight]
  }
  
  // Prevent autorotation to portrait
  public override var shouldAutorotate: Bool {
    return false
  }
  
  // Force initial orientation
  public override var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation {
    return .landscapeLeft
  }
  
  // Override for modal presentations
  public override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    
    // Force landscape for any modal presentations
    if let presentedVC = self.presentedViewController {
      let orientationMask: UIInterfaceOrientationMask = [.landscapeLeft, .landscapeRight]
      if #available(iOS 16.0, *) {
        let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        windowScene?.requestGeometryUpdate(.iOS(interfaceOrientations: orientationMask))
      }
    }
  }`;

    // Find where to insert the methods (before the last closing brace)
    const lastBraceIndex = fileContents.lastIndexOf('}');
    
    // Check if methods already exist
    if (!fileContents.includes('supportedInterfaceOrientationsFor')) {
      // Insert the methods
      const modifiedContents = 
        fileContents.slice(0, lastBraceIndex) + 
        orientationMethods + '\n' +
        fileContents.slice(lastBraceIndex);
      
      config.modResults.contents = modifiedContents;
    }
    
    return config;
  });
}; 