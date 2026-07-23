/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 * 
 * This class handles displaying and interacting with a single question.
 * 
 * PROPERTIES TO CREATE:
 * - quiz (Quiz) - Reference to the Quiz instance
 * - container (HTMLElement) - DOM element to render into
 * - onQuizEnd (Function) - Callback when quiz ends
 * - questionData (object) - Current question from quiz.getCurrentQuestion()
 * - index (number) - Current question index
 * - question (string) - The decoded question text
 * - correctAnswer (string) - The decoded correct answer
 * - category (string) - The decoded category name
 * - wrongAnswers (array) - Decoded incorrect answers
 * - allAnswers (array) - Shuffled array of all answers
 * - answered (boolean) - Has user answered? Starts false
 * - timerInterval (number) - The setInterval ID
 * - timeRemaining (number) - Seconds left, starts at 30 seconds
 * 
 * METHODS TO IMPLEMENT:
 * - constructor(quiz, container, onQuizEnd)
 * - decodeHtml(html) - Decode HTML entities like &amp;
 * - shuffleAnswers() - Shuffle answers randomly
 * - getProgress() - Calculate progress percentage
 * - displayQuestion() - Render the question HTML
 * - addEventListeners() - Add click handlers to answers
 * - removeEventListeners() - Cleanup handlers
 * - startTimer() - Start countdown
 * - stopTimer() - Stop countdown
 * - handleTimeUp() - When timer reaches 0
 * - checkAnswer(choiceElement) - Check if answer is correct
 * - highlightCorrectAnswer() - Show correct answer
 * - getNextQuestion() - Load next or show results
 * - animateQuestion(duration) - Transition to next
 * 
 * HTML ENTITIES:
 * The API returns text with HTML entities like:
 * - &amp; should become &
 * - &quot; should become "
 * - &#039; should become '
 * 
 * Use this trick to decode:
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * return doc.documentElement.textContent;
 * 
 * SHUFFLE ALGORITHM (Fisher-Yates):
 * for (let i = array.length - 1; i > 0; i--) {
 *   const j = Math.floor(Math.random() * (i + 1));
 *   [array[i], array[j]] = [array[j], array[i]];
 * }
 */

import { allQuestions } from "./index.js"

let score = 0 ;
let timer;
let timeLeft = 15;

const PlayerName = document.getElementById("playerName")

export default class Question {
  constructor(index){
    this.index = index
    this.category = allQuestions[index].category
    this.question = allQuestions[index].question
    this.correctAnsw = allQuestions[index].correct_answer
    this.inCorrectAnsw = allQuestions[index].incorrect_answers
    this.difficulty = allQuestions[index].difficulty
    this.choice = [...this.inCorrectAnsw,this.correctAnsw].sort(()=>Math.random()-0.5)

  }

displayAnswer(){
  let answersContainer = "";
  for(let i = 0 ; i< this.choice.length; i++){
   answersContainer += `
   <button class="answer-btn" data-answer="${this.choice[i]}">
          <span class="answer-key">${i+1}</span>
          <span class="answer-text">${this.choice[i]}</span>
        </button>
   `
  }
  return answersContainer
}

