<template>
  <header class="app-header">
    <h1 class="logo-title" @click="$router.push('/')">{{ title }}</h1>
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
