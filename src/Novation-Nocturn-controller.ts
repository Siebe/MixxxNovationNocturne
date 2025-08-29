/*
 * A controller script for using the Novation Nocturn with Mixxx
 *
 * Copyright (C) 2024 J.F. Kenjedie - jayeffkay84@gmail.com
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */


/*
 * Adapt KNOB_NUDGE_LENGTH and KNOB_DOUBLETAP_INTERVAL to tweak the DOUBLETAP functionality
 */
const KNOB_NUDGE_LENGTH = 50
const KNOB_DOUBLETAP_INTERVAL = 250

/*
 * Toggle CROSFADER_DOUBLETAP and DOUBLETAP on crossfader will set it to center.
 */
const CROSFADER_DOUBLETAP = false

/*
 * Leave the code after this
 */

const FUNCTIONPAGE_USER = 'user'
const FUNCTIONPAGE_FX = 'fx'
const FUNCTIONPAGE_INST = 'inst'
const FUNCTIONPAGE_MIXER = 'mixer'

const CROSSFADER_GROUP = '[Master]'
const CROSSFADER_CONTROL = 'crossfader'

//const FUNCTION_PAGES: string[] = [ FUNCTIONPAGE_USER, FUNCTIONPAGE_FX, FUNCTIONPAGE_INST, FUNCTIONPAGE_MIXER ]

const DOUBLETAP_STATUS_CLEAR = 0
const DOUBLETAP_STATUS_FIRST_TOUCH = 1
const DOUBLETAP_STATUS_FIRST_RELEASE = 2
const DOUBLETAP_STATUS_SECOND_TOUCH = 3

const ONE_127TH = 0.00787401574

const LEDTYPE_NORMAL = 0
const LEDTYPE_MIDDLEOUT = 32

let NNReversedMapping: any = {}
var NNController: any = {}

//declare var console, engine, midi: any;


console.log("NNController 0.1b for Novation Nocturne loading")

//====================== Initialize and shutdown 


NNController.init = function () {
	console.log("NNController 0.1b for Novation Nocturne initializing")
	if (!NNMapping) {
		throw new Error("NNController.init could not find NNMapping file")
	}

	this.currentDeckPage = 0
	this.currentFunctionPage = false
	this.lastKnobTouch = false

	this.buttonListeners = {}
	this.knobListeners = {}
	this.knobNudgeTimers = {}
	this.knobDoubletapRecords = {}
	this.knobSpeedFactors = {}

	console.log("NNController.init creating reversed Midi map")
	const inputsOutputs = [ 'inputs', 'outputs' ]
	inputsOutputs.forEach((ioType)=> {
		NNReversedMapping[ioType] = {}
		const NNmappingInputOutput = NNMapping[ioType]
		Object.keys(NNmappingInputOutput).forEach((channel) => {
			const NNmappingInputOutputgroupId = NNmappingInputOutput[channel].id
			NNReversedMapping[ioType][NNmappingInputOutputgroupId] = channel
		})
	})

	console.log("NNController.init aditional settings")
	//as the crossfader is the only absolute controller, apply the soft take-over functionality
	engine.softTakeover(CROSSFADER_GROUP, CROSSFADER_CONTROL, true)

	console.log("NNController.init bleep and reset leds")
	this.setAllLed(1)

	engine.beginTimer(100, () => {
		this.setAllLed(0)
		this.setFunctionPage(FUNCTIONPAGE_MIXER)
		console.log("NNController.init done initializing")
	}, true)

}

NNController.shutdown = function () {
	this.clearAllListeners()
	// turn off all LEDs
	this.setAllLed(0)
}

//====================== Crossfader 

NNController.crossfaderValue = function (channel, control, value, status, group) {
	console.log([ 'NNController.crossfaderValue', channel, toHex(control),
	      toHex(value), toHex(status), group ].join(', '))
	//crossfader, simply put it through and use soft takeover functionality
	const mappedValue = value * ONE_127TH
	engine.setParameter(CROSSFADER_GROUP, CROSSFADER_CONTROL, mappedValue)
	if (CROSFADER_DOUBLETAP && this.knobDoubletapRecords[control]) {
		//always reset doubletap status if there's a change in value
		this.knobDoubletapRecords[control].status = DOUBLETAP_STATUS_CLEAR
	}
}