  displayQuestion(){
    // console.log(this.choice);
    const difficultyConfig = this.getDifficultyConfig();
    
    let formQuestion = `
    

      <div class="xp-bar-container">
        <div class="xp-bar-header">
          <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
          <span class="xp-value">Question ${this.index+1}/${allQuestions.length}</span>
        </div>
        <div class="xp-bar">
          <div class="xp-bar-fill" style="width:${((this.index + 1) / allQuestions.length) * 100}%"></div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-badge category">
          <i class="fa-solid fa-bookmark"></i>
          <span>${this.category}</span>
        </div>
        <div class="stat-badge difficulty ${difficultyConfig.class}">
          <i class="fa-solid ${difficultyConfig.icon}"></i>
          <span>${this.difficulty}</span>
        </div>
        <div class="stat-badge timer">
          <i class="fa-solid fa-stopwatch"></i>
          <span class="timer-value">15</span>s
        </div>
        <div class="stat-badge counter">
          <i class="fa-solid fa-gamepad"></i>
          <span>${this.index+1}/${allQuestions.length}</span>
        </div>
      </div>

      <h2 class="question-text">${this.question}</h2>

      <div class="answers-grid">
        ${this.displayAnswer()}
      </div>

      <p class="keyboard-hint">
        <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
      </p>

      <div class="score-panel">
        <div class="score-item">
          <div class="score-item-label">Score</div>
          <div class="score-item-value">${score}</div>
        </div>
      </div>

    `
    document.querySelector(".question-card").innerHTML = formQuestion
    document.querySelector(".question-card").classList.remove("hidden")

    let allAnswers = document.querySelectorAll(".answer-btn")
    allAnswers.forEach((item)=>{
      item.addEventListener("click",(e)=>{
        this.checkAnswer(e.currentTarget)
        
      })
    })
    this.startTimer()
  }

  checkAnswer(element){
    let selectedAnswer = element.querySelector(".answer-text").textContent.trim();
    let allBtns = document.querySelectorAll(".answer-btn");
   clearInterval(timer)
    allBtns.forEach(btn => btn.disabled = true);
    if (selectedAnswer===this.correctAnsw) {
      element.classList.add("correct")
      score++
      
    }
    else {
    element.classList.add("wrong")
     
    }
  setTimeout(() => {
    this.nextQuestion()
  }, 1000 );  
  }

timeOut() {
  this.answered = true;

  let allButtons = document.querySelectorAll(".answer-btn");
  allButtons.forEach(btn => btn.disabled = true);

  
  allButtons.forEach(btn => {
    if (
      btn.querySelector(".answer-text").textContent.trim() === this.correctAnsw
    ) {
      btn.classList.add("correct");
    }
  });

  setTimeout(() => {
    this.nextQuestion();
  }, 1000);
}

  nextQuestion(){
    if (this.index+1 == allQuestions.length) {
      document.querySelector(".results-card").innerHTML =`
      <h2 class="results-title">Quiz Complete!</h2>
      <p class="results-score-display">${score}/${allQuestions.length}</p>
      <p class="results-percentage">${Math.floor(score/allQuestions.length*100)}% Accuracy</p>
      
      <div class="new-record-badge">
        <i class="fa-solid fa-star"></i> New High Score!
      </div>
      
      <div class="leaderboard">
        <h4 class="leaderboard-title">
          <i class="fa-solid fa-trophy"></i> Leaderboard
        </h4>
        <ul class="leaderboard-list">
          <li class="leaderboard-item gold">
            <span class="leaderboard-rank">#1</span>
            <span class="leaderboard-name">${PlayerName.value}</span>
            <span class="leaderboard-score">${Math.floor(score/allQuestions.length*100)}%</span>
          </li>
          <li class="leaderboard-item silver">
            <span class="leaderboard-rank">#2</span>
            <span class="leaderboard-name">Player 1</span>
            <span class="leaderboard-score">0%</span>
          </li>
          <li class="leaderboard-item bronze">
            <span class="leaderboard-rank">#3</span>
            <span class="leaderboard-name">Player 2</span>
            <span class="leaderboard-score">0%</span>
          </li>
        </ul>
      </div>
      
      <div class="action-buttons">
        <button class="btn-restart">
          <i class="fa-solid fa-rotate-right"></i> Play Again
        </button>
      </div>
      `

      document.querySelector(".results-card").classList.remove("hidden")
      document.querySelector(".question-card").classList.add('hidden')

      document.querySelector(".action-buttons .btn-restart").addEventListener("click",()=>{
        window.location.reload()
      })
    }else{
          let newQuestion = new Question(this.index+1)
    newQuestion.displayQuestion()
    }

  }

  startTimer() {
  timeLeft = 15;

  const timerElement = document.querySelector(".timer-value");
  timerElement.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft === 0) {
      clearInterval(timer);
      this.timeOut();
    }
  }, 1000);
}

