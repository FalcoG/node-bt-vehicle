import Joystick from '@hkaspy/joystick-linux'
import config from './config.json' assert { type: "json" }
import { stadiaMapper } from './lib/stadia-input-map.js'

const dcs = Object.values(config.wheels).map(wheel => {
  return wheel.dc
})

console.log('dcs', dcs)

const stick = new Joystick("/dev/input/js0", { mappingFn: stadiaMapper })
stick.on("update", (ev) => console.log(ev))
