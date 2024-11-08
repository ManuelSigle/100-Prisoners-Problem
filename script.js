// Arrays to store prisoners and boxes
const prisoners = []; // Stores prisoner data
const boxes = [];     // Stores box data

let currentPrisoner = null;
let mode = ''; // 'automatic' or 'manual'
let attemptsLeft = 50;
let simulationSpeed = 'normal'; // 'normal', 'fast', 'superfast'

// Speed settings in milliseconds
const speedSettings = {
    normal: 500,
    fast: 200,
    superfast: 50
};

// Get the tries left elements
const triesLeftElement = document.getElementById('tries-left');
const triesLeftNumber = document.getElementById('tries-left-number');
const progressFill = document.getElementById('progress-fill');
// Always display the tries left counter
triesLeftElement.style.display = 'block';

// Initialize Prisoners
const prisonersList = document.getElementById('prisoners-list');
for (let i = 1; i <= 100; i++) {
    const prisoner = document.createElement('div');
    prisoner.classList.add('prisoner');
    prisoner.id = `prisoner-${i}`;
    prisoner.dataset.number = i;

    const prisonerNumber = document.createElement('span');
    prisonerNumber.classList.add('prisoner-number');
    prisonerNumber.textContent = `#${i}`;

    const prisonerIcon = document.createElement('span');
    prisonerIcon.classList.add('prisoner-icon');
    prisonerIcon.textContent = '👤';

    prisoner.appendChild(prisonerNumber);
    prisoner.appendChild(prisonerIcon);

    prisonersList.appendChild(prisoner);

    prisoners.push({
        number: i,
        element: prisoner,
        status: 'upcoming', // 'upcoming', 'current', 'done'
    });
}

// Initialize Boxes
const boxesGrid = document.getElementById('boxes-grid');
for (let i = 1; i <= 100; i++) {
    const box = document.createElement('div');
    box.classList.add('box');
    box.dataset.boxNumber = i;

    // Box Number (Identifier)
    const boxNumber = document.createElement('div');
    boxNumber.classList.add('box-number');
    boxNumber.textContent = `Box ${i}`;
    box.appendChild(boxNumber);

    // Box Content Wrapper
    const boxContentWrapper = document.createElement('div');
    boxContentWrapper.classList.add('box-content-wrapper');

    // Box Content (Prisoner Number)
    const boxContent = document.createElement('div');
    boxContent.classList.add('box-content');
    boxContent.textContent = i; // Initial prisoner number
    boxContentWrapper.appendChild(boxContent);

    box.appendChild(boxContentWrapper);

    boxesGrid.appendChild(box);

    boxes.push({
        boxNumber: i,
        prisonerNumber: i, // Will be shuffled later
        element: box,
    });
}

// Shuffle Function
function shuffleBoxes() {
    const prisonerNumbers = boxes.map(box => box.prisonerNumber);
    for (let i = prisonerNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [prisonerNumbers[i], prisonerNumbers[j]] = [prisonerNumbers[j], prisonerNumbers[i]];
    }
    boxes.forEach((box, index) => {
        box.prisonerNumber = prisonerNumbers[index];
        const boxContent = box.element.querySelector('.box-content');
        boxContent.textContent = box.prisonerNumber;
    });
}

// Hide Box Contents
function hideBoxContents() {
    boxes.forEach(box => {
        const boxContent = box.element.querySelector('.box-content');
        boxContent.classList.add('hidden');
        box.element.classList.remove('success'); // Remove success class
    });
}

// Show Box Content
function showBoxContent(boxNumber) {
    const box = boxes.find(b => b.boxNumber == boxNumber);
    if (box) {
        const boxContent = box.element.querySelector('.box-content');
        boxContent.classList.remove('hidden');
    }
}

// Shuffle Animation
function shuffleBoxesWithAnimation() {
    return new Promise(resolve => {
        boxes.forEach(box => {
            box.element.classList.add('shuffle-animation');
        });
        setTimeout(() => {
            boxes.forEach(box => {
                box.element.classList.remove('shuffle-animation');
            });
            shuffleBoxes();
            resolve();
        }, 1000);
    });
}

// Game Over
function gameOver() {
    const gameOverOverlay = document.getElementById('game-over-overlay');
    gameOverOverlay.style.display = 'flex';
}

// Success Screen
function successScreen() {
    const successOverlay = document.getElementById('success-overlay');
    successOverlay.style.display = 'flex';
}

// Reset Game
function resetGame() {
    location.reload();
}

// Highlight Prisoner
function highlightPrisoner(prisonerNumber) {
    // Remove highlight from all prisoners
    prisoners.forEach(p => p.element.classList.remove('highlight'));
    // Set current prisoner
    currentPrisoner = prisoners.find(p => p.number === prisonerNumber);
    if (currentPrisoner) {
        currentPrisoner.element.classList.add('highlight');
    }
}

