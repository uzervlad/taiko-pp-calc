const osuParser = require('osu-parser');

const codes = {
    1:      'NoFail',
    2:      'Easy',
    4:      'NoVideo',
    8:      'Hidden',
    16:     'HardRock',
    32:     'SuddenDeath',
    64:     'DoubleTime',
    128:    'Relax',
    256:    'HalfTime',
    576:    'Nightcore',
    1024:   'Flashlight',
    2048:   'Autoplay',
    4096:   'SpunOut',
    8192:   'Autopilot',
    16416:  'Perfect'
}

function parseMods(m) {
    if(typeof m != "Number") m = Number(m);
    
    const enabled = [];
    
    const values = Object.keys(codes).map(a => Number(a));
    for(let i = values.length-1; i >= 0; i--) {
        if(m >= values[i]) {
            m -= values[i];
            enabled.push(codes[values[i]]);
        }
        if(m == 0)
            break;
    }
    return enabled;
}

class TaikoScore {
  /**
    @param {String} res
    @param {Number} stars
    @param {Number} mods
    @param {Number} combo
    @param {Number} accuracy
    @param {Number} misses
  */
  constructor(res, stars, mods, combo, accuracy, misses) {
    this.parsedObject = osuParser.parseContent(res);
    this.starrate = stars;
    this.totalHits = this.parsedObject.nbCircles + this.parsedObject.nbSliders + this.parsedObject.nbSpinners; // <-- ?
    this.miss = misses;
    this.combo = combo;
    this.mods = parseMods(mods);
    this.acc = accuracy;
    this.od = Number(this.parsedObject.OverallDifficulty);
    if(this.acc > 1) {
      this.acc / 100;
    }
    
    this.computeStrain(this.combo, this.miss, this.acc);
    this.computeAcc(this.acc);
    this.pp = this.computeTotal();
    
    this.computeStrain(this.parsedObject.maxCombo, 0, this.acc);
    this.fcpp = this.computeTotal();
    
    this.computeStrain(this.parsedObject.maxCombo, 0, 1);
    this.computeAcc(1);
    this.maxpp = this.computeTotal();
  }
  
  computeTotal() {
    if(this.mods.indexOf("Relax") != -1 || this.mods.indexOf("Autoplay") != -1 || this.mods.indexOf("Autopilot") != -1) {
      this.pp = 0;
      return;
    }
    
    let multiplier = 1.1;
    
    if(this.mods.indexOf("NoFail") != -1) multiplier *= 0.9;
    
    if(this.mods.indexOf("Hidden") != -1) multiplier *= 1.1;
    
    return Math.pow(Math.pow(this.strain, 1.1) + Math.pow(this.accValue, 1.1), 1.0 / 1.1) * multiplier;
  }
  
  computeStrain(combo, misses, acc) {
    let strainValue = Math.pow(5 * Math.max(1, this.starrate / 0.0075) - 4, 2) / 100000;
    
    let lengthBonus = 1 + 0.1 * Math.min(1, (this.totalHits / 1500));
    strainValue *= lengthBonus;
    
    strainValue *= Math.pow(0.985, misses);
    
    if(combo > 0) strainValue *= Math.min(Math.pow(combo, 0.5) / Math.pow(this.parsedObject.maxCombo, 0.5), 1)
    
    if(this.mods.indexOf('Hidden') != -1) strainValue *= 1.025;
    
    if(this.mods.indexOf('Flashlight') != -1) strainValue *= (1.05 * lengthBonus);
    
    strainValue *= acc;
    
    return this.strain = strainValue;
  }
  
  computeAcc(acc) {
    this.hitWindow300();
    
    let accValue = 0;
    
    if(this.hitWindow300 <= 0) {
      return;
    }
    
    accValue = Math.pow(150 / this.hitWindow300, 1.1) * Math.pow(this.acc, 15) * 22;
    
    accValue *= Math.min(1.15, Math.pow(this.totalHits / 1500, 0.3));
    
    return this.accValue = accValue;
  }
  
  hitWindow300() {
    this.scaleOD();
    
    var max = 50;
    var min = 20;
    var result = min + (max - min) * this.od / 10;
    
    if(this.mods.indexOf("HalfTime") != -1) result /= 0.75;
    if(this.mods.indexOf("DoubleTime") != -1) result /= 1.5;
    
    this.hitWindow300 = Math.round(result * 100) / 100;
  }
  
  scaleOD() {
    if(this.mods.indexOf("Easy") != -1) this.od /=2;
    if(this.mods.indexOf("HardRock") != -1) this.od *= 1.4;
    this.od = Math.max(Math.min(this.od, 10), 0);
  }
}

module.exports = taikoScore;