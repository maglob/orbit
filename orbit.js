config = {
  bgColor: '#FF3333',
  fgColor: '#FFFFFF',
  planetRadius: 600,
  planetPos: [300, 480 + 600 - 100],
  G: 10000000,
  shipVertices: [[-5, -10], [0, -16], [5, -10], [5, 10], [9, 14], [-9, 14], [-5,10]],
  enginePower: 80,
  fuelConsumption: 1,
  maxRuntime: 60
}

initialState = {
  frame: 0,
  time: 0,
  isCrash: false,
  shipPos: [300, 365],
  shipV: [0, -1],
  thrustV: [10, -100].unit(),
  fuel: 90
}

window.onload = function() {
  window.requestAnimationFrame(tick.bind(null, initialState))
}

function tick(state, time) {
  state = update(state, time / 1000)
  render(state)
  if (!state.isCrash && (time/1000 < config.maxRuntime))
    window.requestAnimationFrame(tick.bind(null, state))
}

function update(oldState, newTime) {
  var dt = newTime - oldState.time
  var altitude = oldState.shipPos.sub(config.planetPos).norm()
  var gravity = config.planetPos.sub(oldState.shipPos).unit().mul(config.G / (altitude * altitude))
  return {
    time: newTime,
    frame: oldState.frame + 1,
    shipPos: oldState.shipPos.add(oldState.shipV.mul(dt)),
    shipV: oldState.shipV.add(gravity.mul(dt)).add(oldState.thrustV.mul(dt * config.enginePower)),
    thrustV: oldState.fuel > 0 ? oldState.thrustV : [0, 0],
    fuel: oldState.fuel - config.fuelConsumption,
    isCrash: config.planetPos.sub(oldState.shipPos).norm() < config.planetRadius
  }
}

function render(state) {
  var canvas = document.getElementById('canvas')
  var gc = canvas.getContext('2d')

  gc.fillStyle = config.bgColor
  gc.fillRect(0, 0, canvas.width, canvas.height)

  gc.fillStyle = config.fgColor
  gc.save()
  gc.translate(config.planetPos[0], config.planetPos[1])
  fillCircle(gc, config.planetRadius)
  gc.restore()

  gc.save()
  var vy = state.shipV.unit().mul(-1)
  var vx = [-vy[1], vy[0]]
  gc.transform(vx[0], vx[1], vy[0], vy[1], state.shipPos[0], state.shipPos[1])
  fillPolygon(gc, config.shipVertices)
  gc.restore()

  document.getElementById('crash').style.display = state.isCrash ? 'block' : 'none'
}

function fillCircle(gc, r) {
  gc.beginPath()
  gc.arc(0, 0, r, 0, Math.PI*2)
  gc.fill()
}

function fillPolygon(gc, vertices) {
  gc.beginPath()
  vertices.forEach(function(e, i) {
    i==0 ? gc.moveTo(e[0], e[1]) : gc.lineTo(e[0], e[1])
  })
  gc.fill()
}
