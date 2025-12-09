<template>
  <div class="create-quiz-container">
    <!-- Logo style title -->
    <header class="app-header">
      <h1 class="logo-title">TIMEGUESSR</h1>
    </header>

    <!-- Quiz section (left column) -->
    <section class="quiz-section">
      <div class="quiz-name">Quiz Name</div>

      <div class="question-list">
        <div class="question-item">
          <span>Question 1</span>
          <button class="edit-btn">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 2</span>
          <button class="edit-btn">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 3</span>
          <button class="edit-btn">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 4</span>
          <button class="edit-btn">Edit</button>
        </div>
      </div>

      <button class="add-question-btn">+ Add Question</button>
      <button class="save-btn">Save Quiz</button>
    </section>

    <section class="question-editor">
      <div></div>
    </section>
  </div>
</template>

<style scoped>
/* ========== Global Theme & Layout ========== */
.create-quiz-container {
  background-color: #FEFCEF;
  min-height: 100vh;
  padding: 3rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1D1C1B;

  /* GRID LAYOUT */
  display: grid;
  grid-template-columns: 1fr;            /* Mobile: single column */
  grid-template-rows: auto auto;
  grid-template-areas:
    "header"
    "quiz";
  row-gap: 2rem;
}

/* Larger screens: quiz in left third, right side empty for now */
@media (min-width: 900px) {
  .create-quiz-container {
    grid-template-columns: 1fr 2fr;      /* Left ~1/3, right ~2/3 */
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "header header"
      "quiz   editor";
    column-gap: 2rem;
    align-items: flex-start;
  }
}

/* ========== Header / Logo ========== */
.app-header {
  grid-area: header;
  margin-bottom: 1rem;
}

.logo-title {
  font-size: 5rem;
  font-weight: 900;
  color: #EA3E34;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  margin: 0;
}

/* ========== Quiz Layout (Flex inside grid) ========== */
.quiz-section {
  grid-area: quiz;

  /* FLEX LAYOUT INSIDE QUIZ SECTION */
  display: flex;
  flex-direction: column;
  gap: 2rem;

  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);

  /* On small screens, center and constrain width a bit */
  max-width: 700px;
  margin: 0 auto;
}

/* On larger screens, let quiz fill its grid column */
@media (min-width: 900px) {
  .quiz-section {
    max-width: none;
    width: 100%;
    margin: 0;
  }
}

/* Title Bar */
.quiz-name {
  background-color: #EA3E34;
  color: #FEFCEF;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  padding: 1.2rem;
  border-radius: 10px;
}

/* Question Items */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-item {
  background-color: #FFFFFF;
  border: 2px solid #EA3E34;
  color: #1D1C1B;

  padding: 1rem 1.5rem;
  border-radius: 10px;

  font-size: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.question-item:hover {
  background-color: rgba(234, 62, 52, 0.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Edit Button - secondary style */
.edit-btn {
  background-color: transparent;
  color: #EA3E34;
  border: 2px solid #EA3E34;

  padding: 0.4rem 1rem;
  border-radius: 999px;

  font-weight: bold;
  cursor: pointer;

  transition: background 0.2s ease, color 0.2s ease;
}

.edit-btn:hover {
  background-color: rgba(234, 62, 52, 0.1);
}

/* Main Buttons */
.add-question-btn,
.save-btn {
  background-color: #EA3E34;
  color: #FEFCEF;
  font-size: 1.2rem;
  font-weight: bold;

  padding: 1rem;
  border: none;
  border-radius: 12px;

  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.add-question-btn:hover,
.save-btn:hover {
  background-color: #D7382F;
  box-shadow: 0 4px 10px rgba(234, 62, 52, 0.25);
}

/* ========== Right Side / Editor Placeholder ========== */
.question-editor {
  grid-area: editor;
  /* Empty for now — just reserves space in grid on large screens */
  display: none;
}

/* Show the empty right side only on larger screens */
@media (min-width: 900px) {
  .question-editor {
    display: block;
  }
}
</style>
