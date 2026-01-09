<script setup>
import { RouterView } from 'vue-router'
import {onMounted } from 'vue';
import { initUILabelListener, setLanguage, uiState } from './stores/uiStore';

onMounted(()=>{
  initUILabelListener();
  setLanguage(uiState.lang);
});
</script>

<template>
  <RouterView />
</template>

<style>

</style>
