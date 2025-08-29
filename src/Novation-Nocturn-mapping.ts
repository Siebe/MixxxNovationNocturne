
var MixxxMapping: any = {
  mixer : {
      buttons: [ 
          {type : 'toggle', groupType: 'Channel@', controlMap: 'play'},
          {type : 'toggle', groupType: 'Channel@', controlMap: 'sync_enabled', },
          {type : 'button', groupType: 'Channel@', controlMap: 'rate_temp_down_small'},
          {type : 'button', groupType: 'Channel@', controlMap: 'rate_temp_up_small'},
      ],
      knobs: [ 
          {type : 'signedRelative', groupType: 'Channel@', controlMap: 'rate', defaultValue: 0.5},
          {type : 'relative', groupType: 'Channel@', controlMap: 'filterLow', defaultValue: 0.5},
          {type : 'relative', groupType: 'Channel@', controlMap: 'filterHigh', defaultValue: 0.5},
          {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect1', controlMap: 'meta', defaultValue: 0.52},
          {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect1', controlMap: 'meta', defaultValue: 0.52},
          {type : 'relative', groupType: 'Channel@', controlMap: 'filterHigh', defaultValue: 0.5},
          {type : 'relative', groupType: 'Channel@', controlMap: 'filterLow', defaultValue: 0.5},
          {type : 'signedRelative', groupType: 'Channel@', controlMap: 'rate', defaultValue: 0.5},
      ]   
  },
  inst : {
      buttons: [ 
          {type : 'button', groupType: 'Channel@', controlMap: 'beatloop_activate'},
          {type : 'button', groupType: 'Channel@', controlMap: 'reloop_toggle', },
          {type : 'button', groupType: 'Channel@', controlMap: 'loop_in'},
          {type : 'button', groupType: 'Channel@', controlMap: 'loop_out'},
      ],
      knobs: [ 
          {type : 'nudge', groupType: 'Channel@', controlMap: ['rate_temp_down','rate_temp_up'] },
          {type : 'relative', groupType: 'Channel@', controlMap: 'filterLow', defaultValue: 0.5},
          {type : 'relative', groupType: 'Channel@', controlMap: 'filterHigh', defaultValue: 0.5},
          {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect1', controlMap: 'meta', defaultValue: 0.52},
          {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect1', controlMap: 'meta', defaultValue: 0.52},
          {type : 'relative', groupType: 'Channel@', controlMap: 'filterHigh', defaultValue: 0.5},
          {type : 'relative', groupType: 'Channel@', controlMap: 'filterLow', defaultValue: 0.5},
          {type : 'nudge', groupType: 'Channel@', controlMap: ['rate_temp_down','rate_temp_up'] },
      ]   
  },
  
  fx : {
     buttons: [ 
        {type : 'toggle', groupType: 'Channel@', controlMap: 'play'},
         {type : 'toggle', groupType: 'EffectRack1_EffectUnit@_Effect3', controlMap: 'enabled'},
         {type : 'toggle', groupType: 'EffectRack1_EffectUnit@_Effect2', controlMap: 'enabled'},
         {type : 'toggle', groupType: 'EffectRack1_EffectUnit@_Effect1', controlMap: 'enabled'},
         {type : 'toggle', groupType: 'EffectRack1_EffectUnit@_Effect1', controlMap: 'enabled'},
         {type : 'toggle', groupType: 'EffectRack1_EffectUnit@_Effect2', controlMap: 'enabled'},
         {type : 'toggle', groupType: 'EffectRack1_EffectUnit@_Effect3', controlMap: 'enabled'},
         {type : 'toggle', groupType: 'Channel@', controlMap: 'play'},
     ],
     knobs: [ 
         {type : 'nudge', groupType: 'Channel@', controlMap: ['rate_temp_down','rate_temp_up'] },
         {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect3', controlMap: 'meta', defaultValue: 0.0},
         {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect2', controlMap: 'meta', defaultValue: 0.0},
         {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect1', controlMap: 'meta', defaultValue: 0.52},
         {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect1', controlMap: 'meta', defaultValue: 0.52},
         {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect2', controlMap: 'meta', defaultValue: 0.0},
         {type : 'relative', groupType: 'EffectRack1_EffectUnit@_Effect3', controlMap: 'meta', defaultValue: 0.0},
         {type : 'nudge', groupType: 'Channel@', controlMap: ['rate_temp_down','rate_temp_up'] },
     ]   
 }

}

var NNMapping: any = {
     
  inputs : {
    0x40 : { id : 'knob:0:value', type : 'relative'},
    0x41 : { id : 'knob:1:value', type : 'relative'},
    0x42 : { id : 'knob:2:value', type : 'relative'},
    0x43 : { id : 'knob:3:value', type : 'relative'},
    0x44 : { id : 'knob:4:value', type : 'relative'},
    0x45 : { id : 'knob:5:value', type : 'relative'},
    0x46 : { id : 'knob:6:value', type : 'relative'},
    0x47 : { id : 'knob:7:value', type : 'relative'},
    
    0x48 : { id : 'crossfader.value', type : 'absolute'},
    0x49 : { id : 'crossfader.?something', type : 'switch'},
    
    0x4A : { id : 'speeddail.value', type : 'relative'},
    0x51 : { id : 'speeddail.press', type : 'press'}, 
    0x52 : { id : 'speeddail.touch', type : 'touch'}, 
    
    0x53 : { id : 'crossfader.touch', type : 'touch'},
    
    0x60 : { id : 'knob:0:touch', type : 'touch'},
    0x61 : { id : 'knob:1:touch', type : 'touch'},
    0x62 : { id : 'knob:2:touch', type : 'touch'},
    0x63 : { id : 'knob:3:touch', type : 'touch'},
    0x64 : { id : 'knob:4:touch', type : 'touch'},
    0x65 : { id : 'knob:5:touch', type : 'touch'},
    0x66 : { id : 'knob:6:touch', type : 'touch'},
    0x67 : { id : 'knob:7:touch', type : 'touch'},
    
    0x70 : { id : 'button:0:press', type : 'press'},
    0x71 : { id : 'button:1:press', type : 'press'},
    0x72 : { id : 'button:2:press', type : 'press'},
    0x73 : { id : 'button:3:press', type : 'press'},
    0x74 : { id : 'button:4:press', type : 'press'},
    0x75 : { id : 'button:5:press', type : 'press'},
    0x76 : { id : 'button:6:press', type : 'press'},
    0x77 : { id : 'button:7:press', type : 'press'},
    0x78 : { id : 'button:8:press', type : 'press'}, //learn
    0x79 : { id : 'button:9:press', type : 'press'}, //view
    0x7A : { id : 'button:A:press', type : 'press'}, //page -
    0x7B : { id : 'button:B:press', type : 'press'}, //page +
    0x7C : { id : 'button:C:press', type : 'press'}, //user
    0x7D : { id : 'button:D:press', type : 'press'}, //fx
    0x7E : { id : 'button:E:press', type : 'press'}, //inst
    0x7F : { id : 'button:F:press', type : 'press'}, //mixer
  },
  
  outputs : {
    0x40 : { id : 'knob:0:ledValue', type : 'ledValue'},
    0x41 : { id : 'knob:1:ledValue', type : 'ledValue'},
    0x42 : { id : 'knob:2:ledValue', type : 'ledValue'},
    0x43 : { id : 'knob:3:ledValue', type : 'ledValue'},
    0x44 : { id : 'knob:4:ledValue', type : 'ledValue'},
    0x45 : { id : 'knob:5:ledValue', type : 'ledValue'},
    0x46 : { id : 'knob:6:ledValue', type : 'ledValue'},
    0x47 : { id : 'knob:7:ledValue', type : 'ledValue'},
    
    0x48 : { id : 'knob:0:ledType', type : 'ledType'},
    0x49 : { id : 'knob:1:ledType', type : 'ledType'},
    0x4A : { id : 'knob:2:ledType', type : 'ledType'},
    0x4B : { id : 'knob:3:ledType', type : 'ledType'},
    0x4C : { id : 'knob:4:ledType', type : 'ledType'},
    0x4D : { id : 'knob:5:ledType', type : 'ledType'},
    0x4E : { id : 'knob:6:ledType', type : 'ledType'},
    0x4F : { id : 'knob:7:ledType', type : 'ledType'},
    
    0x50 : { id : 'speeddail:ledValue', type : 'ledValue'},
    0x51 : { id : 'speeddail:ledType', type : 'ledType'},
    
    0x70 : { id : 'button:0:ledSwitch', type : 'ledSwitch'},
    0x71 : { id : 'button:1:ledSwitch', type : 'ledSwitch'},
    0x72 : { id : 'button:2:ledSwitch', type : 'ledSwitch'},
    0x73 : { id : 'button:3:ledSwitch', type : 'ledSwitch'},
    0x74 : { id : 'button:4:ledSwitch', type : 'ledSwitch'},
    0x75 : { id : 'button:5:ledSwitch', type : 'ledSwitch'},
    0x76 : { id : 'button:6:ledSwitch', type : 'ledSwitch'},
    0x77 : { id : 'button:7:ledSwitch', type : 'ledSwitch'},
    0x78 : { id : 'button:8:ledSwitch', type : 'ledSwitch'}, //learn
    0x79 : { id : 'button:9:ledSwitch', type : 'ledSwitch'}, //view
    0x7A : { id : 'button:A:ledSwitch', type : 'ledSwitch'}, //page -
    0x7B : { id : 'button:B:ledSwitch', type : 'ledSwitch'}, //page +
    0x7C : { id : 'button:C:ledSwitch', type : 'ledSwitch'}, //user
    0x7D : { id : 'button:D:ledSwitch', type : 'ledSwitch'}, //fx
    0x7E : { id : 'button:E:ledSwitch', type : 'ledSwitch'}, //inst
    0x7F : { id : 'button:F:ledSwitch', type : 'ledSwitch'}, //mixer
  }
}