// Mark Prisoner as Done
function markPrisonerAsDone(success) {
    if (currentPrisoner) {
        currentPrisoner.status = 'done';
        currentPrisoner.element.classList.add('done');
        currentPrisoner.element.classList.remove('highlight');
        currentPrisoner = null;
    }
}

// Start Automatic Simulation Button
document.getElementById('start-automatic-btn').addEventListener('click', async () => {
    mode = 'automatic';
    await shuffleBoxesWithAnimation();
    hideBoxContents();
    showSpeedSelection();
});

// Start Manual Simulation Button
document.getElementById('start-manual-btn').addEventListener('click', async () => {
    mode = 'manual';
    await shuffleBoxesWithAnimation();
    hideBoxContents();
    runManualSimulation();
});

// Show Speed Selection Modal
function showSpeedSelection() {
    const speedModal = document.getElementById('speed-modal');
    speedModal.style.display = 'flex';
}

// Hide Speed Selection Modal
function hideSpeedSelection() {
    const speedModal = document.getElementById('speed-modal');
    speedModal.style.display = 'none';
}

// Speed Buttons Event Listeners
const speedButtons = document.querySelectorAll('.speed-btn');
speedButtons.forEach(button => {
    button.addEventListener('click', () => {
        simulationSpeed = button.dataset.speed;
        hideSpeedSelection();
        runAutomaticSimulation();
    });
});

// Automatic Simulation
async function runAutomaticSimulation() {
    for (let prisonerNumber = 1; prisonerNumber <= 100; prisonerNumber++) {
        highlightPrisoner(prisonerNumber);
        attemptsLeft = 50;
        updateTriesLeftDisplay();
        const success = await simulatePrisonerTurn(prisonerNumber);
        if (!success) {
            gameOver();
            return; // Stop the simulation
        } else {
            markPrisonerAsDone(true);
            await new Promise(r => setTimeout(r, 200)); // Short pause before hiding boxes
            hideBoxContents();
        }
    }
    // All prisoners have completed their turns successfully
    successScreen();
}

// Manual Simulation
let prisonerIndex = 0; // Index of the current prisoner in the prisoners array
async function runManualSimulation() {
    if (prisonerIndex < prisoners.length) {
        const prisonerNumber = prisoners[prisonerIndex].number;
        attemptsLeft = 50;
        highlightPrisoner(prisonerNumber);
        updateTriesLeftDisplay();
        enableBoxClicking(prisonerNumber);
    } else {
        // All prisoners have completed their turns successfully
        successScreen();
    }
}

// Enable Box Clicking
function enableBoxClicking(prisonerNumber) {
    boxes.forEach(box => {
        box.element.style.cursor = 'pointer';
        box.element.addEventListener('click', boxClickHandler);
    });
}

// Disable Box Clicking
function disableBoxClicking() {
    boxes.forEach(box => {
        box.element.style.cursor = 'default';
        box.element.removeEventListener('click', boxClickHandler);
    });
}

// Box Click Handler
function boxClickHandler(event) {
    const boxNumber = parseInt(event.currentTarget.dataset.boxNumber);
    if (attemptsLeft > 0) {
        attemptsLeft--;
        updateTriesLeftDisplay();
        showBoxContent(boxNumber);
        const box = boxes.find(b => b.boxNumber == boxNumber);
        if (box.prisonerNumber == currentPrisoner.number) {
            box.element.classList.add('success');
            markPrisonerAsDone(true);
            disableBoxClicking();
            setTimeout(() => {
                hideBoxContents();
                prisonerIndex++;
                runManualSimulation();
            }, 500);
        } else if (attemptsLeft === 0) {
            markPrisonerAsDone(false);
            disableBoxClicking();
            gameOver();
        }
    }
}

// Update Tries Left Display
function updateTriesLeftDisplay() {
    triesLeftNumber.textContent = attemptsLeft;
    const percentage = (attemptsLeft / 50) * 100;
    progressFill.style.width = `${percentage}%`;
}

// Simulate Prisoner's Turn (Automatic Mode)
function simulatePrisonerTurn(prisonerNumber) {
    return new Promise(async (resolve) => {
        let attempts = 0;
        const maxAttempts = 50;
        let boxNumber = prisonerNumber;
        let success = false;

        while (attempts < maxAttempts) {
            attempts++;
            attemptsLeft = maxAttempts - attempts + 1;
            updateTriesLeftDisplay();

            showBoxContent(boxNumber);
            const box = boxes.find(b => b.boxNumber == boxNumber);
            if (box.prisonerNumber == prisonerNumber) {
                box.element.classList.add('success');
                success = true;
                await new Promise(r => setTimeout(r, speedSettings[simulationSpeed]));
                break;
            } else {
                await new Promise(r => setTimeout(r, speedSettings[simulationSpeed]));
                boxNumber = box.prisonerNumber;
            }
        }

        resolve(success);
    });
}

// Restart Buttons
document.getElementById('restart-btn').addEventListener('click', () => {
    resetGame();
});
document.getElementById('restart-btn-success').addEventListener('click', () => {
    resetGame();
});
