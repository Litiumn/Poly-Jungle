# 🚀 Quick Test Guide — EcoForest Base Self-Contained

## ⚡ 30-Second Test

1. **Run**: `pnpm dev` → http://localhost:3000
2. **Enter**: Click "🌳 Enter Your Forest"
3. **Plant**: Click pulsing green "PLANT" button → Select Oak → Tree appears
4. **Water**: Click the tree → Get +2 eco-points
5. **Clean**: Click red trash cube → Get +5 eco-points
6. **Weather**: Click weather icon (top-right) → Rain falls
7. **Debug**: Click "Debug" (bottom-left) → Add 500 eco-points

**✅ Success**: If all 7 steps work, the prototype is fully functional!

---

## 🧪 Comprehensive Test Flow

### 1. Landing Screen (5 tests)

- [ ] **T1.1**: Landing screen shows with title "🌍 EcoForest Base"
- [ ] **T1.2**: Animated background elements (🌳🌸🌿🌲) visible
- [ ] **T1.3**: Mock wallet address displayed (e.g., 0xABC...123)
- [ ] **T1.4**: Click "▼ How to Play" expands help panel
- [ ] **T1.5**: Click "🌳 Enter Your Forest" transitions to forest view

### 2. Forest Scene (10 tests)

- [ ] **T2.1**: 3D isometric forest loads successfully
- [ ] **T2.2**: Green terrain with visible hills (not flat)
- [ ] **T2.3**: Blue lake visible at right side
- [ ] **T2.4**: 4 grey rocks scattered around terrain
- [ ] **T2.5**: 5 red trash cubes visible
- [ ] **T2.6**: Camera can rotate with mouse drag
- [ ] **T2.7**: Camera can zoom with mouse wheel
- [ ] **T2.8**: Lighting is appropriate for time of day (bright if day, dim if night)
- [ ] **T2.9**: Top bar shows eco-points (starting: 500)
- [ ] **T2.10**: Bottom shows large green "PLANT" button

### 3. Planting Method A: Button (6 tests)

- [ ] **T3.1**: Click "PLANT" button opens seed menu
- [ ] **T3.2**: Seed menu shows 5 species: Oak, Pine, Cherry, Baobab, Mangrove
- [ ] **T3.3**: Each species shows emoji, name, description, and cost
- [ ] **T3.4**: Click Oak (cost: 50) plants tree
- [ ] **T3.5**: Eco-points reduced from 500 to 450
- [ ] **T3.6**: Small tree appears at center of terrain

### 4. Planting Method B: Direct Click (8 tests)

- [ ] **T4.1**: Click empty terrain opens seed menu
- [ ] **T4.2**: Click Pine in menu plants tree at clicked location
- [ ] **T4.3**: Tree appears at correct position
- [ ] **T4.4**: Eco-points reduced by 60
- [ ] **T4.5**: Click lake shows notification: "Cannot plant in the lake!"
- [ ] **T4.6**: Tree does NOT plant in lake
- [ ] **T4.7**: Click very close to existing tree shows "Too close to another tree!"
- [ ] **T4.8**: Tree does NOT plant when too close

### 5. Watering Trees (6 tests)

- [ ] **T5.1**: Click planted tree shows notification "💧 Watered tree!"
- [ ] **T5.2**: Eco-points increase by +2
- [ ] **T5.3**: Notification mentions "+10% growth"
- [ ] **T5.4**: Click same tree again shows "Already watered today!"
- [ ] **T5.5**: Eco-points do NOT increase second time
- [ ] **T5.6**: Stats (debug panel) show trees watered count increased

### 6. Trash Cleanup (5 tests)

- [ ] **T6.1**: Click red trash cube shows notification "🗑️ Trash cleaned!"
- [ ] **T6.2**: Eco-points increase by +5
- [ ] **T6.3**: Trash cube disappears
- [ ] **T6.4**: Stats (debug panel) show trash cleaned count increased
- [ ] **T6.5**: Can clean all 5 trash cubes successfully

### 7. Weather System (5 tests)

- [ ] **T7.1**: Click weather button cycles from sunny to cloudy
- [ ] **T7.2**: Click again cycles cloudy to rain
- [ ] **T7.3**: Rain shows animated falling particles
- [ ] **T7.4**: Lighting dims during rain
- [ ] **T7.5**: Click again cycles rain back to sunny

### 8. Debug Panel (7 tests)

- [ ] **T8.1**: Click "Debug" button (bottom-left) opens debug panel
- [ ] **T8.2**: Panel shows current stats (trees, eco-points, trash)
- [ ] **T8.3**: Click "+Add 100 Eco-Points" increases balance by 100
- [ ] **T8.4**: Click "+Add 500 Eco-Points" increases balance by 500
- [ ] **T8.5**: Click "🗑️ Spawn Trash" creates new red cube on terrain
- [ ] **T8.6**: Growth info shows correct timing (seed 0-30min, sprout 30-60min, etc.)
- [ ] **T8.7**: Click "✕" closes debug panel

