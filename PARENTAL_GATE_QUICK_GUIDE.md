# Parental Gate Quick Implementation Guide

## For Developers: How to Add Parental Gate to Ads

If you need to add ads in other locations in the app, **always use** `AdMobWithParentalGate` instead of the native AdMob components.

### ✅ DO: Use AdMobWithParentalGate

```tsx
import AdMobWithParentalGate, { AdMobWithParentalGateRef } from './AdMobWithParentalGate';

// Create ref
const adRef = useRef<AdMobWithParentalGateRef>(null);

// Render component
<AdMobWithParentalGate
  type="interstitial"  // or "rewarded"
  ref={adRef}
  adUnitId="your-ad-unit-id"
  requireParentalGate={true}  // Always true for Kids Category
  autoLoad={true}
  onAdLoaded={() => console.log('Ad loaded')}
  onAdClosed={() => console.log('Ad closed')}
  onParentalGateSuccess={() => console.log('Gate passed')}
  onParentalGateCancel={() => console.log('Gate cancelled')}
/>

// Show ad (parental gate will appear first)
adRef.current?.show();
```

### ❌ DON'T: Use Native AdMob Components Directly

```tsx
// ❌ WRONG - No parental gate protection
import AdMobInterstitial from './AdMobInterstitial';

<AdMobInterstitial
  ref={adRef}
  adUnitId="your-ad-unit-id"
/>
```

This will cause Apple rejection because ads can navigate users out of the app without parental permission.

---

## Ad Types Supported

### 1. Interstitial Ads
```tsx
<AdMobWithParentalGate
  type="interstitial"
  ref={adRef}
  adUnitId={AdMobService.getInterstitialAdUnitId()}
  requireParentalGate={true}
/>
```

**Use Cases:**
- Between levels
- After completing a level
- Natural breaks in gameplay

**Never use:**
- On app launch
- During gameplay
- More than once every 2-3 minutes

### 2. Rewarded Ads
```tsx
<AdMobWithParentalGate
  type="rewarded"
  ref={adRef}
  adUnitId="your-rewarded-ad-unit-id"
  requireParentalGate={true}
  onRewarded={(reward) => {
    // Grant reward to user
    console.log('Reward:', reward);
  }}
/>
```

**Use Cases:**
- Optional hints
- Cosmetic rewards
- Extra lives (optional)

**Never use:**
- Required progression
- Paywalls for kids

---

## Banner Ads - Special Case

Banner ads typically don't need a parental gate IF:
1. They are displayed in menu areas (not during gameplay)
2. They don't cover interactive elements
3. They have clear boundaries

However, if Apple still rejects due to banner ads:

### Option 1: Remove Banner Ads
The safest option for Kids Category apps.

### Option 2: Add Tap Interception (Advanced)
Wrap banner in a TouchableOpacity that shows parental gate on tap:

```tsx
import { TouchableOpacity } from 'react-native';
import AdMobBanner from './AdMobBanner';
import ParentalGate from './ParentalGate';

const [showGate, setShowGate] = useState(false);

<TouchableOpacity
  activeOpacity={1}
  onPress={() => setShowGate(true)}
>
  <AdMobBanner adUnitId="banner-id" />
</TouchableOpacity>

<ParentalGate
  visible={showGate}
  onSuccess={() => {
    setShowGate(false);
    // Allow ad click to proceed
  }}
  onCancel={() => setShowGate(false)}
/>
```

**Note**: This is complex and may not work well with all banner ad implementations.

---

## Testing Checklist

For each ad implementation:

- [ ] Parental gate appears before ad is shown
- [ ] Gate cannot be bypassed
- [ ] Gate appears every time (not just first time)
- [ ] Ad only shows after gate is successfully completed
- [ ] Cancelling gate prevents ad from showing
- [ ] Proper logging for debugging
- [ ] Works on both iPhone and iPad
- [ ] Works in landscape orientation

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Showing Ad Without Gate
```tsx
// Wrong
adRef.current?.show();  // No gate if using native AdMob component
```

### ✅ Correct
```tsx
// Correct - AdMobWithParentalGate handles gate automatically
adRef.current?.show();  // Gate appears first, then ad
```

### ❌ Mistake 2: Making Gate Optional
```tsx
// Wrong - Kids Category apps should ALWAYS require gate
<AdMobWithParentalGate
  requireParentalGate={false}  // ❌ Don't do this
/>
```

### ✅ Correct
```tsx
// Correct - Always require gate for Kids Category
<AdMobWithParentalGate
  requireParentalGate={true}  // ✅ Always true
/>
```

### ❌ Mistake 3: Mixing Gated and Non-Gated Ads
```tsx
// Wrong - Some ads have gate, others don't
<AdMobInterstitial ref={adRef1} />  // ❌ No gate
<AdMobWithParentalGate ref={adRef2} />  // ✅ Has gate
```

### ✅ Correct
```tsx
// Correct - ALL ads have gate
<AdMobWithParentalGate ref={adRef1} type="interstitial" />
<AdMobWithParentalGate ref={adRef2} type="rewarded" />
```

---

## Debugging

### Check Console Logs

Successful flow:
```
📺 Interstitial ad loaded and ready
[User triggers ad]
🔒 Showing parental gate before ad
[User completes challenge]
✅ Parental gate passed - showing ad
📺 Showing interstitial ad
```

Cancelled flow:
```
📺 Interstitial ad loaded and ready
[User triggers ad]
🔒 Showing parental gate before ad
[User cancels]
❌ Parental gate cancelled - ad will not be shown
```

### Common Issues

**Issue**: Ad shows without parental gate
- **Cause**: Using native AdMob component instead of `AdMobWithParentalGate`
- **Fix**: Replace with `AdMobWithParentalGate`

**Issue**: Parental gate doesn't appear
- **Cause**: `requireParentalGate={false}` or gate component not imported
- **Fix**: Set `requireParentalGate={true}` and verify imports

**Issue**: Ad doesn't show after completing gate
- **Cause**: Ad not loaded yet
- **Fix**: Wait for `onAdLoaded` callback before calling `show()`

---

## Summary

**Golden Rule**: 
> In Kids Category apps, EVERY ad that can navigate users out of the app MUST have a parental gate.

**Use `AdMobWithParentalGate` for:**
- ✅ Interstitial ads
- ✅ Rewarded ads
- ✅ Any ad that can be clicked

**Can use native components for:**
- ❓ Banner ads (with caution, may still need gate)

**Never:**
- ❌ Mix gated and non-gated ads
- ❌ Make parental gate optional
- ❌ Skip gate for "just one" ad

---

**Questions?** Check `KIDS_CATEGORY_COMPLIANCE.md` for detailed documentation.