getDifficultyConfig() {
  switch (this.difficulty) {
    case "easy":
      return {
        class: "easy",
        icon: "fa-face-smile"
      };

    case "medium":
      return {
        class: "medium",
        icon: "fa-face-meh"
      };

    case "hard":
      return {
        class: "hard",
        icon: "fa-face-angry"
      };

    default:
      return {
        class: "easy",
        icon: "fa-face-smile"
      };
  }
}
  
}


// TODO: Create constructor(quiz, container, onQuizEnd)
  // 1. Store the three parameters
  // 2. Get question data: this.questionData = quiz.getCurrentQuestion()
  // 3. Store index: this.index = quiz.currentQuestionIndex
  // 4. Decode and store: question, correctAnswer, category
  // 5. Decode wrong answers (use .map())
  // 6. Shuffle all answers
  // 7. Initialize: answered = false, timerInterval = null, timeRemaining
  
  
  // TODO: Create decodeHtml(html) method
  // Use DOMParser to decode HTML entities
  
  
  // TODO: Create shuffleAnswers() method
  // 1. Combine wrongAnswers and correctAnswer into one array
  // 2. Shuffle using Fisher-Yates algorithm
  // 3. Return shuffled array
  
  
  // TODO: Create getProgress() method
  // Calculate: ((index + 1) / quiz.numberOfQuestions) * 100
  // Round to whole number
  
  
  // TODO: Create displayQuestion() method
  // 1. Create HTML string for the question card
  //    (See index.html for the structure to use)
  // 2. Use template literals with ${} for dynamic data
  // 3. Set this.container.innerHTML = yourHTML
  // 4. Call this.addEventListeners()
  // 5. Call this.startTimer()
  
  
  // TODO: Create addEventListeners() method
  // 1. Get all answer buttons: document.querySelectorAll('.answer-btn')
  // 2. Add click event to each: call this.checkAnswer(button)
  // 3. Add keyboard support: listen for keys 1-4
  //    Valid keys are: ['1', '2', '3', '4']
  
  
  // TODO: Create removeEventListeners() method
  // Remove any keyboard listeners you added
  
  
  // TODO: Create startTimer() method
  // 1. Get timer display element
  // 2. Use setInterval to run every 1000ms (1 second)
  // 3. Decrement timeRemaining
  // 4. Update the display
  // 5. If timeRemaining <= 10 seconds, add 'warning' class
  // 6. If timeRemaining <= 0, call stopTimer() and handleTimeUp()
  
  
  // TODO: Create stopTimer() method
  // Use clearInterval(this.timerInterval)
  
  
  // TODO: Create handleTimeUp() method
  // 1. Set answered = true
  // 2. Call removeEventListeners()
  // 3. Show correct answer (add 'correct' class)
  // 4. Show "TIME'S UP!" message
  // 5. Call animateQuestion() after a delay
  
  
  // TODO: Create checkAnswer(choiceElement) method
  // 1. If already answered, return early
  // 2. Set answered = true
  // 3. Stop the timer
  // 4. Get selected answer from data-answer attribute
  // 5. Compare with correctAnswer (case insensitive)
  // 6. If correct: add 'correct' class, call quiz.incrementScore()
  // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
  // 8. Disable other buttons (add 'disabled' class)
  // 9. Call animateQuestion()
  
  
  // TODO: Create highlightCorrectAnswer() method
  // Find the button with correct answer and add 'correct-reveal' class
  
  
  // TODO: Create getNextQuestion() method
  // 1. Call quiz.nextQuestion()
  // 2. If returns true: create new Question and display it
  // 3. If returns false: show results using quiz.endQuiz()
  //    Also add click listener to Play Again button
  
  
  // TODO: Create animateQuestion(duration) method
  // 1. Wait for 1500ms (transition delay)
  // 2. Add 'exit' class to question card
  // 3. Wait for duration
  // 4. Call getNextQuestion()
  