NNController.crossfaderTouch = function (channel, control, value, status, group) {
	console.log([ 'NNController.crossfaderTouch', channel, toHex(control), toHex(value),
	      toHex(status), group ].join(', '))
	//reset crossfader to middle on doubletap      
	const touch = value === 127
	if (CROSFADER_DOUBLETAP && this.doubleTapDetection(touch, control)) {
		const crossfaderValue = engine.getValue(CROSSFADER_GROUP, CROSSFADER_CONTROL)
		console.log(`${crossfaderValue}`)
		if (crossfaderValue < -0.15 || crossfaderValue > 0.15) {
			//temporary disable soft takeover so it won't register the reset
			engine.softTakeover(CROSSFADER_GROUP, CROSSFADER_CONTROL, false)
		}
		engine.setParameter(CROSSFADER_GROUP, CROSSFADER_CONTROL, 0.5)
		engine.softTakeover(CROSSFADER_GROUP, CROSSFADER_CONTROL, true)

	}
	 
}


//====================== Buttons
//buttons 0-7 are mapped by deckPage (Deck1&2 or Deck3&4) and functionPage (user, fx, inst, mixer)
//buttons 8-F are functional buttons

NNController.controlButtonPress = function (channel, control, value, status, group) {
	console.log([ 'NNController.controlButtonPress', channel, toHex(control), toHex(value),
      toHex(status), group ].join(', '))
	const mappedButton = NNMapping.inputs[control]
	const buttonNumber = mappedButton.id.split(':')[1]

	if (!MixxxMapping[this.currentFunctionPage] || !MixxxMapping[this.currentFunctionPage]['buttons']) {
		return
	}

	const MixxxMap = MixxxMapping[this.currentFunctionPage]['buttons'][buttonNumber]
		|| MixxxMapping[this.currentFunctionPage]['buttons'][buttonNumber % 4]

	const groupId = this.getGroupId(MixxxMap.groupType, buttonNumber)
	
	var newValue = !!value ? 1 : 0
	if (MixxxMap.type === 'toggle') {
		if (!value)
			return
		newValue = this.fetchAndMapValue(groupId, MixxxMap) ? 1 : 0
	}
	
	if (!Array.isArray(MixxxMap.controlMap)) {
		console.log([ 'NNController.handleControlButtonPress', groupId,
		      MixxxMap.controlMap, newValue ].join(', '))
		engine.setParameter(groupId, MixxxMap.controlMap, newValue)
	} else {
		console.log([ 'NNController.handleControlButtonPress', groupId,
		      MixxxMap.controlMap[0], newValue ].join(', '))
		console.log([ 'NNController.handleControlButtonPress', groupId,
		      MixxxMap.controlMap[1], 1 - newValue ].join(', '))
		engine.setParameter(groupId, MixxxMap.controlMap[0], newValue)
		engine.setParameter(groupId, MixxxMap.controlMap[1], 1 - newValue)
	}
	
}


NNController.learnButtonPress = function (channel, control, value, status, group) {
	console.log([ 'NNController.learnButtonPress', channel, toHex(control), toHex(value),
      toHex(status), group ].join(', '))
}


NNController.viewButtonPress = function (channel, control, value, status, group) {
	console.log([ 'NNController.viewButtonPress', channel, toHex(control), toHex(value),
      toHex(status), group ].join(', '))
}


NNController.deckPageButtonPress = function (channel, control, value, status, group) {
	console.log([ 'NNController.deckPageButtonPress', channel, toHex(control), toHex(value),
      toHex(status), group ].join(', '))
}


