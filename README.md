# taiko-pp-calc

An easy module for calculating osu!taiko pp score

**Usage:**
```javascript
var taiko = require('taiko-pp-calc');
var score = new taiko(beatmapContent, stars, mods, combo, accuracy, misses);

console.log(score.pp) // Outputs PP value
```

**taiko** parameters:
  - `.pp` - pp value
  - `.fcpp` - pp value for the same accuracy but Full Combo
  - `.maxpp` - **SS** pp value
  - `.maxCombo` - max combo on the map