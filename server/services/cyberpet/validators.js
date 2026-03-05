import { DAILY_QUESTION_COUNT } from "./question.service.js";

export function isValidDailyQuestionIndex(questionIndex) {
  const qIndex = Number(questionIndex);
  return Number.isInteger(qIndex) && qIndex >= 0 && qIndex < DAILY_QUESTION_COUNT;
}

export function isValidDailyAnswerIndex(answerIndex) {
  const aIndex = Number(answerIndex);
  return Number.isInteger(aIndex) && aIndex >= 0 && aIndex <= 3;
}
