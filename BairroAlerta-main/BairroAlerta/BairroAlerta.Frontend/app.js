/* 
  app.js
  Configure API_BASE_URL abaixo para apontar para sua API.
  Suporta respostas de alerta com (latitude, longitude) caso a API forneça.
  Caso contrário, a posição será gerada aleatoriamente perto do centro configurado.
*/
const API_BASE_URL = "http://localhost:5000"; 
const API_ALERTAS = `${API_BASE_URL}/api/alertas`;

const CENTER = { lat: -5.8194, lng: -35.2050, zoom: 14 }; //Bairro Lagoa Nova
const MAP_RANDOM_SPREAD = 0.02; // raio para jitter quando API não fornecer coords

// cores por tipo
const CORES = {
  "Roubo": "#ff3b3b",
  "Agressão": "#ff8c00",
  "Animal Selvagem": "#28a745",
  "Movimentação Estranha": "#007bff"
};

// referências DOM
const $ = id => document.getElementById(id);
const statusEl = $('status');
const lastUpdatedEl = $('lastUpdated');
const alertListEl = $('alertList');
const alertaCoordsCache = {}; // guarda as coords geradas para cada alerta

let map, markersLayer, chart;
let autoMode = false, autoIntervalId = null;

// inicialização
function init() {
  initMap();
  initChart();
  attachEvents();
  carregar();
}