NNController.functionPageButtonPress = function (channel, control, value, status, group) {
	console.log([ 'NNController.deckPageButtonPress', channel, toHex(control), toHex(value),
      toHex(status), group ].join(', '))

	const mappedButton = NNMapping.inputs[control]
	const buttonNumber = mappedButton.id.split(':')[1]
	var functionPageInput
	switch (buttonNumber) {
		case 'C':
			functionPageInput = FUNCTIONPAGE_USER
		case 'D':
			if (!functionPageInput)
				functionPageInput = FUNCTIONPAGE_FX
		case 'E':
			if (!functionPageInput)
				functionPageInput = FUNCTIONPAGE_INST
		case 'F':
			if (!functionPageInput)
				functionPageInput = FUNCTIONPAGE_MIXER
	}

	console.log('NNController.buttonPress functionPage ' + functionPageInput)
	
	if (this.currentFunctionPage === functionPageInput || !value) {
		return
	}  

	this.setFunctionPage(functionPageInput)
}


NNController.setFunctionPage = function (value) {
	const functionPageLedChannels = {}
	functionPageLedChannels[FUNCTIONPAGE_USER] = 'button:C:ledSwitch'
	functionPageLedChannels[FUNCTIONPAGE_FX] = 'button:D:ledSwitch'
	functionPageLedChannels[FUNCTIONPAGE_INST] = 'button:E:ledSwitch'
	functionPageLedChannels[FUNCTIONPAGE_MIXER] = 'button:F:ledSwitch'

	this.previousFunctionPage = this.currentFunctionPage
	this.currentFunctionPage = value
	this.setLed(functionPageLedChannels[this.previousFunctionPage], 0)
	this.setLed(functionPageLedChannels[this.currentFunctionPage], 1)

	this.recallControls(this.currentDeckPage, this.currentFunctionPage)

}


//====================== Knobs

NNController.knobValue = function (channel, control, value, status, group) {
	console.log([ 'NNController.knobValue', channel, toHex(control), toHex(value),
      toHex(status), group ].join(', '))

	if (this.lastKnobTouch === control) {
		//immediately stop DOUBLETAP(tm) detection on this knob when changing its value
		this.knobDoubletapRecords[control].status = DOUBLETAP_STATUS_CLEAR
	}

	if (!MixxxMapping[this.currentFunctionPage] || !MixxxMapping[this.currentFunctionPage]['knobs']) {
		return
	}

	const mappedKnob = NNMapping.inputs[control]
	const knobIdSplit = mappedKnob.id.split(':')
	const knobNumber = parseInt('0x' + knobIdSplit[1])
	const MixxxMap = this.getMixxxMap(control)

	const groupId = this.getGroupId(MixxxMap.groupType, knobNumber)

	var newValue = this.fetchAndMapValue(groupId, MixxxMap)

	var MixxxControlMap = MixxxMap.controlMap
	var invertedMixxxControlMap: any = false

	if (MixxxMap.type === 'relative' || MixxxMap.type === 'signedRelative') {
		if (value === 1) {
			newValue = newValue + ONE_127TH
		}
		if (value === 127) {
			newValue = Math.max(newValue - ONE_127TH, 0)
		}
	} else if (MixxxMap.type === 'nudge') {
		if (!Array.isArray(MixxxControlMap)) {
			newValue = value
		} else {
			newValue = 1
			MixxxControlMap = MixxxMap.controlMap[(value === 1 ? 0 : 1)]
			invertedMixxxControlMap = MixxxMap.controlMap[(value === 1 ? 1 : 0)]
		}
		const nudgeId = groupId + ':' + MixxxControlMap

		if (this.knobNudgeTimers[nudgeId]) {
			console.log("NNController.knobValue knobNudgeTimer killing nudge " + nudgeId)
			engine.stopTimer(this.knobNudgeTimers[nudgeId])
		}
		this.knobNudgeTimers[nudgeId] = engine.beginTimer(KNOB_NUDGE_LENGTH,
		       () => {
			      console.log("NNController.knobValue knobNudgeTimer finished nudge "
			            + nudgeId)
			      engine.setParameter(groupId, MixxxControlMap, 0)
			      this.setLed(knobIdSplit[0] + ':' + knobIdSplit[1] + ':ledValue',
			            64)
			      this.knobNudgeTimers[nudgeId] = false;
		      }, true);

	} else if (MixxxMap.type === 'absolute') {
		newValue = value
	}

	if (invertedMixxxControlMap) {
		console.log([ 'NNController.knobValue sending inverted:', groupId,
		      MixxxControlMap, 1 - newValue ].join(', '))
		engine.setParameter(groupId, invertedMixxxControlMap, 1 - newValue)
	}

	console.log([ 'NNController.knobValue sending:', groupId, MixxxControlMap,
	      newValue ].join(', '))
	engine.setParameter(groupId, MixxxControlMap, newValue)

}


