<template>
  <header class="app-header">
    <h1 class="logo-title">{{ title }}</h1>
    <div class="lang-switch" role="group" :aria-label="languageLabel">
      <button
        class="lang-btn"
        type="button"
        :class="{ active: uiState.lang === 'sv' }"
        :aria-pressed="uiState.lang === 'sv'"
        :aria-label="swedishLabel"
        @click="setLanguage('sv')"
      >
        🇸🇪
      </button>
      <button
        class="lang-btn"
        type="button"
        :class="{ active: uiState.lang === 'en' }"
        :aria-pressed="uiState.lang === 'en'"
        :aria-label="englishLabel"
        @click="setLanguage('en')"
      >
        🇬🇧
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { uiState, setLanguage, getLabel } from '@/stores/uiStore';

const title = computed(() => getLabel('appTitle', 'TIMEGUESSR'));
const languageLabel = computed(() => getLabel('languageLabel', 'Language'));
const swedishLabel = computed(() => getLabel('languageSwedish', 'Swedish'));
const englishLabel = computed(() => getLabel('languageEnglish', 'English'));
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 2rem;
}

.logo-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 900;
  color: var(--primary, #EA3E34);
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.lang-btn {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;
}

.lang-btn.active {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.lang-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .app-header {
    flex-direction: column;
    align-items: center;
    padding: 1.25rem 1.25rem 0.5rem;
  }
}
</style>