// inicializa Leaflet
//Cria o mapa e a camada onde os marcadores serão colocados.
function initMap() {
  map = L.map('map', { preferCanvas: true }).setView([CENTER.lat, CENTER.lng], CENTER.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

// cria ícone simples colorido (circle svg)
function createIcon(color) {
  const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24'>
      <path fill='${color}' d='M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z'/>
      <circle cx='12' cy='9' r='2.5' fill='#fff'/>
    </svg>`);
  return L.icon({
    iconUrl: 'data:image/svg+xml;utf8,' + svg,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
}

//Gera coordenadas aleatórias
function randomNear(center, spread = MAP_RANDOM_SPREAD) {
  const lat = center.lat + (Math.random() - 0.5) * spread;
  const lng = center.lng + (Math.random() - 0.5) * spread;
  return { lat, lng };
}

//Busca alertas do backend
async function fetchAlertas() {
  try {
    const res = await fetch(API_ALERTAS);
    if (!res.ok) throw new Error('Falha ao buscar alertas');
    const data = await res.json();
    statusEl.textContent = 'Conectado';
    statusEl.style.color = '#6ee7b7';
    lastUpdatedEl.textContent = new Date().toLocaleTimeString();
    return data || [];
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Offline';
    statusEl.style.color = '#ef4444';
    return [];
  }
}

//Limpa marcadores do mapa
function clearMarkers() {
  markersLayer.clearLayers();
}

//Cria um marcador para um alerta
function addMarkerForAlert(a) {
  const tipo = a.tipo || 'Desconhecido';
  const color = CORES[tipo] || '#6b7280';
  const icon = createIcon(color);

  // CACHE para impedir mudança de coordenadas
  if (!alertaCoordsCache[a.id]) {
      alertaCoordsCache[a.id] = randomNear(CENTER);
  }

  const coords = alertaCoordsCache[a.id];

  const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(markersLayer);

  const html = `
    <b>${escapeHtml(tipo)}</b>
    <div style="margin-top:6px">${escapeHtml(a.descricao ?? '')}</div>
    <small style="color:#999">${new Date(a.data).toLocaleString()}</small>
  `;
  marker.bindPopup(html);
  return marker;
}


function escapeHtml(text) {
  if (!text) return '';
  return text.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// renderizar lista e marcadores
function renderAll(alertas) {
  // filtros
  const tipoFilter = $('filtroTipo').value || '';
  const q = $('q').value.trim().toLowerCase();

  const filtered = alertas.filter(a => {
    const matchesType = !tipoFilter || a.tipo === tipoFilter;
    const matchesQuery = !q || (a.descricao && a.descricao.toLowerCase().includes(q));
    return matchesType && matchesQuery;
  });

  // limpa
  alertListEl.innerHTML = '';
  clearMarkers();

  // render reversed (mais recentes no topo)
  filtered.slice().reverse().forEach(a => {
    // item de lista
    const item = document.createElement('div');
    item.className = 'alert-item';
    const color = CORES[a.tipo] || '#6b7280';
    item.innerHTML = `
      <div class="alert-left">
        <div class="badge" style="background:${color}">${(a.tipo||'A')[0]}</div>
        <div>
          <div class="alert-title">${escapeHtml(a.tipo || 'Desconhecido')}</div>
          <div class="alert-desc">${escapeHtml(a.descricao || '')}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="alert-time">${new Date(a.data).toLocaleString()}</div>
      </div>
    `;
    alertListEl.appendChild(item);

    // marker
    addMarkerForAlert(a);
  });

  // atualizar estatísticas
  updateStats(alertas);
  updateChart(alertas);
}

// estatísticas
function updateStats(alertas) {
  $('total').textContent = (alertas.length || 0);
  $('roubos').textContent = alertas.filter(a => a.tipo === 'Roubo').length;
  $('agressoes').textContent = alertas.filter(a => a.tipo === 'Agressão').length;
  $('animais').textContent = alertas.filter(a => a.tipo === 'Animal Selvagem').length;
}

// chart
function initChart() {
  const ctx = document.getElementById('pieChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Roubo','Agressão','Animal Selvagem','Movimentação Estranha'],
      datasets: [{
        data: [0,0,0,0],
        backgroundColor: ['#ff3b3b','#ff8c00','#28a745','#007bff'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { color: '#cfe3ff' } } },
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%'
    }
  });
}

function updateChart(alertas) {
  const counts = [
    alertas.filter(a => a.tipo === 'Roubo').length,
    alertas.filter(a => a.tipo === 'Agressão').length,
    alertas.filter(a => a.tipo === 'Animal Selvagem').length,
    alertas.filter(a => a.tipo === 'Movimentação Estranha').length
  ];
  chart.data.datasets[0].data = counts;
  chart.update();
}

// carregar e renderizar
async function carregar() {
  const dados = await fetchAlertas();
  renderAll(dados || []);
}

// detectar via API (POST) e adicionar
async function detectar() {
  try {
    showToast('Detectando...');
    //requisição HTTP POST para a rota /detectar da API
    const res = await fetch(`${API_ALERTAS}/detectar`, { method: 'POST' });
    if (!res.ok) throw new Error('Erro ao detectar');
    // se backend retornar o alerta criado, atualizar
    const alerta = await res.json();
    showToast('🚨 Novo alerta detectado');
    // recarregar todos
    await carregar();
    // abrir popup último marker (opcional)
    // zoom para todos
    fitMarkers();
    return alerta;
  } catch (err) {
    console.error(err);
    showToast('Falha ao detectar', true);
  }
}

// UI toasts
let toastTimer = null;
function showToast(msg, isError = false) {
  const t = $('toast');
  t.textContent = msg;
  t.style.background = isError ? 'linear-gradient(90deg,#ef4444,#ff7a7a)' : 'linear-gradient(90deg,#ff6b6b,#ff9a9e)';
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// Centraliza e ajusta o zoom do mapa
function fitMarkers() {
  //Pega todos os marcadores que existem no mapa
  const layers = markersLayer.getLayers();
  if (!layers.length) return;
  const group = L.featureGroup(layers);
  //Ajusta o zoom e posição do mapa para caber tudo na tela
  map.fitBounds(group.getBounds().pad(0.25));
}

// events
function attachEvents() {
  $('btnDetectar').addEventListener('click', detectar);
  $('filtroTipo').addEventListener('change', carregar);
  $('q').addEventListener('input', () => setTimeout(carregar, 250));
  $('zoomAll').addEventListener('click', fitMarkers);
  $('clearMarkers').addEventListener('click', () => { clearMarkers(); });

  // auto
  $('btnAuto').addEventListener('click', () => {
    autoMode = !autoMode;
    if (autoMode) {
      $('btnAuto').textContent = '⏸ Auto';
      showToast('Auto mode ativado');
      autoIntervalId = setInterval(async () => {
        await detectar();
      }, 6000);
    } else {
      $('btnAuto').textContent = '▶ Auto';
      if (autoIntervalId) clearInterval(autoIntervalId);
      showToast('Auto mode desativado');
    }
  });
}

// start
init();
