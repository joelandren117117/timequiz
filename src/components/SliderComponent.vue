<template>
  <div class="slider-wrapper">
    <label class="slider-label">
      {{ label }}
      <strong>{{ modelValue }}</strong>
    </label>
    <input
      class="slider"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
    >
    <div class="slider-scale">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 1900,
  },
  max: {
    type: Number,
    default: new Date().getFullYear(),
  },
  step: {
    type: Number,
    default: 1,
  },
  label: {
    type: String,
    default: 'Year',
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.slider-wrapper {
  margin-top: 1rem;
  color: #e5e7eb;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: #e5e7eb;
}

.slider {
  width: 100%;
  -webkit-appearance: none;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ea3e34, #f59e0b);
  outline: none;
  accent-color: #ea3e34;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #ea3e34;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #ea3e34;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.slider-scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #cbd5e1;
  margin-top: 0.35rem;
}
</style>
