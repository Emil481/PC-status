const batteryPercent = document.getElementById("batteryPercent");
const batteryState = document.getElementById("batteryState");
const batteryFill = document.getElementById("batteryFill");
const chargeAdvice = document.getElementById("chargeAdvice");
const refreshBtn = document.getElementById("refreshBtn");
const locationBtn = document.getElementById("locationBtn");
const locationValue = document.getElementById("locationValue");
const locationDetail = document.getElementById("locationDetail");

let batteryManager = null;

function setAdvice(message, type = "neutral") {
  chargeAdvice.textContent = message;
  chargeAdvice.className = `advice ${type}`;
}

function updateBatteryView() {
  if (!batteryManager) {
    batteryPercent.textContent = "Ukjent";
    batteryState.textContent = "Denne nettleseren deler ikke batteridata.";
    batteryFill.style.width = "0%";
    setAdvice("Batteristatus er ikke tilgjengelig i denne nettleseren.", "neutral");
    return;
  }

  const percent = Math.round(batteryManager.level * 100);
  const isCharging = batteryManager.charging;

  batteryPercent.textContent = `${percent}%`;
  batteryState.textContent = isCharging ? "PC-en lader akkurat n\u00e5." : "PC-en g\u00e5r p\u00e5 batteri.";
  batteryFill.style.width = `${percent}%`;

  if (percent <= 20 && !isCharging) {
    batteryFill.style.background = "var(--warn)";
    setAdvice("PC-en b\u00f8r lades n\u00e5.", "warning");
  } else if (percent <= 40 && !isCharging) {
    batteryFill.style.background = "#d97706";
    setAdvice("Det kan v\u00e6re lurt \u00e5 koble til laderen snart.", "warning");
  } else if (isCharging) {
    batteryFill.style.background = "var(--ok)";
    setAdvice("PC-en er koblet til str\u00f8m.", "ok");
  } else {
    batteryFill.style.background = "var(--accent)";
    setAdvice("Batteriniv\u00e5et ser greit ut.", "ok");
  }
}

async function initBattery() {
  if (!("getBattery" in navigator)) {
    updateBatteryView();
    return;
  }

  batteryManager = await navigator.getBattery();
  updateBatteryView();

  batteryManager.addEventListener("levelchange", updateBatteryView);
  batteryManager.addEventListener("chargingchange", updateBatteryView);
}

function formatCoordinates(position) {
  const { latitude, longitude, accuracy } = position.coords;
  return {
    main: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    detail: `N\u00f8yaktighet: ca. ${Math.round(accuracy)} meter.`,
  };
}

function getLocation() {
  if (!("geolocation" in navigator)) {
    locationValue.textContent = "Ikke tilgjengelig";
    locationDetail.textContent = "Denne nettleseren st\u00f8tter ikke lokasjon.";
    return;
  }

  locationValue.textContent = "Henter...";
  locationDetail.textContent = "Venter p\u00e5 svar fra nettleseren.";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = formatCoordinates(position);
      locationValue.textContent = location.main;
      locationDetail.textContent = location.detail;
    },
    (error) => {
      locationValue.textContent = "Kunne ikke hente";
      locationDetail.textContent = error.message || "Lokasjon ble ikke godkjent.";
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
    }
  );
}

refreshBtn.addEventListener("click", updateBatteryView);
locationBtn.addEventListener("click", getLocation);

initBattery().catch(() => {
  batteryManager = null;
  updateBatteryView();
});
