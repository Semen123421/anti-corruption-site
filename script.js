/* ============ ФОН С ЧАСТИЦАМИ ============ */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 90; i++) particles.push(new Particle());

const mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 * (1 - dist / 120)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
    if (mouse.x !== null) {
      const dx = particles[a].x - mouse.x;
      const dy = particles[a].y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        ctx.strokeStyle = `rgba(124, 58, 237, ${0.3 * (1 - dist / 150)})`;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  requestAnimationFrame(animate);
}
animate();


/* ============ СЧЁТЧИКИ ============ */
const counters = document.querySelectorAll('.stat-number');
const speed = 40;

const animateCounters = (entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = +counter.dataset.target;
    let count = 0;
    const step = target / speed;
    const update = () => {
      count += step;
      if (count < target) {
        counter.textContent = Math.ceil(count);
        requestAnimationFrame(update);
      } else {
        counter.textContent = target;
      }
    };
    update();
    observer.unobserve(counter);
  });
};

const counterObserver = new IntersectionObserver(animateCounters, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));


/* ============ ПОЯВЛЕНИЕ СЕКЦИЙ ПРИ СКРОЛЛЕ ============ */
const reveals = document.querySelectorAll('.stat-card, .card, .report-form');
reveals.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => revealObserver.observe(el));


/* ============ TILT-ЭФФЕКТ НА КАРТОЧКАХ ============ */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -12;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
  });
});


/* ============ ФОРМА ============ */
const form = document.getElementById('reportForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!email || !message) {
    status.textContent = '⚠️ Заполните обязательные поля';
    status.style.color = '#ff6b6b';
    status.classList.add('show');
    return;
  }

  status.textContent = '✅ Сообщение отправлено. Спасибо за вашу активность!';
  status.style.color = '#00e5ff';
  status.classList.add('show');
  form.reset();

  setTimeout(() => status.classList.remove('show'), 4000);
});


/* ============ КАРТА КОРРУПЦИИ (LEAFLET HEAT) ============ */
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('corruption-map');
  if (!mapContainer) return;

  const map = L.map('corruption-map', {
    center: [20, 0],
    zoom: 2,
    zoomControl: true,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_4q37_1_eaeb37b91375e2d633d7ce6c', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  const heatData = [
    [15.0, 30.0, 0.91],
    [5.0, 48.0, 0.91],
    [4.0, -72.0, 0.90],
    [-18.0, 35.0, 0.79],
    [6.0, 20.0, 0.76],
    [23.0, 90.0, 0.76],
    [23.0, -102.0, 0.73],
    [56.0, 38.0, 0.78],
    [35.0, 105.0, 0.58],
    [39.0, -98.0, 0.36],
    [46.0, 2.0, 0.34],
    [-25.0, 133.0, 0.19],
    [56.0, 10.0, 0.11],
    [64.0, 26.0, 0.12]
  ];

  L.heatLayer(heatData, {
    radius: 40,
    blur: 25,
    maxZoom: 5,
    max: 1.0,
    minOpacity: 0.3,
    gradient: {
      0.0: '#00e5ff',
      0.4: '#7c3aed',
      0.6: '#ff9800',
      0.8: '#ff4444',
      1.0: '#b71c1c'
    }
  }).addTo(map);

  const countryMarkers = [
    { name: 'Дания', score: 89, coords: [56.0, 10.0] },
    { name: 'Сомали', score: 9, coords: [5.0, 48.0] },
    { name: 'Судан', score: 9, coords: [15.0, 30.0] },
    { name: 'Венесуэла', score: 10, coords: [4.0, -72.0] },
    { name: 'Мозамбик', score: 21, coords: [-18.0, 35.0] }
  ];

  countryMarkers.forEach(marker => {
    L.circleMarker(marker.coords, {
      radius: 6,
      color: '#fff',
      weight: 2,
      fillColor: marker.score < 30 ? '#ff4444' : '#00e5ff',
      fillOpacity: 0.9
    })
    .bindPopup(`<b>${marker.name}</b><br>CPI 2025: ${marker.score}/100`)
    .addTo(map);
  });
});