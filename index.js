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

const stick = new Joystick('/dev/input/js0', { mappingFn: stadiaMapper })

const maxTrigger = Math.pow(2,16) - 1

class Driver {
  powered = false
  motorHat = undefined

  constructor(config) {
    this.config = config
    const dcs = Object.values(config.wheels).map(wheel => {
      return wheel.dc
    })

    let spec = {
      address: 0x60,
      steppers: [],
      dcs: dcs,
      servos: []
    }

    this.motorHat = MotorHat(spec)
    this.motorHat.init()
  }

  forward(speed) {
    if (speed > 1 ) return
    console.log('current speed', speed)

    if (!this.powered) {
      Object.values(this.config.wheels).forEach((wheel, index) => {
        const dc = this.motorHat.dcs[index]
        dc.run(wheel.orientation === 'forwards' ? 'fwd' : 'back');
      })

      this.powered = true // race condition fail
    }

    this.motorHat.dcs.forEach((dc) => {
      dc.setSpeed(speed)
    })
  }

  stop() {
    this.motorHat.dcs.forEach((dc) => {
      dc.stop()
    })

    this.powered = false // race condition fail
  }

  // unexpected events
  kill() {
    this.stop()
  }
}

const vehicle = new Driver(config)

stick.on('update', (ev) => {
  console.log(ev)
  if (ev.name === 'RIGHT_TRIGGER') {
    if (ev.value > 0) {
      const speed = 1 / (maxTrigger - 1) * ev.value
      vehicle.forward(speed)
    } else {
      vehicle.stop()
    }
  }
})

stick.on('disconnect', () => {
  console.log('disconnected')
  vehicle.kill()
})

stick.on('error', (err) => {
  console.log('Error!', err)
  vehicle.kill()
})
