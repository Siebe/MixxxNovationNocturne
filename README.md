# MixxxNovationNocturne


A controller script for using the 2008 *Novation Nocturn* MIDI controller with the open source **Mixxx** DJ Software

The script aims to redefine the functionalities of various buttons and add more mapping options on top of the default mapping Mixxx provides (or used to provide...).

https://mixxx.org/
https://web.archive.org/web/20120115150528/http://us.novationmusic.com/products/midi_controller/nocturn


## Installing

You will need npm to build the typescript files and set up the controller:  
https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

### Linux

Run the following command to build and copy the files:  
```npm run setup```

### Other
On other platforms you can build the script and manually copy the all the generated files in the `./dist` folder to the `controller` folder located somewhere in the Mixxx Application older.
Run the following command to build the files:
```npm run build```

The following files need to be copied:
`./dist`

Note that the repository is saved including the `./dist` directory and an XML Midi mapping file in it.

## Usage

Just plug in your *Novation Nocture* in your computer with USB and run Mixxx, it should automatically detect the controller and the script.

After that, just play with it. 

What is nice to know beforehand though:
- There thee pre-programmed mappings under the "mixer", "inst" and "fx" button.
- When you're still touching a knob while switching mappings, the knob will still control the same "old" output control, untill you release the knob.
- "Double-tapping" a knob will reset it to its default value
- Mappings, including the fourth "user" page, can be configured in a separate file


##  Extended Mapping Options

The script includes an "intermediary" mapping file called `./src/Novation-Nocturn-Mapping.ts` which users can edit instead of the regular XML-based Midi mapping file required with Mixxx. In the XML mapping file that comes with the script, all mapping is being diverted to the script engine and should not be edited.  
However, if you own a *Nocturn 25* or *Nocturn 49* you should be able to adapt the XML file to map the additional note keys.

You can either adapt the `./src/Novation-Nocturn-Mapping.ts` and re-setup the controller script or adapt the ```Novation-Nocturn-Mapping.js``` file in your Mixxx Applications controller folder.

### NNMapping Object

The Novation-Nocturne-Mapping.js file contains two configuration objects, the last one being 'NNMapping'. This object maps the MIDI channel ID's to the internal identifier of that input ('id') and the type of controller that input has ('type'). The type part is currently not used, but I left it as a sort of note

### MixxxMapping

The other configurable object is 'MixxMapping'. This will map the internal identifiers defined by 'NNMapping' towards the controls of Mixxx, including some extra options.

#### Main MixxMapping Keys and Function Buttons

There are 4 buttons assigned as "Function Page" buttons. Each of these "pages" has their own mapping and the buttons are reserved for switching these mappings. 
The function page names correlate with the buttons. These names are also the 4 main keys of the 'MixxMapping' object:
- 'mixer'
- 'inst'
- 'fx'
- 'user'

Each of the main keys contains another object with a mapping of 4 or 8 knobs and 4 or 8 buttons. The default page at startup is 'mixer'

#### Mapping Page Object

Only the upper layer of buttons is mappable. All knobs, except the "speed dial" knob are mappable. Each mapping object has two keys each for:
- 'buttons'
- 'knobs'

Each of the buttons or knob keys should contain an array with either 4 or 8 Mapping Items. If there are 4 Mapping Items in the array, the items will be repeated for the other 4 knobs or buttons. 

#### Mapping Item Object

Every Mapping Item Object will have a type, an input identifier, and output group and output identifier as wel as extra options depending on its type:
- 'type': What type of input is expected and how it should be processed, the options differ for the buttons and knobs
- 'groupType': The output group type as defined by Mixxx
- 'controlMap': The output control functionality as defined by Mixxx. This can optionally be an array of two mappings and the second control will receive an inverted value.
- 'defaultValue': The value the control will be initialized with when the script starts and, in the case of knobs, the value it will jump to after a "Double-Tap" on the touch functionality.

Here you can find control groups and controls defined by Mixx:  
https://manual.mixxx.org/2.5/en/chapters/appendix/mixxx_controls.html

These are the possible input types for buttons:
- 'button': the buttons acts as a deads-man-switch and will expect a non-zero input when pressed and a zero input when released
- 'toggle': the button acts as a toggle and will change true/false state on any non-zero input

These are the possible input types for knobs:
- 'absolute': the input value is expected be between 0x00 and 0x127 and will be parsed accordingly.
- 'relative': the input value is expected to be 0x01 when the control value should increase and 0xFF when the control value decreases.
- 'signedRelative': same as relative, but the control output value can be negative (e.g. pitch)
- 'nudge': the input value is expected to be non-zero and the output value will be true for 50ms, configurable in-code as 'KNOB_NUDGE_LENGTH'

# Todo List

- Add typescript definitions, especially for the mapping objects, to clarify
- Use the "page +" and "page -" buttons to select other decks
- Use the "speed dial" to set (last touched) knob sensitivity and have default sensitivity setting in mapping object
- Some nice functionalities for the "learn" and "view" buttons, or perhaps make them mappable
- Add tests 

#  Disclaimer

Copyright (C) 2025 J.F. Kenjedie - jayeffkay84@gmail.com

This script is provided "as is" without any warranties or guarantees of any kind, either express or implied. 
The author and contributors are not affiliated with, endorsed by, or responsible for the manufacturer of the "Novation Nocturn" device. 
The use of this script with the device is at your own risk, and the author shall not be liable for any damages arising from its use.