### 9. Growth System (6 tests)

- [ ] **T9.1**: Newly planted tree starts as "seed" stage (smallest size)
- [ ] **T9.2**: Open debug panel, note planted timestamp
- [ ] **T9.3**: Wait 10 seconds, tree size remains "seed" (too early)
- [ ] **T9.4**: Modify localStorage (advanced): Change plantedAt to 35 minutes ago
- [ ] **T9.5**: Refresh page, tree should now be "sprout" stage (larger)
- [ ] **T9.6**: Trees count in top bar matches number of planted trees

### 10. Persistence (5 tests)

- [ ] **T10.1**: Plant 3 trees (Oak, Pine, Cherry)
- [ ] **T10.2**: Clean 2 trash items
- [ ] **T10.3**: Note current eco-points
- [ ] **T10.4**: Refresh page (F5 or reload)
- [ ] **T10.5**: All 3 trees still present, eco-points correct, only 3 trash left

### 11. UI & UX (5 tests)

- [ ] **T11.1**: Eco-points badge (top-center) shows leaf emoji 🍃
- [ ] **T11.2**: Trees count badge shows tree emoji 🌳
- [ ] **T11.3**: Eco Score badge shows star emoji ⭐
- [ ] **T11.4**: Help text (bottom-right) explains controls
- [ ] **T11.5**: Wallet address (top-left) shows mock address

### 12. Edge Cases (5 tests)

- [ ] **T12.1**: Try to plant when eco-points = 0 (buy 10 trees first)
  - Should show "Not enough eco-points!" notification
- [ ] **T12.2**: Plant tree at boundary (x=9, z=9)
  - Should plant successfully if not in lake
- [ ] **T12.3**: Rotate camera to extreme angles
  - Should be limited by OrbitControls maxPolarAngle
- [ ] **T12.4**: Close and reopen seed menu multiple times
  - Should work smoothly without errors
- [ ] **T12.5**: Spam click trash/trees rapidly
  - Should handle all clicks correctly

---

## 🎯 Critical Path (Must Pass)

These 10 tests **MUST** pass for prototype to be considered functional:

1. ✅ Landing screen loads
2. ✅ Can enter forest
3. ✅ Terrain with hills visible
4. ✅ Can open plant menu (button method)
5. ✅ Can plant a tree
6. ✅ Eco-points deduct correctly
7. ✅ Can water a tree
8. ✅ Can clean trash
9. ✅ Weather toggle works
10. ✅ Data persists after refresh

---

## 🐛 Known Limitations

These are **expected** limitations of the prototype:

1. **Growth is slow**: Default 30min/60min/120min for stages (can modify in storage.ts)
2. **No friend visits**: Sample forests exist but UI not built in this version
3. **No leaderboards**: Scoring function exists but no UI
4. **No missions**: Not implemented in self-contained version
5. **No decorations**: Only trees for now
6. **Max 30 objects**: To keep stable (15 trees + 15 trash/rocks)
7. **Simple animations**: No physics, just CSS transforms

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________

CRITICAL PATH:
[ ] Landing loads
[ ] Enter forest
[ ] Terrain visible
[ ] Plant menu opens
[ ] Can plant tree
[ ] Eco-points deduct
[ ] Can water tree
[ ] Can clean trash
[ ] Weather toggles
[ ] Data persists

FULL TEST SCORE: ___/87 tests passed

ISSUES FOUND:
1. _________________________
2. _________________________
3. _________________________

NOTES:
_________________________________
_________________________________
_________________________________
```

---

## 🚨 Emergency Fixes

### If prototype doesn't load:

1. **Check console** (F12 → Console tab)
2. **Clear localStorage**: 
   ```javascript
   localStorage.clear()
   location.reload()
   ```
3. **Verify WebGL**: Visit https://get.webgl.org/
4. **Try different browser**: Chrome recommended

### If trees don't appear:

1. **Check eco-points**: Must have ≥50 for Oak
2. **Check seed menu**: Should show species
3. **Check console**: Look for errors
4. **Try debug panel**: Add eco-points manually

### If growth doesn't work:

1. **Open DevTools** → Application → localStorage
2. **Find** `ecoforest_self_contained`
3. **Check** `trees` array has `plantedAt` timestamps
4. **Wait** at least 30 minutes or modify timestamps manually

---

## ✅ Sign-Off

**Prototype Version**: 1.0.0  
**Test Date**: ___________  
**Tested By**: ___________  
**Status**: [ ] PASS [ ] FAIL  
**Ready for Demo**: [ ] YES [ ] NO

**Signature**: ___________

---

**Happy Testing! 🌳✨**
