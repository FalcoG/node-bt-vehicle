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

const debuggerCallback = (err, result) => {}

class Driver {
  powered = false
  motorHat = undefined
  direction = {
    forwards: 0,
    backwards: 0,
    heading: 'forwards',
    update: () => {
      const x = -this.direction.backwards + this.direction.forwards

      if (x === 0) this.stop()

      if (x > 0) {
        //fwd
        if (this.direction.heading !== 'forwards') {
          Object.values(this.config.wheels).forEach((wheel, index) => {
            const dc = this.motorHat.dcs[index]
            dc.run(wheel.orientation === 'forwards' ? 'fwd' : 'back', debuggerCallback);
          })

          this.direction.heading = 'forwards'
        }
      } else if (x < 0) {
        //rwd
        if (this.direction.heading !== 'backwards') {
          Object.values(this.config.wheels).forEach((wheel, index) => {
            const dc = this.motorHat.dcs[index]
            dc.run(wheel.orientation === 'forwards' ? 'back' : 'fwd', debuggerCallback);
          })

          this.direction.heading = 'backwards'
        }
      }

      this.motorHat.dcs.forEach((dc) => {
        dc.setSpeed(Math.abs(x * 100), debuggerCallback)
      })
    }
  }

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

  stop() {
    this.motorHat.dcs.forEach((dc) => {
      dc.stop(debuggerCallback)
    })

    this.direction.heading = 'idle'

    this.powered = false // race condition fail
  }

  // unexpected events
  kill() {
    this.stop()
  }
}

const vehicle = new Driver(config)

stick.on('update', (ev) => {
  // console.log(ev)
  if (ev.name === 'RIGHT_TRIGGER') {
    vehicle.direction.forwards = 1 / (maxTrigger - 1) * ev.value
    vehicle.direction.update()
  } else if (ev.name === 'LEFT_TRIGGER') {
    vehicle.direction.backwards = 1 / (maxTrigger - 1) * ev.value
    vehicle.direction.update()
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
