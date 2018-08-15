'use strict';
console.log('Sokoban')


var gBoard;
var ROW_NUM = 7;
var COL_NUM = 7;
var gPlayer = { rowIdx: null, colIdx: null, stepsCount: 0 };
var gState = { isGameOn: false, targets: 4, boxesOnTargets: 0 };


function initGame() {
    gState.isGameOn = true;
    gBoard = createBoard();
    renderBoard(gBoard);
    setScore();
}

function createBoard() {
    var board = [];
    for (var i = 0; i < ROW_NUM; i++) {
        board[i] = [];
        for (var j = 0; j < COL_NUM; j++) {
            board[i][j] = createCell(i, j);
            var cell = board[i][j];
            setTargets(cell, i, j);
            setBoxes(cell, i, j);
            setPlayer(cell, i, j);
            cell.isFloor = (!cell.isWall && !cell.isTarget);
        }
    }
    return board;
}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var tdId = 'cell-' + i + '-' + j;
            var cell = board[i][j];
            setImgClass(cell);
            var tdClass = (cell.imgClass.length > 0) ? '" class="' + cell.imgClass : '';
            strHtml += '<td id="' + tdId + tdClass +
                '" onclick="cellClicked(' + i + ', ' + j + ')">' + '</td>';
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.game-board');
    elBoard.innerHTML = strHtml;
}

function cellClicked(rowIdx, colIdx) {
    var cell = gBoard[rowIdx][colIdx];
    if (isMoveable(cell)) {
        movePlayer(cell);
    }
}

function setImgClass(cell) {
    cell.imgClass = [];

    if (cell.isOutline) cell.imgClass.push('wall outline');
    else if (cell.isWall) cell.imgClass.push('wall');
    else if (cell.isPlayerPos) cell.imgClass.push('player');
    else if (cell.isBox) cell.imgClass.push('box');
    else if (cell.isTarget) cell.imgClass.push('target');

    var elCell = getCellEl(cell);
    if (elCell) elCell.className = cell.imgClass.join('');
}

function getCellEl(cell) {
    return document.querySelector('#cell-' + cell.rowIdx + '-' + cell.colIdx);
}


function isMoveable(cell) {
    var isMoveable = false;
    if (!cell.isWall && isCellInRange(cell)) {
        isMoveable = true;
        if (cell.isBox && isNextBoxOrWall(cell)) {
            isMoveable = false;
        }
    }
    return isMoveable;
}

function isCellInRange(cell) {
    var isCellInRange = false;
    if (nextCellInDirection(cell)) {
        isCellInRange = true;
    }
    return isCellInRange;
}

function nextCellInDirection(cell) {
    var row = gPlayer.rowIdx;
    var col = gPlayer.colIdx;
    var nextCell;
    if (cell === gBoard[row - 1][col]) {
        nextCell = gBoard[row - 2][col];
    } else if (cell === gBoard[row + 1][col]) {
        nextCell = gBoard[row + 2][col];
    } else if (cell === gBoard[row][col - 1]) {
        nextCell = gBoard[row][col - 2];
    } else if (cell === gBoard[row][col + 1]) {
        nextCell = gBoard[row][col + 2];
    }
    return nextCell;
}

function isNextBoxOrWall(cell) {
    var nextCell = nextCellInDirection(cell);
    return nextCell.isBox || nextCell.isWall;
}

function createCell(rowIdx, colIdx) {
    return {
        isPlayerPos: false,
        isWall: setWall(rowIdx, colIdx),
        isTarget: null,
        isFloor: null,
        isBox: false,
        isOutline: isOutline(rowIdx, colIdx),
        rowIdx: rowIdx,
        colIdx: colIdx,
        imgClass: [],
    };
}

function movePlayer(cell) {
    if (cell.isBox) moveBox(cell);
    updatePrevPlayerCell();
    cell.isPlayerPos = true;
    gPlayer.rowIdx = cell.rowIdx;
    gPlayer.colIdx = cell.colIdx;
    gPlayer.stepsCount = (gPlayer.stepsCount >= 100) ? 100 : gPlayer.stepsCount + 1;
    setScore();
    setImgClass(cell);
}

