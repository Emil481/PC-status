const batteryPercent = document.getElementById("batteryPercent");
const batteryState = document.getElementById("batteryState");
const batteryFill = document.getElementById("batteryFill");
const chargeAdvice = document.getElementById("chargeAdvice");
const refreshBtn = document.getElementById("refreshBtn");
const locationBtn = document.getElementById("locationBtn");
const locationValue = document.getElementById("locationValue");
const locationDetail = document.getElementById("locationDetail");
const summaryNetwork = document.getElementById("summaryNetwork");
const summaryTime = document.getElementById("summaryTime");
const summaryDevice = document.getElementById("summaryDevice");
const summarySecure = document.getElementById("summarySecure");
const networkValue = document.getElementById("networkValue");
const networkDetail = document.getElementById("networkDetail");
const screenValue = document.getElementById("screenValue");
const screenDetail = document.getElementById("screenDetail");
const permissionValue = document.getElementById("permissionValue");
const permissionDetail = document.getElementById("permissionDetail");
const copyLocationBtn = document.getElementById("copyLocationBtn");
const mapLocationBtn = document.getElementById("mapLocationBtn");
const shareLocationBtn = document.getElementById("shareLocationBtn");
const locationUpdated = document.getElementById("locationUpdated");

let batteryManager = null;
let batteryListenersAttached = false;
let lastCoordinates = "";
let lastLatitude = null;
let lastLongitude = null;
let lastPlaceName = "";

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function setAdvice(message, type = "neutral") {
  chargeAdvice.textContent = message;
  chargeAdvice.className = `advice ${type}`;
}

function vibrateShort() {
  if ("vibrate" in navigator) {
    navigator.vibrate(18);
  }
}

function formatShortTime(date = new Date()) {
  return date.toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setLocationActionsEnabled(enabled) {
  copyLocationBtn.disabled = !enabled;
  mapLocationBtn.disabled = !enabled;
  shareLocationBtn.disabled = !enabled || !("share" in navigator);
}

function rememberLocation(latitude, longitude, label = "") {
  lastLatitude = latitude;
  lastLongitude = longitude;
  lastCoordinates = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  lastPlaceName = label;
  locationUpdated.textContent = `Sist hentet kl. ${formatShortTime()}.`;
  setLocationActionsEnabled(true);
}

function getDeviceLabel() {
  if (/iPhone|iPod/i.test(navigator.userAgent)) {
    return "iPhone";
  }

  if (/iPad/i.test(navigator.userAgent)) {
    return "iPad";
  }

  if (/Android/i.test(navigator.userAgent)) {
    return "Android";
  }

  if (/Mac/i.test(navigator.userAgent)) {
    return "Mac";
  }

  if (/Windows/i.test(navigator.userAgent)) {
    return "Windows";
  }

  return "Ukjent";
}

function updateSecureContextView() {
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  const isSecure = window.isSecureContext || isLocalhost;

  summarySecure.textContent = isSecure ? "OK" : "HTTP";
  permissionValue.textContent = isSecure ? "Klar" : "Mangler HTTPS";
  permissionDetail.textContent = isSecure
    ? "Lokasjon kan spørre om tilgang i denne nettleseren."
    : "Lokasjon på telefon krever vanligvis HTTPS, for eksempel GitHub Pages.";
}

async function updateLocationPermissionView() {
  updateSecureContextView();

  if (!("permissions" in navigator) || !window.isSecureContext) {
    return;
  }

  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });
    const label = {
      granted: "Godkjent",
      denied: "Avslått",
      prompt: "Spør ved bruk",
    }[permission.state] || "Ukjent";

    permissionValue.textContent = label;
    permissionDetail.textContent =
      permission.state === "denied"
        ? "Lokasjon er avslått. Endre dette i nettleserens innstillinger."
        : "Telefonen spør om lov når du henter lokasjon.";

    permission.onchange = updateLocationPermissionView;
  } catch {
    permissionDetail.textContent = "Nettleseren viser ikke tillatelsesstatus.";
  }
}

