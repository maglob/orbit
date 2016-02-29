Array.prototype.add = function(other) {
  return [this[0] + other[0], this[1] + other[1]]
}

Array.prototype.sub = function(other) {
  return [this[0] - other[0], this[1] - other[1]]
}

Array.prototype.mul = function(other) {
  return Array.isArray(other) ? this[0]*other[0] + this[1]*other[1] : [this[0]*other, this[1]*other]
}

Array.prototype.norm = function() {
  return Math.sqrt(this[0]*this[0] + this[1]*this[1])
}

Array.prototype.unit = function() {
  return this.mul(1 / this.norm())
}

function vectorFromAngle(a) {
  return [Math.cos(a), -Math.sin(a)]
}