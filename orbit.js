input = {
  thrustAngle: 0,
  fuel: 160
}

config = {
  bgColor: '#FF3333',
  fgColor: '#FFFFFF',
  planetRadius: 600,
  planetPos: [300, 480 + 600 - 100],
  shipInitialPos: [300, 365],
  shipInitialV: [0, -.1],
  G: 10000000,
  shipVertices: [[-5, -10], [0, -16], [5, -10], [5, 10], [9, 14], [-9, 14], [-5,10]],
  exhaustVertices: [[-6,10], [6,10], [0,25]],
  enginePower: 80,
  fuelConsumption: 1,
  pitchoverTime: 1,
  dt: 1 / 60
}

window.onload = function() {
  document.getElementById('fuel').value = input.fuel
  document.getElementById('angle').value = input.thrustAngle
  var launchPressed = false
  document.getElementById('launch').addEventListener('click', function() {
    launchPressed = true
  })
  render(initialState())
  window.requestAnimationFrame(tick.bind(null, initialState()))

  function tick(state, time) {
    if (launchPressed) {
      launchPressed = false
      input = {
        fuel: parseFloat(document.getElementById('fuel').value),
        thrustAngle: parseFloat(document.getElementById('angle').value)
      }
      state = initialState()
    }
    if (!state.isCrash) {
      state = update(state, config.dt)
      render(state)
      renderStats(state)
    }
    window.requestAnimationFrame(tick.bind(null, state))
  }
}

function initialState() {
  return {
    frame: 0,
    time: 0,
    isCrash: false,
    shipPos: config.shipInitialPos,
    shipV: config.shipInitialV,
    fuel: input.fuel
  }
}

function update(oldState, dt) {
  var altitude = oldState.shipPos.sub(config.planetPos).norm()
  var gravity = config.planetPos.sub(oldState.shipPos).unit().mul(config.G / (altitude * altitude))
  var thrust = oldState.fuel > 0
    ? (oldState.time > config.pitchoverTime ? vectorFromAngle(input.thrustAngle/180*Math.PI) : [0,-1])
    : [0, 0]
  return {
    frame: oldState.frame + 1,
    time: oldState.time + dt,
    shipPos: oldState.shipPos.add(oldState.shipV.mul(dt)),
    shipV: oldState.shipV.add(gravity.mul(dt)).add(thrust.mul(dt * config.enginePower)),
    fuel: Math.max(0, oldState.fuel - config.fuelConsumption),
    isCrash: config.planetPos.sub(oldState.shipPos).norm() < config.planetRadius
  }
}

function renderStats(state) {
  document.getElementById('time').textContent = (state.time).toFixed(2)
  document.getElementById('speed').textContent = (state.shipV.norm()).toFixed(2)
  document.getElementById('altitude').textContent = (state.shipPos.sub(config.planetPos).norm() - config.planetRadius).toFixed(2)
}

function render(state) {
  var canvas = document.getElementById('canvas')
  var gc = canvas.getContext('2d')

  gc.fillStyle = config.bgColor
  gc.fillRect(0, 0, canvas.width, canvas.height)

  gc.save()
  gc.translate(canvas.width/2, canvas.height/2)
  var altitude = state.shipPos.sub(config.planetPos).norm() - config.planetRadius
  var zoom =  altitude > 200 ? 200/altitude : 1
  gc.scale(zoom, zoom)
  gc.translate(-state.shipPos[0], -state.shipPos[1])

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
  if (state.fuel > 0 && state.frame % 4 >= 2)
    fillPolygon(gc, config.exhaustVertices)
  gc.restore()
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
