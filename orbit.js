config = {
  bgColor: '#FF3333',
  fgColor: '#FFFFFF',
  planetRadius: 600,
  planetPos: [300, 480 + 600 - 100],
  G: 10000000,
  shipVertices: [[-5, -10], [0, -16], [5, -10], [5, 10], [9, 14], [-9, 14], [-5,10]],
  exhaustVertices: [[-6,10], [6,10], [0,25]],
  enginePower: 82,
  fuelConsumption: 1,
  pitchoverTime: 1,
  dt: 1 / 60,
  timeSpeedup: 1,
  plotCourse: true
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
  uiSet('timeSpeedup', config.timeSpeedup)
  uiSet('plotCourse', config.plotCourse)

  var launchPressed = false
  document.getElementById('launch').addEventListener('click', function() {
    launchPressed = true
  })
  var renderFrame = 0;

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
      config.timeSpeedup = parseFloat(uiGet('timeSpeedup'))
      config.plotCourse = uiGet('plotCourse')
      state = null
    }
    for (var i=0; i<config.timeSpeedup; i++)
      state = update(state, input, config.dt)
    render(state)
    if (renderFrame++ % 10 == 0)
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
      fuel: input.fuel,
      dots: []
    }
  else if(oldState.isCrash)
    return oldState

  var gravity = rk4(gravityAt, oldState.shipPos, dt).mul(dt)
  var thrust = (oldState.fuel > 0
    ? (oldState.time > config.pitchoverTime ? vectorFromAngle(input.thrustAngle/180*Math.PI) : [0,-1])
    : [0, 0]).mul(config.enginePower * dt)
  var newV = oldState.shipV.add(gravity).add(thrust)
  var dots = config.plotCourse
    ? (oldState.dots.concat(oldState.frame % 30 == 0 ? [oldState.shipPos] : []))
    : []
  return {
    frame: oldState.frame + 1,
    time: oldState.time + dt,
    shipPos: oldState.shipPos.add(oldState.shipV.add(newV).mul(dt/2)),
    shipV: newV,
    fuel: Math.max(0, oldState.fuel - config.fuelConsumption),
    isCrash: config.planetPos.sub(oldState.shipPos).norm() < config.planetRadius,
    dots: dots
  }

  function gravityAt(p) {
    var d = p.sub(config.planetPos).norm()
    return config.planetPos.sub(p).unit().mul(config.G / (d*d))
  }

  function rk4(fn, pos, dt) {
    var k1 = fn(pos)
    var k2 = fn(pos.add(k1.mul(dt/2)))
    var k3 = fn(pos.add(k2.mul(dt/2)))
    var k4 = fn(pos.add(k3.mul(dt)))
    return k1.add(k2.add(k3).mul(2)).add(k4).mul(1/6)
  }
}

function renderStats(state) {
  uiSet('time', (state.time).toFixed(2))
  uiSet('speed', (state.shipV.norm()).toFixed(2))
  uiSet('altitude', (state.shipPos.sub(config.planetPos).norm() - config.planetRadius).toFixed(2))
  uiSet('heading', (state.shipV.angle()*180/Math.PI).toFixed(0))
}

function uiSet(id, value) {
  var e = document.getElementById(id)
  if (e.type == 'checkbox')
    e.checked = value
  else if (e.type == 'text')
    e.value = value
  else
    e.textContent = value
}

function uiGet(id) {
  var e = document.getElementById(id)
  return e.type == 'checkbox' ? e.checked : e.value
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

  state.dots.forEach(function(e) {
    gc.beginPath()
    gc.arc(e[0], e[1], 2, 0, Math.PI*2)
    gc.fill()
  })

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
