// Relógio digital
function atualizarRelogioDigital() {
  const clock = document.getElementById("digital-clock");
  const agora = new Date();
  const h = String(agora.getHours()).padStart(2, "0");
  const m = String(agora.getMinutes()).padStart(2, "0");
  const s = String(agora.getSeconds()).padStart(2, "0");
  clock.textContent = `${h}:${m}:${s}`;
}
setInterval(atualizarRelogioDigital, 1000);
atualizarRelogioDigital();

// Relógio analógico
function atualizarRelogioAnalogico() {
  const agora = new Date();
  const h = agora.getHours() % 12;
  const m = agora.getMinutes();
  const s = agora.getSeconds();
  document.getElementById("hour").style.transform = `translateX(-50%) rotate(${h*30 + m*0.5}deg)`;
  document.getElementById("minute").style.transform = `translateX(-50%) rotate(${m*6}deg)`;
  document.getElementById("second").style.transform = `translateX(-50%) rotate(${s*6}deg)`;
}
setInterval(atualizarRelogioAnalogico, 1000);
atualizarRelogioAnalogico();

// Calendário
function atualizarData() {
  const d = new Date();
  const opt = { weekday:'long', day:'2-digit', month:'long', year:'numeric' };
  const txt = d.toLocaleDateString('pt-BR', opt);
  document.getElementById("date").textContent = txt.charAt(0).toUpperCase()+txt.slice(1);
}
setInterval(atualizarData, 60000);
atualizarData();

// GPS — escreve em formato compatível com maps.js observer
function mostrarLocalizacao() {
  const el = document.getElementById("location");
  function setCoords(lat, lng) {
    el.textContent = `Você está em: Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  }
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
      setCoords(pos.coords.latitude, pos.coords.longitude);
    }, err => {
      // fallback
      const fallbackLat = -23.55052, fallbackLng = -46.633308;
      el.textContent = "Localização não permitida. Usando coords padrão.";
      setTimeout(() => setCoords(fallbackLat, fallbackLng), 600);
    }, { enableHighAccuracy:true, timeout:5000 });
  } else {
    el.textContent = "GPS não suportado pelo navegador.";
    setTimeout(() => setCoords(-23.55052, -46.633308), 600);
  }
}
mostrarLocalizacao();

// Theme toggle
const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const mode = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", mode);
    themeBtn.querySelector("i").className = document.body.classList.contains("dark") ? "fas fa-moon" : "fas fa-sun";
  });
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");
}

// Mode toggle digital/analog
const modeBtn = document.getElementById("mode-toggle");
if (modeBtn) {
  modeBtn.addEventListener("click", () => {
    const dig = document.getElementById("digital-clock");
    const ana = document.getElementById("analog-clock");
    if (getComputedStyle(dig).display !== "none") {
      dig.style.display = "none"; ana.style.display = "block"; ana.setAttribute("aria-hidden","false");
      modeBtn.querySelector("span").textContent = "Digital";
    } else {
      dig.style.display = "block"; ana.style.display = "none"; ana.setAttribute("aria-hidden","true");
      modeBtn.querySelector("span").textContent = "Analógico";
    }
  });
}