NNController.knobTouch = function (channel, control, value, status, group) {
	console.log([ 'NNController.knobTouch', channel, toHex(control), toHex(value),
      toHex(status), group ].join(', '))

 	const touch = value === 127
	      
	if (touch) {
		this.lastKnobTouch = control
	}

	if (!MixxxMapping[this.currentFunctionPage] || !MixxxMapping[this.currentFunctionPage]['knobs']) {
		return
	}

	if (this.doubleTapDetection(touch, control)) {
		const MixxxMap = this.getMixxxMap(control)
		const knobNumber = this.getKnobNumber(control)

		if (MixxxMap.defaultValue === undefined || MixxxMap.defaultValue === null) return;

		const groupId = this.getGroupId(MixxxMap.groupType, knobNumber)

		const newValue = MixxxMap.defaultValue
		var MixxxControlMap = MixxxMap.controlMap
		var invertedMixxxControlMap: any = false

		console.log([ 'NNController.knobTouch setting default value:',
		      MixxxControlMap, newValue ].join(', '))

		if (Array.isArray(MixxxControlMap)) {
			MixxxControlMap = MixxxControlMap[0]
			invertedMixxxControlMap = invertedMixxxControlMap[1]
			engine.setParameter(groupId, invertedMixxxControlMap, 1 - newValue)

		}

		engine.setParameter(groupId, MixxxControlMap, newValue)
	}
}


NNController.getKnobNumber = function (control) {
	const mappedKnob = NNMapping.inputs[control]
	const knobIdSplit = mappedKnob.id.split(':')
	return parseInt('0x' + knobIdSplit[1])
}

NNController.getMixxxMap = function (control) {
	const knobNumber = this.getKnobNumber(control)

	return MixxxMapping[this.currentFunctionPage]['knobs'][knobNumber]
	      || MixxxMapping[this.currentFunctionPage]['knobs'][knobNumber % 4]
}


//====================== Speeddail

NNController.speedDailValue = function (channel, control, value, status, group) {
	console.log([ 'NNController.knospeedDailValue', channel, toHex(control), toHex(value),
      toHex(status), group ].join(', '))
}

NNController.speedDailTouch = function (channel, control, value, status, group) {
	console.log([ 'NNController.speedDailTouch', channel, toHex(control), toHex(value),
		toHex(status), group ].join(', '))
}

NNController.speedDailPress = function (channel, control, value, status, group) {
	console.log([ 'NNController.speedDailPress', channel, toHex(control), toHex(value),
		toHex(status), group ].join(', '))
}


//====================== DoubleTap™

NNController.doubleTapDetection = function (touch, control) {
	const now = (new Date).getTime()
	const status = this.knobDoubletapRecords[control] ? this.knobDoubletapRecords[control].status
	      : DOUBLETAP_STATUS_CLEAR
	const withinInterval = this.knobDoubletapRecords[control]
	      && this.knobDoubletapRecords[control].time + KNOB_DOUBLETAP_INTERVAL > now
	
	if (touch && (status === DOUBLETAP_STATUS_CLEAR || !withinInterval)) {
		this.knobDoubletapRecords[control] = {
		   status : DOUBLETAP_STATUS_FIRST_TOUCH,
		   time : now
		}
		return false
	}  
	if (status === DOUBLETAP_STATUS_FIRST_TOUCH && touch === false
	      && withinInterval) {
		this.knobDoubletapRecords[control].status = DOUBLETAP_STATUS_FIRST_RELEASE
		return false
	} 
	if (status === DOUBLETAP_STATUS_FIRST_RELEASE && touch
	      && withinInterval) {
		this.knobDoubletapRecords[control].status = DOUBLETAP_STATUS_SECOND_TOUCH
		return false
	} 
	if (status === DOUBLETAP_STATUS_SECOND_TOUCH && touch === false
	      && withinInterval) {
		console.log([ 'NNController.doubleTapDetection DOUBLETAP™ detected:', toHex(control) ]
		      .join(', '))
   	this.knobDoubletapRecords[control].status = DOUBLETAP_STATUS_CLEAR
		return true
	}
	return false
}


