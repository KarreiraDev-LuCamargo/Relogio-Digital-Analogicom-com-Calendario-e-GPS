// maps.js — gerencia Leaflet + export
let mapInstance = null;
let marker = null;
let lastCoords = { lat: -23.55052, lng: -46.633308 }; // fallback São Paulo

const mapWrap = document.getElementById("map-wrap");
const mapToggle = document.getElementById("map-toggle");
const btnExport = document.getElementById("btn-export");
const linkDownload = document.getElementById("link-download");
const locEl = document.getElementById("location");

function showToast(msg, time = 2200) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    background: "rgba(17,24,39,0.94)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    zIndex: 99999,
    boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
    fontSize: "14px"
  });
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = "0.02", time - 200);
  setTimeout(() => t.remove(), time);
}

function waitForTilesToLoad(map, timeout = 3000) {
  return new Promise(res => {
    const start = Date.now();
    const check = () => {
      const tiles = map.getContainer().querySelectorAll('img.leaflet-tile');
      const allLoaded = Array.from(tiles).every(t => t.complete && t.naturalWidth > 0);
      if (allLoaded || (Date.now() - start) > timeout) return res();
      setTimeout(check, 100);
    };
    check();
  });
}

function initMap(lat = lastCoords.lat, lng = lastCoords.lng) {
  lastCoords.lat = lat; lastCoords.lng = lng;
  if (mapInstance) {
    mapInstance.setView([lat, lng], 13);
    if (marker) marker.setLatLng([lat, lng]);
    return;
  }

  mapInstance = L.map("map", { zoomControl: true }).setView([lat, lng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, detectRetina: true, attribution: '&copy; OpenStreetMap contributors' }).addTo(mapInstance);

  marker = L.marker([lat, lng]).addTo(mapInstance);
  marker.bindPopup(`<strong>Você está aqui</strong><br>Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`).openPopup();
}

async function openMap() {
  // revela
  mapWrap.classList.remove("hidden");
  mapWrap.setAttribute("aria-hidden", "false");
  // garante que o mapa inicialize com coords atualizadas (caso script.js já tenha escrito #location)
  // extrai coords caso já estejam no texto
  const text = locEl.textContent || "";
  const m = text.match(/Lat:\s*([-0-9.]+),\s*Lng:\s*([-0-9.]+)/i);
  if (m) {
    lastCoords.lat = parseFloat(m[1]); lastCoords.lng = parseFloat(m[2]);
  }
  initMap(lastCoords.lat, lastCoords.lng);
  // espera pequenos ms e invalida size para forçar render
  setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 220);
}

function closeMap() {
  mapWrap.classList.add("hidden");
  mapWrap.setAttribute("aria-hidden", "true");
}

mapToggle && mapToggle.addEventListener("click", () => {
  const isHidden = window.getComputedStyle(mapWrap).display === "none" || mapWrap.classList.contains("hidden");
  if (isHidden) {
    openMap();
    mapToggle.setAttribute("aria-pressed", "true");
    mapToggle.title = "Esconder mapa";
  } else {
    closeMap();
    mapToggle.setAttribute("aria-pressed", "false");
    mapToggle.title = "Mostrar mapa";
  }
});

btnExport && btnExport.addEventListener("click", async () => {
  if (!mapInstance) return showToast("Abra o mapa antes de exportar.");
  await waitForTilesToLoad(mapInstance, 3000);
  html2canvas(mapWrap, { useCORS: true, scale: 2 }).then(canvas => {
    linkDownload.href = canvas.toDataURL("image/png");
    linkDownload.download = `map-${lastCoords.lat.toFixed(5)}_${lastCoords.lng.toFixed(5)}.png`;
    linkDownload.click();
    showToast("Imagem exportada ✔");
  }).catch(err => {
    console.error(err);
    showToast("Erro ao gerar imagem (CORS?)");
  });
});

// MutationObserver: atualiza lastCoords quando #location muda (compatível com seu script.js)
new MutationObserver(muts => {
  muts.forEach(m => {
    const text = m.target.textContent || "";
    const r = text.match(/Lat:\s*([-0-9.]+),\s*Lng:\s*([-0-9.]+)/i);
    if (r) {
      lastCoords.lat = parseFloat(r[1]);
      lastCoords.lng = parseFloat(r[2]);
      if (mapInstance) initMap(lastCoords.lat, lastCoords.lng);
    }
  });
}).observe(locEl, { childList: true, subtree: true });
