config = {
  bgColor: '#FF3333',
  fgColor: '#FFFFFF',
  planetRadius: 600,
  planetPos: [300, 480 + 600 - 100],
  G: 10000000,
  shipVertices: [[-5, -10], [0, -16], [5, -10], [5, 10], [9, 14], [-9, 14], [-5,10]],
  maxRuntime: 15
}

initialState = {
  frame: 0,
  time: 0,
  shipPos: [300, 365],
  shipV: [30, -100]
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
  var altitude = oldState.shipPos.sub(config.planetPos).norm()
  var gravity = config.planetPos.sub(oldState.shipPos).unit().mul(config.G / (altitude * altitude))
  return {
    time: newTime,
    frame: oldState.frame + 1,
    shipPos: oldState.shipPos.add(oldState.shipV.mul(dt)),
    shipV: oldState.shipV.add(gravity.mul(dt))
  }
}

function render(state) {
  var canvas = document.getElementById('canvas')
  gc = canvas.getContext('2d')

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
