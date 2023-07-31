import fs from 'fs';

import Joystick from '@hkaspy/joystick-linux'
import MotorHat from 'motor-hat'

// import config from './config.json' assert { type: 'json' }
import { stadiaMapper } from './lib/stadia-input-map.js'

const config = JSON.parse(
  fs.readFileSync(
    new URL('./config.json', import.meta.url)
  ).toString()
);

const dcs = Object.values(config.wheels).map(wheel => {
  return wheel.dc
})

function killSwitch () {
  motorHat.dcs.forEach((dc) => {
    dc.stop()
    on = false
  })
}
console.log('dcs', dcs)

const stick = new Joystick('/dev/input/js0', { mappingFn: stadiaMapper })

const maxTrigger = Math.pow(2,16) - 1

let on = false;
stick.on('update', (ev) => {
  console.log(ev)
  if (ev.name === 'RIGHT_TRIGGER') {
    if (ev.value > 0) {
      const speed = 1 / (maxTrigger - 1) * ev.value
      console.log('current speed', speed)

      if (!on) {
        Object.values(config.wheels).forEach(wheel => {
          const dc = motorHat.dcs[wheel.dc]
          dc.runSync(wheel.orientation === 'forwards' ? 'fwd' : 'back');
        })

        on = true // race condition fail
      }

      motorHat.dcs.forEach((dc) => {
        dc.setSpeed(speed)
      })
    } else {
      killSwitch()
    }
  }
})

stick.on('disconnect', () => {
  console.log('disconnected')
  killSwitch()
})

stick.on('error', (err) => {
  console.log('Error!', err)
  killSwitch()
})

let spec = {
  address: 0x60,
  steppers: [],
  dcs: ['M1', 'M2', 'M3', 'M4'],
  servos: []
};

const motorHat = MotorHat(spec);

// Since MotorHat 2.0, the instance needs to be initialized.
// This is to enable async initialization, feel free to open an issue if this i>
motorHat.init();



// Start dc motor forward (by default at 100% speed)
// motorHat.dcs[0].runSync('fwd');


// setTimeout(() => { motorHat.dcs[0].setSpeedSync(50); }, 1000);
// setTimeout(() => { motorHat.dcs[0].runSync('back'); }, 2000);
// setTimeout(() => { motorHat.dcs[0].stopSync();  }, 3000);