function getBrowserLabel() {
  const ua = navigator.userAgent;

  if (/Edg\//i.test(ua)) {
    return "Edge";
  }

  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    return "Chrome";
  }

  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    return "Safari";
  }

  if (/Firefox\//i.test(ua)) {
    return "Firefox";
  }

  return "nettleseren";
}

function setBatteryUnavailable(reason = "") {
  batteryPercent.textContent = "--";
  batteryState.textContent = reason || "Denne nettleseren lar ikke nettsiden lese batteri eller lading.";
  batteryFill.style.width = "100%";
  batteryFill.style.background = "#9aa4b2";
  if (isMobileDevice()) {
    setAdvice(
      "Telefoner skjuler ofte batteri og lading for nettsider. Resten av statusen fungerer fortsatt.",
      "neutral"
    );
  } else {
    setAdvice(
      "Batteri fungerer bare i noen nettlesere og vanligvis bare p\u00e5 HTTPS.",
      "neutral"
    );
  }
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
    ? `Enheten lader akkurat n\u00e5.${timeText}`
    : `Enheten g\u00e5r p\u00e5 batteri.${timeText}`;
  batteryFill.style.width = `${Math.max(percent, 4)}%`;

  if (percent <= 20 && !isCharging) {
    batteryFill.style.background = "var(--warn)";
    setAdvice("Enheten b\u00f8r lades n\u00e5.", "warning");
  } else if (percent <= 40 && !isCharging) {
    batteryFill.style.background = "#d97706";
    setAdvice("Det kan v\u00e6re lurt \u00e5 koble til laderen snart.", "warning");
  } else if (isCharging) {
    batteryFill.style.background = "var(--ok)";
    setAdvice("Enheten er koblet til str\u00f8m.", "ok");
  } else {
    batteryFill.style.background = "var(--accent)";
    setAdvice("Batteriniv\u00e5et ser greit ut.", "ok");
  }
}

async function initBattery() {
  const browser = getBrowserLabel();

  if (!("getBattery" in navigator)) {
    setBatteryUnavailable(
      browser === "Safari"
        ? "Safari st\u00f8tter ikke batterim\u00e5ling for vanlige nettsider."
        : `${browser} tilbyr ikke batteridata her.`
    );
    return;
  }

  if (!window.isSecureContext) {
    setBatteryUnavailable(
      `${browser} krever HTTPS for \u00e5 vise batteri og lading.`
    );
    return;
  }

  try {
    batteryManager = await navigator.getBattery();
    updateBatteryView();

    if (!batteryListenersAttached) {
      batteryManager.addEventListener("levelchange", updateBatteryView);
      batteryManager.addEventListener("chargingchange", updateBatteryView);
      batteryManager.addEventListener("chargingtimechange", updateBatteryView);
      batteryManager.addEventListener("dischargingtimechange", updateBatteryView);
      batteryListenersAttached = true;
    }
  } catch {
    batteryManager = null;
    setBatteryUnavailable(`${browser} blokkerte batteridata.`);
  }
}

function updateNetworkView() {
  const isOnline = navigator.onLine;
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const speed = connection?.effectiveType
    ? ` Hastighetsklasse: ${connection.effectiveType.toUpperCase()}.`
    : "";

  summaryNetwork.textContent = isOnline ? "Online" : "Offline";
  networkValue.textContent = isOnline ? "Online" : "Offline";
  networkDetail.textContent = isOnline
    ? `Enheten har nettforbindelse.${speed}`
    : "Enheten ser ut til \u00e5 v\u00e6re uten nett akkurat n\u00e5.";
}

function updateClock() {
  const now = new Date();
  summaryTime.textContent = now.toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateScreenView() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation = width >= height ? "liggende" : "st\u00e5ende";
  const pixelRatio = window.devicePixelRatio || 1;

  screenValue.textContent = `${width} x ${height}`;
  screenDetail.textContent = `Skjermen er ${orientation}. Pikselforhold: ${pixelRatio.toFixed(1)}.`;
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
  rememberLocation(latitude, longitude);
  locationValue.textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  locationDetail.textContent = `Fant koordinater, men ikke by og land. N\u00f8yaktighet: ca. ${Math.round(
    accuracy
  )} meter.`;
}

