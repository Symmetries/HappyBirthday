let cakeColor = '#FFFFDB';
let creamColor = '#FFFFEB';
let strawberryColor = '#C83F49';
let tableColor = '#755d3b';
let fireworkColors = [
  '#C63347',
  '#F28E63',
  '#FC7F81',
  '#FAEFC4',
  '#F9AE9B',
  '#792BB2',
  '#2E42CB',
  '#F75781',
  '#E365E4',
  '#FA5348',
]

let fireworkSpawnProbability = 0.1;

let fireworkRadius;
let particleRadius;

let maxSpawnNumber = 64;

let fireworks = [];
let particles = [];
let flames = [];

let maxParticleVel = 0.125;

let g = 0.003;
let dt = 1;

function setup() {
  let c = createCanvas(window.innerWidth, window.innerHeight);
  c.parent('p5canvas');

  let side = min(width, height);
  fireworkRadius = side / 200;
  particleRadius = fireworkRadius / 2;
}

function update() {
  if (random() < fireworkSpawnProbability) {
    // mgh = 1/2 mv**2
    // v = sqrt{2gh}
    let z = random(40, 50);
    fireworks.push({
      vel: [random(0.01, -0.01),
            -sqrt(2 * g * random(z / 2, z)),
            random(0.01, -0.01)],
      pos: [random(-z, z), 0, z],
      prev: [random(-z, z), 0, z],
      color: color(random(fireworkColors)),
      decay: 255,
    });
  }

  flames.push({
    x: random(-1, 1),
    y: random(-1, 1),
    r: random(0.9, 1),
  })

  flames.forEach(flame => {
    flame.x += random(-0.2, 0.2);
    flame.r *= random(0.95, 1);
    flame.y -= random(0.2, 0.4);
  })

  fireworks.forEach(updateEntity);
  fireworks.forEach(firework => {
    firework.decay = 255;
    if (!fireworkAlive(firework)) {
      let initialParticleVel = maxParticleVel * random(0.1, 1);
      let particleSpawnNumber = floor(maxSpawnNumber * random(0.5, 1));
      for (let i = 0; i < particleSpawnNumber; i++) {
        let [x,y,z] = [0,0,0]
        let r = 0;
        while (r < 0.001) {
          x = randomGaussian(0, 1);
          y = randomGaussian(0, 1);
          z = randomGaussian(0, 1);
          r = sqrt(x**2 + y**2 + z**2);
        }

        particles.push({
          pos: firework.pos.slice(),
          prev: firework.pos.slice(),
          vel: [firework.vel[0] + initialParticleVel * x / r,
                firework.vel[1] + initialParticleVel * y / r,
                firework.vel[2] + initialParticleVel * z / r],
          color: firework.color,
          decay: 255,
        });
      }
    }
  });

  particles.forEach(updateEntity);

  particles = particles.filter(particle => particle.pos[1] < 0 & particle.decay > 2);
  fireworks = fireworks.filter(fireworkAlive);
  flames = flames.filter(flame => flame.r > 0.01);
}

// Entity := Firework | Particle
function updateEntity(entity) {
  entity.vel[1] += g * dt;
  for (let i = 0; i < 3; i++) {
    entity.prev[i] = entity.pos[i];
    entity.pos[i] += entity.vel[i] * dt;
  }
  entity.decay = max(entity.decay * 0.95, 1);
}

function draw() {
  let w = min(width / 2.5, height / 2);
  let l = w / 2;
  let h = l / 6;

  update();
  background(0, 50);
  fireworks.forEach(e => drawEntity(e, fireworkRadius));
  particles.forEach(e => drawEntity(e, particleRadius));
  drawTable();
  drawCake(w, l, h);
  drawCandle(width / 2, 2 * height / 3 - 2 * h, l / 20, 2 * l/3, 5, 2);
  drawFlame(width / 2, 2 * height / 3 - 2 * h - 2 * l / 3, l / 15);
}

function drawCake(w, l, h) {

  for (let i = 2; i >= -2; i--) {
    fill(i % 2 == 0 ? strawberryColor : cakeColor);
    layer(width / 2, 2 * height / 3 + i * h, w, l, h);
  }

  fill(creamColor);
  strokeWeight(1);
  stroke(creamColor);
  ellipse(width / 2, 2 * height / 3 - 2 * h, w, l);
}

function drawCandle(x, y, w, h, n, m) {
  let dy = h / n;
  strokeWeight(1);

  fill(strawberryColor);
  stroke(strawberryColor);
  ellipse(x, y, w * 1.1, w/2 * 1.1);
  for (let i = 0; i < n + m; i++) {
    fill(i % 2 == 0 ? strawberryColor : '#eef');
    stroke(i % 2 == 0 ? strawberryColor : '#eef');
    let x1 = x - w / 2;
    let y1 = y - h + i * dy;
    let x2 = x - w / 2;
    let y2 = y - h + (i + 1) * dy;
    let x3 = x + w / 2;
    let y3 = y - h +  (i + 1 - m) * dy;
    let x4 = x + w / 2;
    let y4 = y - h + (i - m) * dy;

    if (y1 > y) {
      x1 = x - w / 2 + w / (m * dy) * (y1 - y);
      y1 = y;
    }

    if (y2 > y) {
      x2 = x - w / 2 + w / (m * dy) * (y2 - y);
      y2 = y;
    }

    if (y3 < y - h) {
      x3 = x - w / 2 + w / (m * dy) * (y2 - y + h);
      y3 = y - h;
    }

    if (y4 < y - h) {
      x4 = x - w / 2 + w / (m * dy) * (y1 - y + h);
      y4 = y - h;
    }

    quad(x1, y1,
         x2, y2,
         x3, y3,
         x4, y4);
  }
  
  fill('#eef');
  stroke('#eef');
  ellipse(x, y - h, w, w / 2);
}

function drawTable() {
  noStroke();
  fill(tableColor);
  rect(0, 5 * height / 7, width, 2*height / 7);
}

// Entity := Firework | Particle
function drawEntity(entity, radius) {
  let side = height;
  entity.color.setAlpha(entity.decay);
  fill(entity.color);
  noStroke();
  ellipse(width / 2 + entity.pos[0] / entity.pos[2] * side,
          height + entity.pos[1] / entity.pos[2] * side,
          2 * radius);
  noFill();
  stroke(entity.color);
  strokeWeight(2 * radius);
  line(width / 2 + entity.prev[0] / entity.prev[2] * side,
       height + entity.prev[1] / entity.prev[2] * side,
       width / 2 + entity.pos[0] / entity.pos[2] * side,
       height + entity.pos[1] / entity.pos[2] * side);
}

function fireworkAlive(firework) {
  return firework.vel[1] < 0;
}

function layer(x, y, w, l, h) {
  ellipse(x, y, w, l);
  rect(x - w / 2, y, w, h);
  ellipse(x, y + h, w, l);
}

function drawFlame(x, y, lambda) {
  push();
  blendMode(ADD);
  fill('#140700');
  noStroke();
  flames.forEach(flame => {
    ellipse(x + flame.x * lambda/10, y + flame.y * lambda/10 - lambda/2 * flame.r, flame.r * lambda)
  })
  pop();
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}