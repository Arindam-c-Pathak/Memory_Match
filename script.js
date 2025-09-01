const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves-display');
const timeDisplay = document.getElementById('time-display');
const bestScoreDisplay = document.getElementById('best-score-display');
const restartBtn = document.getElementById('restart-btn');
const messageBox = document.getElementById('message-box');
const messageTitle = document.getElementById('message-title');
const messageContent = document.getElementById('message-content');
const messageRestartBtn = document.getElementById('message-restart-btn');
const difficultySelect = document.getElementById('difficulty');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;
let isProcessing = false;
let currentEmojis = [];

const localStorageKey = 'memoryMatchBestScore';
// Sound effects
const flipSound = new Audio('sounds/card_flip.mp3');
const matchSound = new Audio('sounds/cards_match.mp3');
const winSound = new Audio('sounds/won.mp3');


function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        timer++;
        timeDisplay.textContent = `${timer}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function getEmojisByDifficulty() {
    const difficulty = difficultySelect.value;

    if (difficulty === "easy") {
        return ['💕', '✨', '✌️', '😔'];
    } 
    else if (difficulty === "medium") {
        return ['💕', '✨', '✌️', '😔', '👊', '😭', '🤓', '💜'];
    } 
    else if (difficulty === "hard") {
        return ['💕', '✨', '✌️', '😔', '👊', '😭', '🤓', '💜', '🥝', '🍓', '🍑', '🍒'];
    }

    return ['💕', '✨', '✌️', '😔'];
}



function createBoard() {
    stopTimer();
    timer = 0;
    moves = 0;
    matchedPairs = 0;
    isProcessing = false;
    flippedCards = [];
    
    movesDisplay.textContent = moves;
    timeDisplay.textContent = `${timer}s`;

    gameBoard.innerHTML = '';

    currentEmojis = getEmojisByDifficulty();

    cards = shuffle([...currentEmojis, ...currentEmojis]).map((emoji, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'rounded-lg');
        cardElement.dataset.emoji = emoji;
        cardElement.dataset.index = index;
        cardElement.innerHTML = `
            <div class="card-face card-face-front"></div>
            <div class="card-face card-face-back">${emoji}</div>
        `;
        cardElement.addEventListener('click', handleCardClick);
        gameBoard.appendChild(cardElement);
        return cardElement;
    });

    let firstClick = true;
    function handleFirstClick() {
        if (firstClick) {
            startTimer();
            firstClick = false;
            gameBoard.removeEventListener('click', handleFirstClick, true);
        }
    }
    gameBoard.addEventListener('click', handleFirstClick, true);
}
function handleCardClick(event) {
    const clickedCard = event.currentTarget;
    if (isProcessing || clickedCard.classList.contains('is-flipped')) {
        return;
    }

    clickedCard.classList.add('is-flipped');
    flippedCards.push(clickedCard);

    flipSound.currentTime = 0; 
    flipSound.play();

    if (flippedCards.length === 2) {
        isProcessing = true;
        moves++;
        movesDisplay.textContent = moves;
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.emoji === card2.dataset.emoji) {
        matchedPairs++;
        
        // Play match sound
        matchSound.currentTime = 0;
        matchSound.play();

        isProcessing = false;
        flippedCards = [];
        if (matchedPairs === currentEmojis.length) {
            endGame();
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('is-flipped');
            card2.classList.remove('is-flipped');
            isProcessing = false;
            flippedCards = [];
        }, 1000);
    }
}

function endGame() {
    stopTimer();
    saveBestScore();
    getBestScore();
    messageTitle.textContent = "You Win!";
    messageContent.textContent = `You solved the puzzle in ${moves} moves and ${timer} seconds.`;
    messageBox.classList.remove('hidden');

    // Play win sound
    winSound.play();
}

function getBestScore() {
    const bestScore = JSON.parse(localStorage.getItem(localStorageKey));
    if (bestScore) {
        bestScoreDisplay.textContent = `${bestScore.moves} moves / ${bestScore.time}s`;
    } else {
        bestScoreDisplay.textContent = '--';
    }
}

function saveBestScore() {
    const currentBest = JSON.parse(localStorage.getItem(localStorageKey));
    if (!currentBest || moves < currentBest.moves || (moves === currentBest.moves && timer < currentBest.time)) {
        localStorage.setItem(localStorageKey, JSON.stringify({ moves, time: timer }));
    }
}

function endGame() {
    stopTimer();
    saveBestScore();
    getBestScore();
    messageTitle.textContent = "You Win!";
    messageContent.textContent = `You solved the puzzle in ${moves} moves and ${timer} seconds.`;
    messageBox.classList.remove('hidden');

    // Play win sound
    winSound.play();
}

restartBtn.addEventListener('click', () => {
    createBoard();
});

messageRestartBtn.addEventListener('click', () => {
    messageBox.classList.add('hidden');
    createBoard();
});

difficultySelect.addEventListener('change', () => {
    createBoard();
});

document.addEventListener('DOMContentLoaded', () => {
    getBestScore();
    createBoard();
});
