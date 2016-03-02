config = {
  bgColor: '#FF3333',
  fgColor: '#FFFFFF',
  planetRadius: 600,
  planetPos: [300, 480 + 600 - 100],
  G: 10000000,
  shipVertices: [[-5, -10], [0, -16], [5, -10], [5, 10], [9, 14], [-9, 14], [-5,10]],
  exhaustVertices: [[-6,10], [6,10], [0,25]],
  enginePower: 80,
  fuelConsumption: 1,
  pitchoverTime: 1,
  dt: 1 / 60
}

window.onload = function() {
  var input = {
    thrustAngle: 0,
    fuel: 160
  }
  uiSet('fuel', input.fuel)
  uiSet('angle', input.thrustAngle)

  uiSet('planetRadius', config.planetRadius)
  uiSet('G', config.G)
  uiSet('enginePower', config.enginePower)
  uiSet('fuelConsumption', config.fuelConsumption)
  uiSet('pitchoverTime', config.pitchoverTime)

  var launchPressed = false
  document.getElementById('launch').addEventListener('click', function() {
    launchPressed = true
  });

  (function tick(state) {
    if (launchPressed) {
      launchPressed = false
      input = {
        fuel: parseFloat(uiGet('fuel')),
        thrustAngle: parseFloat(uiGet('angle'))
      }
      config.planetRadius = parseFloat(uiGet('planetRadius'))
      config.G = parseFloat(uiGet('G'))
      config.enginePower = parseFloat(uiGet('enginePower'))
      config.fuelConsumption = parseFloat(uiGet('fuelConsumption'))
      config.pitchoverTime = parseFloat(uiGet('pitchoverTime'))
      state = null
    }
    state = update(state, input, config.dt)
    render(state)
    if (state.frame % 10 == 0)
      renderStats(state)
    window.requestAnimationFrame(tick.bind(null, state))
  })()
}

function update(oldState, input, dt) {
  if (!oldState)
    return {
      frame: 0,
      time: 0,
      isCrash: false,
      shipPos: config.planetPos.add([0, -config.planetRadius - 15]),
      shipV: [0, 0],
      fuel: input.fuel
    }
  else if(oldState.isCrash)
    return oldState

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
  uiSet('time', (state.time).toFixed(2))
  uiSet('speed', (state.shipV.norm()).toFixed(2))
  uiSet('altitude', (state.shipPos.sub(config.planetPos).norm() - config.planetRadius).toFixed(2))
}

function uiSet(id, value) {
  var e = document.getElementById(id)
  if (e.value == undefined)
    e.textContent = value
  else
    e.value = value
}

function uiGet(id) {
  return document.getElementById(id).value
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

  var vy = state.shipV.norm() > 0 ? state.shipV.unit().mul(-1) : [0, 1]
  var vx = [-vy[1], vy[0]]
  gc.transform(vx[0], vx[1], vy[0], vy[1], state.shipPos[0], state.shipPos[1])
  fillPolygon(gc, config.shipVertices)
  if (state.fuel > 0 && state.frame % 4 >= 2)
    fillPolygon(gc, config.exhaustVertices)
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