function moveBox(cell, newBoxCell) {
    updatePrevBoxCell(cell);
    if (!newBoxCell) var newBoxCell = nextCellInDirection(cell);
    newBoxCell.isBox = true;
    newBoxCell.isFloor = false;
    setImgClass(newBoxCell);
    if (newBoxCell.isTarget) {
        var elCell = getCellEl(newBoxCell);
        elCell.classList.add('on-target');
        gState.boxesOnTargets++;
        if (gState.boxesOnTargets === gState.targets) gameWon();
    }
}

function updatePrevBoxCell(cell) {
    cell.isBox = false;
    if (!cell.isTarget) cell.isFloor = true;
    setImgClass(cell);
    var elCell = getCellEl(cell);
    if (elCell.classList.contains('on-target')) {
        elCell.classList.remove('on-target')
        gState.boxesOnTargets--;
    }
}

function gameWon() {
    gState.isGameOn = false;
    var elBoard = document.querySelector('.game-board');
    elBoard.style.pointerEvents = "none";
    var elMsg = document.querySelector('.msg');
    elMsg.innerText = 'Congratulations, You WON!'
}

function updatePrevPlayerCell() {
    var cell = gBoard[gPlayer.rowIdx][gPlayer.colIdx];
    cell.isPlayerPos = false;
    setImgClass(cell);
}

function setScore() {
    var score = 100 - gPlayer.stepsCount;
    var elScore = document.querySelector('.score');
    elScore.innerText = 'Score: ' + score;
}

function resetGame() {
    gPlayer.stepsCount = 0;
    gState.targets = 0;
    gState.boxesOnTargets = 0;
    var elMsg = document.querySelector('.msg');
    elMsg.innerText = ''
    initGame();
    var elBoard = document.querySelector('.game-board');
    elBoard.style.pointerEvents = "auto";
}

function setWall(rowIdx, colIdx) {
    var isWall = false;
    if (rowIdx === 0 || rowIdx === ROW_NUM - 1 ||
        colIdx === 0 || colIdx === COL_NUM - 1 ||
        (rowIdx === 3 && colIdx === 2) || (rowIdx === 3 && colIdx === 3) || (rowIdx === 3 && colIdx === 4)) {
        isWall = true;
    }
    return isWall;
}

function setTargets(cell, rowIdx, colIdx) {
    if ((rowIdx === 1 && colIdx === 1) || (rowIdx === 1 && colIdx === 5) ||
        (rowIdx === 5 && colIdx === 1) || (rowIdx === 5 && colIdx === 5)) {
        cell.isTarget = true;
    } else cell.isTarget = false;
}

function setBoxes(cell, rowIdx, colIdx) {
    if ((rowIdx === 2 && colIdx === 2) || (rowIdx === 2 && colIdx === 4) ||
        (rowIdx === 4 && colIdx === 2) || (rowIdx === 4 && colIdx === 4)) {
        cell.isBox = true;
        cell.isFloor = false;
    }
}

function setPlayer(cell, rowIdx, colIdx) {
    if ((rowIdx === 2 && colIdx === 3)) {
        cell.isPlayerPos = true;
        gPlayer.rowIdx = cell.rowIdx;
        gPlayer.colIdx = cell.colIdx;
    }
}

function isOutline(rowIdx, colIdx) {
    var isOutline = false;
    if (rowIdx === 0 || rowIdx === ROW_NUM - 1 || colIdx === 0 || colIdx === COL_NUM - 1) {
        isOutline = true;
    }
    return isOutline;
}

document.onkeydown = function (pressedKey) {
    if (gState.isGameOn) {
        var row = gPlayer.rowIdx;
        var col = gPlayer.colIdx;
        switch (pressedKey.key) {
            case 'ArrowUp':
                pressedKey.preventDefault();
                cellClicked(row - 1, col);
                break;
            case 'ArrowDown':
                pressedKey.preventDefault();
                cellClicked(row + 1, col);
                break;
            case 'ArrowRight':
                pressedKey.preventDefault();
                cellClicked(row, col + 1);
                break;
            case 'ArrowLeft':
                pressedKey.preventDefault();
                cellClicked(row, col - 1);
                break;
            case ' ': //space bar - for activating magnets
                pressedKey.preventDefault();
                useMagnet();
                break;
        }
    }
}