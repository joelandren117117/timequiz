import { reactive } from "vue";
import { emitWithAck, socket } from "@/services/socketService";
import quizesData from "../../server/data/quizes.json";

const state = reactive({
  quizes: Array.isArray(quizesData?.quizes) ? quizesData.quizes : [],
});

const setQuizes = (quizes) => {
  state.quizes = Array.isArray(quizes) ? quizes : [];
};

socket.on("quiz:updated", (quizes) => {
  setQuizes(quizes);
});

const fetchQuizes = async () => {
  const response = await emitWithAck("quiz:list");
  if (!response?.ok) {
    throw new Error(response?.error || "Could not load quizzes.");
  }
  setQuizes(response.quizes);
  return state.quizes;
};

const createQuiz = async (payload) => {
  const response = await emitWithAck("quiz:create", payload);
  if (!response?.ok) {
    throw new Error(response?.error || "Could not create quiz.");
  }
  if (Array.isArray(response?.quizes)) {
    setQuizes(response.quizes);
  } else if (response?.quiz) {
    setQuizes([...state.quizes, response.quiz]);
  }
  return response.quiz;
};

const getQuizById = (quizId) =>
  state.quizes.find((quiz) => quiz.id === quizId) || null;

export { state as quizState, fetchQuizes, createQuiz, getQuizById };