//====================== Feedback from Mixxx

NNController.recallControls = function (deckPage, functionPage) {
	console.log('NNController.recallControls recalling ' + deckPage + ' '
	      + functionPage)

	this.clearAllListeners()
	if (deckPage === 0) {
		for (var i = 0; i < 8; i++) {
			const buttonId = 'button:' + i

			if (!MixxxMapping[functionPage]
			      || !MixxxMapping[functionPage]['buttons']) {
				return
			}

			var MixxxMap = MixxxMapping[functionPage]['buttons'][i]
			      || MixxxMapping[functionPage]['buttons'][i % 4]

			const groupId = this.getGroupId(MixxxMap.groupType, i)
			const control = Array.isArray(MixxxMap.controlMap) ? MixxxMap.controlMap[0]
			      : MixxxMap.controlMap
			this.setButtonListener(buttonId, groupId, control)
		}

		for (var i = 0; i < 8; i++) {
			const knobId = 'knob:' + i

			if (!MixxxMapping[functionPage]
			      || !MixxxMapping[functionPage]['knobs'])
				return

			const MixxxMap = MixxxMapping[this.currentFunctionPage]['knobs'][i]
			      || MixxxMapping[this.currentFunctionPage]['knobs'][i % 4]

			if (MixxxMap.type === 'nudge' || MixxxMap.type === 'signedRelative') {
				this.setLed(knobId + ':ledType', LEDTYPE_MIDDLEOUT)
			} else {
				this.setLed(knobId + ':ledType', LEDTYPE_NORMAL)
			}
			const control = Array.isArray(MixxxMap.controlMap) ? MixxxMap.controlMap[0]
				: MixxxMap.controlMap

			this.knobSpeedFactors[control] = MixxxMap.defaultSpeed || 1


			const groupId = this.getGroupId(MixxxMap.groupType, i)
			this.setKnobListener(knobId, groupId, MixxxMap)
		}
	}
}


NNController.getGroupId = function (groupType, controlNumber) {
	const channelNumber = Math.floor(controlNumber / 4) + this.currentDeckPage
	      + 1
	return '[' + groupType.replace('\@', channelNumber) + ']'
}


NNController.clearAllListeners = function () {
	console.log('NNController.clearAllListeners clearing all')
	const buttonIds = Object.keys(this.buttonListeners)
	for (var i = 0; i < buttonIds.length; i++) {
		this.clearButtonListener(buttonIds[i])
	}
	const knobIds = Object.keys(this.knobListeners)
	for (var i = 0; i < knobIds.length; i++) {
		this.clearKnobListener(knobIds[i])
	}
}


NNController.setButtonListener = function (buttonId, groupId, mixxxControl) {
	console.log('NNController.setButtonListener setting ' + buttonId + ' ' + groupId
	      + ' ' + mixxxControl)
	this.clearButtonListener(buttonId)
	this.buttonListeners[buttonId] = engine.makeConnection(groupId,
	      mixxxControl, (value, group, control) => {
		      console.log('NNController.[buttonListener] recieving ' + buttonId + ' '
		            + groupId + ' ' + control + ' ' + value)
		      this.setLed(buttonId + ':ledSwitch', value)
	      });
	this.buttonListeners[buttonId].trigger()
}


NNController.clearButtonListener = function (buttonId) {
	console.log('NNController.clearButtonListener clearing ' + buttonId)
	if (this.buttonListeners[buttonId]) {
		this.buttonListeners[buttonId].disconnect()
		delete this.buttonListeners[buttonId]
		if (NNReversedMapping[buttonId + ':ledSwitch']) {
			this.setLed(buttonId + ':ledSwitch', 0)
		}

	}
}


