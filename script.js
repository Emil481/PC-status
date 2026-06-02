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

function setBatteryUnavailable() {
  batteryPercent.textContent = "--";
  batteryState.textContent = "Batteridata er ikke tilgjengelig i denne nettleseren.";
  batteryFill.style.width = "100%";
  batteryFill.style.background = "#9aa4b2";
  setAdvice(
    "Pr\u00f8v Chrome eller Edge p\u00e5 GitHub Pages hvis du vil vise batteriprosent.",
    "neutral"
  );
}

function formatChargeTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return ` Ca. ${minutes} min igjen.`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return ` Ca. ${hours} t ${restMinutes} min igjen.`;
}

function updateBatteryView() {
  if (!batteryManager) {
    setBatteryUnavailable();
    return;
  }

  const percent = Math.round(batteryManager.level * 100);
  const isCharging = batteryManager.charging;
  const timeText = isCharging
    ? formatChargeTime(batteryManager.chargingTime)
    : formatChargeTime(batteryManager.dischargingTime);

  batteryPercent.textContent = `${percent}%`;
  batteryState.textContent = isCharging
    ? `PC-en lader akkurat n\u00e5.${timeText}`
    : `PC-en g\u00e5r p\u00e5 batteri.${timeText}`;
  batteryFill.style.width = `${Math.max(percent, 4)}%`;

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
    setBatteryUnavailable();
    return;
  }

  try {
    batteryManager = await navigator.getBattery();
    updateBatteryView();

    batteryManager.addEventListener("levelchange", updateBatteryView);
    batteryManager.addEventListener("chargingchange", updateBatteryView);
    batteryManager.addEventListener("chargingtimechange", updateBatteryView);
    batteryManager.addEventListener("dischargingtimechange", updateBatteryView);
  } catch {
    batteryManager = null;
    setBatteryUnavailable();
  }
}

function getBestCity(address) {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    "Ukjent by"
  );
}

async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: latitude,
    lon: longitude,
    zoom: "10",
    addressdetails: "1",
    "accept-language": "no",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);

  if (!response.ok) {
    throw new Error("Kunne ikke hente by og land.");
  }

  const data = await response.json();
  const address = data.address || {};
  return {
    city: getBestCity(address),
    country: address.country || "Ukjent land",
  };
}

function setCoordinateFallback(position) {
  const { latitude, longitude, accuracy } = position.coords;
  locationValue.textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  locationDetail.textContent = `Fant koordinater, men ikke by og land. N\u00f8yaktighet: ca. ${Math.round(
    accuracy
  )} meter.`;
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
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      try {
        const place = await reverseGeocode(latitude, longitude);
        locationValue.textContent = `${place.city}, ${place.country}`;
        locationDetail.textContent = `Koordinater: ${latitude.toFixed(5)}, ${longitude.toFixed(
          5
        )}. N\u00f8yaktighet: ca. ${Math.round(accuracy)} meter.`;
      } catch {
        setCoordinateFallback(position);
      }
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

refreshBtn.addEventListener("click", initBattery);
locationBtn.addEventListener("click", getLocation);

initBattery();
