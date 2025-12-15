<template>
    <div class="quiz-list-placeholder">
        <p>Loading available Quizes...</p>
        <p class="instruction">
    
        </p>
    </div>
</template>

<script setup>
// Din kompis kommer att lägga till logik här för att hämta quiz från servern.
</script>

<style scoped>
.quiz-list-placeholder {
    padding: 20px;
    border: 1px dashed #A3A3A3;
    background-color: #F8F8F8;
    border-radius: 8px;
    text-align: center;
}
.instruction {
    font-style: italic;
    color: #666;
    margin-top: 10px;
    font-size: 0.9em;
}
</style>