config = {
  bgColor: '#FF3333',
  fgColor: '#FFFFFF',
  planetRadius: 600,
  shipVertices: [[-5, -10], [0, -16], [5, -10], [5, 10], [9, 14], [-9, 14], [-5,10]],
  maxRuntime: 3,
}

initialState = {
  frame: 0,
  time: 0,
  shipPos: [200, 200],
  shipV: [100, 0],
  shipAngle: 0,
  shipAngleV: Math.PI*2
}

window.onload = function() {
  window.requestAnimationFrame(tick.bind(null, initialState))
}

function tick(state, time) {
  state = update(state, time / 1000)
  render(state)
  if (time/1000 < config.maxRuntime)
    window.requestAnimationFrame(tick.bind(null, state))
}

function update(oldState, newTime) {
  var dt = newTime - oldState.time
  return {
    time: newTime,
    frame: oldState.frame + 1,
    shipPos: oldState.shipPos.add(oldState.shipV.mul(dt)),
    shipV: oldState.shipV,
    shipAngle: oldState.shipAngle + oldState.shipAngleV * dt,
    shipAngleV: oldState.shipAngleV
  }
}

function render(state) {
  var canvas = document.getElementById('canvas')
  gc = canvas.getContext('2d')
  gc.fillStyle = config.bgColor
  gc.fillRect(0, 0, canvas.width, canvas.height)

  gc.fillStyle = config.fgColor
  gc.beginPath()
  gc.arc(canvas.width/2, canvas.height + config.planetRadius - 100, config.planetRadius, 0, Math.PI*2)
  gc.fill()

  drawShip(gc, state.shipPos[0], state.shipPos[1], state.shipAngle)
}

function drawShip(gc, x, y, a) {
  gc.save()
  gc.beginPath()
  gc.fillStyle = config.fgColor
  gc.translate(x, y)
  gc.rotate(a)
  config.shipVertices.forEach(function(e, i) {
    i==0 ? gc.moveTo(e[0], e[1]) : gc.lineTo(e[0], e[1])
  })
  gc.fill()
  gc.restore()
}