import config from './config.json' assert { type: "json" };

const dcs = Object.values(config.wheels).map(wheel => {
  return wheel.dc
})

console.log('dcs', dcs)