NNController.setKnobListener = function (knobId, groupId, MixxxMap) {

	console.log('NNController.setKnobListener setting ' + knobId + ' ' + groupId + ' '
	      + MixxxMap.controlMap)
	this.clearKnobListener(knobId)
	var MixxxControl = MixxxMap.controlMap
	var invertedControl: any = false

	if (Array.isArray(MixxxMap.controlMap)) {
		this.clearKnobListener(knobId + '-inv')
		MixxxControl = MixxxMap.controlMap[0]
		invertedControl = MixxxMap.controlMap[1]
	}

	this.knobListeners[knobId] = engine.makeConnection(groupId, MixxxControl,
	      (value, group, control) => {
		      console.log('NNController.[knobListener] recieving ' + knobId + ' '
		            + groupId + ' ' + control + ' ' + value)
		      var ledValue = value * 127;
		      if (MixxxMap.type === 'signedRelative') {
		      	ledValue += 64
		      }
		      if (MixxxMap.type === 'nudge' && ledValue === 0) {
			      ledValue = 64
		      }
		      this.setLed(knobId + ':ledValue', ledValue)
	      });
	this.knobListeners[knobId].trigger()

	if (invertedControl) {
		this.knobListeners[knobId + '-inv'] = engine.makeConnection(groupId, invertedControl,
			(value, group, control)=> {
			      console.log('NNController.[knobListener] inverted recieving ' + knobId
			            + ' ' + groupId + ' ' + control + ' ' + value)
			      var ledValue = 127 - (value * 127);
			      if (MixxxMap.type === 'nudge' && ledValue === 127) {
				      ledValue = 64
			      }
			      this.setLed(knobId + ':ledValue', ledValue)
		      });
		this.knobListeners[knobId + '-inv'].trigger()
	}
}


NNController.clearKnobListener = function (knobId) {
	console.log('NNController.clearKnobListener clearing ' + knobId)
	if (this.knobListeners[knobId]) {
		this.knobListeners[knobId].disconnect()
		delete this.buttonListeners[knobId]
		if (NNReversedMapping[knobId + ':ledValue']) {
			this.setLed(knobId + ':ledValue', 0)
		}

	}
}

NNController.fetchAndMapValue = function (groupId, MixxxMap) {
	console.log('NNController.fetchAndMapValue fetching ' + groupId + ' '
	      + MixxxMap.type + ' ' + MixxxMap.controlMap)
	if (MixxxMap.type === 'button') {
		return !!engine.getValue(groupId, MixxxMap.controlMap) ? 0 : 1
	} else if (MixxxMap.type === 'toggle') {
		if (Array.isArray(MixxxMap.controlMap)) {
			if (engine.getValue(groupId, MixxxMap.controlMap[1])) {
				return 1
			}
			return 0
		}
		return !!engine.getValue(groupId, MixxxMap.controlMap) ? 0 : 1
	} else if (MixxxMap.type === 'nudge') {
		//doesn't matter
		return 0
	} else {
		return engine.getParameter(groupId, MixxxMap.controlMap)
	}
}

//====================== Led controls

NNController.setAllLed = function (value) {
	console.log('NNController.setAllLed ' + value)
	const NNMappingIds = Object.keys(NNReversedMapping.outputs)
	console.log(`${NNMappingIds}`)
	for (var i = 0; i < NNMappingIds.length; i++) {
		var id = Object.keys(NNReversedMapping.outputs)[i]

		var splitId = id.split(':')
		var realValue = value;
		var controlType = splitId[splitId.length - 1]
		if (controlType.substring(0, 3) !== 'led') {
			return

		}
		if (controlType === 'ledValue') {
			realValue = value ? 127 : 0
		} else if (controlType === 'ledSwitch') {
			realValue = value ? 1 : 0
		} else if (controlType === 'ledType') {
			realValue = LEDTYPE_NORMAL
		}
		console.log(id)
		this.setLed(id, realValue)
	}
}

NNController.setLed = function (id, value) {
	console.log('NNController.setLed ' + id + ' ' + value)
	midi.sendShortMsg(0xB0, NNReversedMapping.outputs[id], value);
}

//Misc

const toHex = function (dec, noNotation = false) {
	return (!noNotation ? '0x' : '')
	      + ("0" + (Number(dec).toString(16))).slice(-2).toUpperCase()
}
