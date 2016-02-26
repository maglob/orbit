config = {
  bgColor: '#FF3333',
  fgColor: '#FFFFFF',
  planetRadius: 600,
  shipVertices: [[-5, -10], [0, -16], [5, -10], [5, 10], [9, 14], [-9, 14], [-5,10]]
}

window.onload = function() {
  console.log("ping")
  render()
}

function render() {
  var canvas = document.getElementById('canvas')
  gc = canvas.getContext('2d')
  gc.fillStyle = config.bgColor
  gc.fillRect(0, 0, canvas.width, canvas.height)

  gc.fillStyle = config.fgColor
  gc.beginPath()
  gc.arc(canvas.width/2, canvas.height + config.planetRadius - 100, config.planetRadius, 0, Math.PI*2)
  gc.fill()

  drawShip(gc, 200, 100)
}

function drawShip(gc, x, y) {
  gc.save()
  gc.beginPath()
  gc.fillStyle = config.fgColor
  gc.translate(x, y)
  gc.rotate(Math.PI/4)
  config.shipVertices.forEach(function(e, i) {
    i==0 ? gc.moveTo(e[0], e[1]) : gc.lineTo(e[0], e[1])
  })
  gc.fill()
  gc.restore()
}