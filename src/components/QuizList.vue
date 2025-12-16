<template>
  <div class="quiz-list">
    <h3>Available Quizzes</h3>

    <ul v-if="quizes.length" class="quiz-items">
      <li
        v-for="quiz in quizes"
        :key="quiz.id"
        class="quiz-item"
        :class="{ selected: quiz.id === selectedId }"
      >
        <label class="quiz-row">
          <input
            type="radio"
            name="quiz"
            :value="quiz.id"
            :checked="quiz.id === selectedId"
            @change="$emit('select', quiz.id)"
          />
          <div class="quiz-text">
            <div class="quiz-title">{{ quiz.name }}</div>
            <div class="quiz-meta">
              <span>{{ quiz.description }}</span>
              <span class="count">{{ quiz.questions?.length || 0 }} questions</span>
            </div>
          </div>
        </label>
      </li>
    </ul>

    <div v-else class="quiz-empty">
      No quizzes found in server/data/quizes.json.
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import quizesData from '../../server/data/quizes.json';

const props = defineProps({
  selectedId: {
    type: String,
    default: '',
  },
  quizes: {
    type: Array,
    default: () => quizesData.quizes ?? [],
  },
});

defineEmits(['select']);

const { quizes, selectedId } = toRefs(props);
</script>

<style scoped>
.quiz-list {
  padding: 20px;
  border: 1px solid #dcdcdc;
  background: #f8f8f8;
  border-radius: 8px;
}

.quiz-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.quiz-item {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.quiz-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.quiz-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
}

.count {
  font-weight: 500;
}

.quiz-empty {
  padding: 12px;
  color: #666;
  font-style: italic;
}
</style>
