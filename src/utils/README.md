# Utils Directory

This directory contains utility functions and helpers for the Animal Detective app.

## Files

### `backgroundPositioning.ts`
Handles background positioning for different levels and device types. Provides functions to calculate background styles and colors based on level name, device type, and orientation.

### `landscapeBackgrounds.ts`
Optimized background positioning system specifically for landscape mode. Contains presets for each level with device-specific configurations.

### `labelPositioning.ts` ⭐ **NEW**
**Simplified label positioning utility for landscape mode.** This file provides consistent label positioning for all levels when in landscape mode.

#### Key Features:
- **Universal Configuration**: Same positioning rules for all levels (ocean, forest, desert, etc.)
- **Landscape-Only**: Only applies positioning adjustments when in landscape mode
- **Device-Aware**: Automatically detects tablet vs phone
- **Consistent**: All levels get the same positioning behavior

#### Main Functions:
- `getLabelPositioning(levelName, screenW, screenH, isLandscape)`: Main function that returns positioning configuration
- `shouldRenderLabel(...)`: Helper to determine if label should be rendered

#### Usage Example:
```typescript
import { getLabelPositioning } from '../utils/labelPositioning';

// In your component
const labelConfig = getLabelPositioning(levelName, screenW, screenH, isLandscape);

<Animated.View style={[
  dynamicStyles.animalNameWrapper,
  labelConfig, // This includes top, fontSize, padding, etc.
  // ... other styles
]}>
```

**Note**: When not in landscape mode, the function returns default positioning (top: 0). When in landscape mode, all levels use the same positioning configuration.

### `responsive.ts`
Responsive design utilities including spacing calculations, scale factors, and device type detection.

### `debugUtils.ts`
Debugging utilities and helper functions for development.

## Architecture

The positioning utilities follow a layered approach:
1. **Base Layer**: `responsive.ts` - Device detection and basic responsive functions
2. **Background Layer**: `backgroundPositioning.ts` + `landscapeBackgrounds.ts` - Background positioning
3. **Label Layer**: `labelPositioning.ts` - Label positioning (new addition)

This separation allows for:
- Easy maintenance and updates
- Clear separation of concerns
- Reusable positioning logic across components
- Consistent behavior across different levels and devices
