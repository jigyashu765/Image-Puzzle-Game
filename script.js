const puzzleContainer = document.getElementById('puzzle-container');
const stepsElement = document.getElementById('steps');
let steps = 0;
let emptyPosition = { row: 0, col: 0 };
let gridSize = 3;
let pieces = [];
const keywords = ['nature', 'girl', 'models', 'animal', 'men', ];

function getRandomKeyword() {
    const randomIndex = Math.floor(Math.random() * keywords.length);
    return keywords[randomIndex];
}

function initGame(size, isNewGame) {
    gridSize = size;
    steps = 0;
    stepsElement.textContent = steps;
    puzzleContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    if (isNewGame || !sessionStorage.getItem('puzzleImage')) {
        const imageSrc = `https://source.unsplash.com/random/600x600?${getRandomKeyword()}`;
        sessionStorage.setItem('puzzleImage', imageSrc);
    }
    createPuzzlePieces();
    shufflePuzzle();
}

function createPuzzlePieces() {
    puzzleContainer.innerHTML = '';
    pieces = [];
    const pieceSize = 100 / gridSize;
    const imageSrc = sessionStorage.getItem('puzzleImage');
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (row === gridSize - 1 && col === gridSize - 1) {
                emptyPosition = { row, col };
                continue;
            }
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.style.width = `${pieceSize}%`;
            piece.style.height = `${pieceSize}%`;
            piece.style.backgroundImage = `url(${imageSrc})`;
            piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
            piece.style.backgroundPosition = `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`;
            piece.style.transform = `translate(${col * 100}%, ${row * 100}%)`;
            piece.dataset.row = row;
            piece.dataset.col = col;
            piece.dataset.initialRow = row;
            piece.dataset.initialCol = col;
            piece.addEventListener('click', movePiece);

            pieces.push(piece);
            puzzleContainer.appendChild(piece);
        }
    }
}

function shufflePuzzle() {
    const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 } 
    ];
    
    for (let i = 0; i < gridSize * gridSize * 10; i++) {
        const validMoves = directions.filter(direction => {
            const newRow = emptyPosition.row + direction.row;
            const newCol = emptyPosition.col + direction.col;
            return newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize;
        });

        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        const newRow = emptyPosition.row + move.row;
        const newCol = emptyPosition.col + move.col;
        swapPieces(newRow, newCol, emptyPosition.row, emptyPosition.col);
        emptyPosition = { row: newRow, col: newCol };
    }
}

function movePiece(event) {
    const clickedPiece = event.target;
    const row = parseInt(clickedPiece.dataset.row);
    const col = parseInt(clickedPiece.dataset.col);
    const emptyRow = emptyPosition.row;
    const emptyCol = emptyPosition.col;
    const rowDiff = Math.abs(row - emptyRow);
    const colDiff = Math.abs(col - emptyCol);

    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        swapPieces(row, col, emptyRow, emptyCol);
        emptyPosition = { row, col };
        steps++;
        stepsElement.textContent = steps;
        checkWin(); // Check if the player has won after each move
    }
}

function isValidMove(row, col) {
    const rowDiff = Math.abs(row - emptyPosition.row);
    const colDiff = Math.abs(col - emptyPosition.col);
    return (rowDiff + colDiff === 1);
}

function swapPieces(row1, col1, row2, col2) {
    const piece1 = pieces.find(p => p.dataset.row == row1 && p.dataset.col == col1);
    const piece2 = pieces.find(p => p.dataset.row == row2 && p.dataset.col == col2);

    if (piece1) {
        piece1.dataset.row = row2;
        piece1.dataset.col = col2;
        piece1.style.transform = `translate(${col2 * 100}%, ${row2 * 100}%)`;
    }

    if (piece2) {
        piece2.dataset.row = row1;
        piece2.dataset.col = col1;
        piece2.style.transform = `translate(${col1 * 100}%, ${row1 * 100}%)`;
    }
}

function checkWin() {
    let win = true;
    pieces.forEach(piece => {
        const initialRow = parseInt(piece.dataset.initialRow);
        const initialCol = parseInt(piece.dataset.initialCol);
        const currentRow = parseInt(piece.dataset.row);
        const currentCol = parseInt(piece.dataset.col);

        if (initialRow !== currentRow || initialCol !== currentCol) {
            win = false;
        }
    });

    if (win) {
        const missingPiece = document.createElement('div');
        missingPiece.classList.add('puzzle-piece');
        missingPiece.style.width = `${100 / gridSize}%`;
        missingPiece.style.height = `${100 / gridSize}%`;
        missingPiece.style.backgroundImage = `url(${sessionStorage.getItem('puzzleImage')})`;
        missingPiece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
        missingPiece.style.backgroundPosition = `${(emptyPosition.col * 100) / (gridSize - 1)}% ${(emptyPosition.row * 100) / (gridSize - 1)}%`;
        missingPiece.style.transform = `translate(${emptyPosition.col * 100}%, ${emptyPosition.row * 100}%)`;
        puzzleContainer.appendChild(missingPiece);

        alert(`Congratulations! You solved the puzzle in ${steps} steps.`);
    }
}

function resetGame() {
    initGame(gridSize, false);
}

function newGame() {
    sessionStorage.removeItem('puzzleImage');
    initGame(gridSize, true);
}

// Initialize the game with default size
initGame(3, true);
