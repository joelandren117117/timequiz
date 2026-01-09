import { reactive } from "vue";
import { socket } from "@/services/socketService";

const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = ["en", "sv"];

const normalizeLang = (value) => {
  const trimmed = String(value || "").trim().toLowerCase();
  return SUPPORTED_LANGS.includes(trimmed) ? trimmed : DEFAULT_LANG;
};

const state = reactive({
  lang: normalizeLang(
    typeof window !== "undefined" ? localStorage.getItem("lang") : DEFAULT_LANG
  ),
  labels: {},
  isLoaded: false,
  error: null,
});

const requestLabels = (lang = state.lang) => {
  const nextLang = normalizeLang(lang);
  state.lang = nextLang;
  if (typeof window !== "undefined") {
    localStorage.setItem("lang", nextLang);
  }
  socket.emit("getUILabels", nextLang);
};

socket.on("uiLabels", (labels) => {
  state.labels = labels && typeof labels === "object" ? labels : {};
  state.isLoaded = true;
  state.error = null;
});

socket.on("connect", () => {
  requestLabels(state.lang);
});

const setLanguage = (lang) => {
  const nextLang = normalizeLang(lang);
  if (nextLang === state.lang && state.isLoaded) {
    return;
  }
  requestLabels(nextLang);
};

const toggleLanguage = () => {
  const nextLang = state.lang === "en" ? "sv" : "en";
  requestLabels(nextLang);
};

const getLabel = (key, fallback = "") => {
  if (!key) return fallback;
  const value = state.labels?.[key];
  return typeof value === "string" ? value : fallback;
};

// Initial load
requestLabels(state.lang);

export {
  state as uiState,
  setLanguage,
  toggleLanguage,
  getLabel,
  normalizeLang,
};