function getLocation() {
  vibrateShort();

  if (!("geolocation" in navigator)) {
    locationValue.textContent = "Ikke tilgjengelig";
    locationDetail.textContent = "Denne nettleseren st\u00f8tter ikke lokasjon.";
    return;
  }

  locationBtn.disabled = true;
  locationBtn.textContent = "Henter...";
  setLocationActionsEnabled(false);
  locationValue.textContent = "Henter...";
  locationDetail.textContent = "Venter p\u00e5 svar fra nettleseren.";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      try {
        const place = await reverseGeocode(latitude, longitude);
        rememberLocation(latitude, longitude, `${place.city}, ${place.country}`);
        locationValue.textContent = `${place.city}, ${place.country}`;
        locationDetail.textContent = `Koordinater: ${latitude.toFixed(5)}, ${longitude.toFixed(
          5
        )}. N\u00f8yaktighet: ca. ${Math.round(accuracy)} meter.`;
      } catch {
        setCoordinateFallback(position);
      } finally {
        locationBtn.disabled = false;
        locationBtn.textContent = "Hent lokasjon";
        updateLocationPermissionView();
      }
    },
    (error) => {
      locationValue.textContent = "Kunne ikke hente";
      locationDetail.textContent = error.message || "Lokasjon ble ikke godkjent.";
      locationBtn.disabled = false;
      locationBtn.textContent = "Hent lokasjon";
      updateLocationPermissionView();
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
    }
  );
}

async function copyLocation() {
  if (!lastCoordinates) {
    return;
  }

  vibrateShort();

  try {
    await navigator.clipboard.writeText(lastCoordinates);
    copyLocationBtn.textContent = "Kopiert";
    setTimeout(() => {
      copyLocationBtn.textContent = "Kopier";
    }, 1400);
  } catch {
    locationDetail.textContent = `${locationDetail.textContent} Kopiering ble ikke st\u00f8ttet.`;
  }
}

function openMap() {
  if (lastLatitude === null || lastLongitude === null) {
    return;
  }

  vibrateShort();
  const url = `https://www.openstreetmap.org/?mlat=${lastLatitude}&mlon=${lastLongitude}#map=15/${lastLatitude}/${lastLongitude}`;
  window.open(url, "_blank", "noopener");
}

async function shareLocation() {
  if (!lastCoordinates || !("share" in navigator)) {
    return;
  }

  vibrateShort();
  const title = lastPlaceName ? `Lokasjon: ${lastPlaceName}` : "Min lokasjon";
  const mapUrl =
    lastLatitude !== null && lastLongitude !== null
      ? `https://www.openstreetmap.org/?mlat=${lastLatitude}&mlon=${lastLongitude}#map=15/${lastLatitude}/${lastLongitude}`
      : "";

  try {
    await navigator.share({
      title,
      text: `${title}\nKoordinater: ${lastCoordinates}`,
      url: mapUrl,
    });
  } catch {
    // User canceled share or the browser blocked it.
  }
}

function registerOfflineSupport() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    return;
  }

  navigator.serviceWorker.register("sw.js?v=5").catch(() => {});
}

function refreshAll() {
  vibrateShort();
  initBattery();
  updateNetworkView();
  updateClock();
  updateScreenView();
  updateLocationPermissionView();
  summaryDevice.textContent = getDeviceLabel();
}

refreshBtn.addEventListener("click", refreshAll);
locationBtn.addEventListener("click", getLocation);
copyLocationBtn.addEventListener("click", copyLocation);
mapLocationBtn.addEventListener("click", openMap);
shareLocationBtn.addEventListener("click", shareLocation);
window.addEventListener("online", updateNetworkView);
window.addEventListener("offline", updateNetworkView);
window.addEventListener("resize", updateScreenView);
window.addEventListener("orientationchange", updateScreenView);

setLocationActionsEnabled(false);
refreshAll();
registerOfflineSupport();
setInterval(updateClock, 30000);
