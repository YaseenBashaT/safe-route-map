
# Plan: Fix Red Danger Marker Placement Accuracy

## Problem Analysis

The red exclamation mark danger markers appear far away from the route because they are currently placed at the **hotspot's city coordinates** rather than directly **on the route path**.

### Root Cause

In `src/components/MapView.tsx` (line 329), the danger markers are placed using the hotspot's original coordinates:
```javascript
const marker = L.marker([hotspot.lat, hotspot.lng], ...)
```

However, the hotspot coordinates come from city-level data with random offsets for visual distribution (not exact road locations). When a route passes within 2km of a hotspot, the marker should be placed at the **route coordinate** where the proximity was detected, not at the city center.

### Current Flow

```text
Route coordinate detected near hotspot
         |
         v
   Store: { coord: routePoint, hotspot: cityData }
         |
         v
   Marker placed at: hotspot.lat/lng (city center) <-- WRONG
```

### Correct Flow

```text
Route coordinate detected near hotspot
         |
         v
   Store: { coord: routePoint, hotspot: cityData }
         |
         v
   Marker placed at: coord (on route) <-- CORRECT
```

---

## Solution

Change the danger marker placement from using hotspot coordinates to using the actual route coordinates where the danger was detected.

### Changes Required

**File: `src/components/MapView.tsx`**

1. **Fix the danger warning marker placement (around line 329)**
   - Change from: `L.marker([hotspot.lat, hotspot.lng], ...)`
   - Change to: `L.marker([coord[0], coord[1]], ...)`

2. **Ensure consistent placement for red circle markers (around line 578)**
   - The red circle markers added recently are already using route coordinates correctly (`segment.coords`) - no change needed here

3. **Adjust the metrics tooltip location if needed**
   - The route metrics marker placement appears correct (uses midpoint of route)

---

## Technical Details

### Specific Code Change

**Line ~329 in MapView.tsx:**

Current:
```javascript
const marker = L.marker([hotspot.lat, hotspot.lng], { 
  icon: dangerIcon,
  zIndexOffset: 900,
})
```

Updated:
```javascript
const marker = L.marker([coord[0], coord[1]], { 
  icon: dangerIcon,
  zIndexOffset: 900,
})
```

This single change will place all red danger warning markers directly on the route path where the danger was detected.

---

## Expected Result

After this fix:
- Red exclamation mark markers will appear directly on the selected route line
- Markers will be positioned at the exact points where the route passes through danger zones
- The popup will still show the correct hotspot information (city name, accident counts)
- Visual alignment between the red route segments and danger markers will be precise

---

## Additional Considerations

- The popup content will still reference the hotspot's city/state information correctly
- The marker color (red/orange/yellow) will still be based on hotspot severity
- No changes needed to the hotspot data or detection logic - only the marker placement coordinate
