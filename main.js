const config = {
    loginPage: document.getElementById('loginPage'),
    initialPage : document.getElementById("initialPage"),
    mainPage : document.getElementById("mainPage"),
}

class Game {
    constructor(){
        this.field = new Field(20, 10);
        this.currentTetromino = this.generateNewTetromino();
        this.nextTetros = this.generateNextTetros();
        this.holdTetromino = null;
        this.doHold = true;
        this.isGameOver = false;
        this.renderer = this.initRenderer();
        this.doPause = false;
        this.startTime = Date.now();
        this.scoreManager = new ScoreManager();
        this.stopTime = 0;
        this.updateInterval = 870;
        this.sound = new Sound;
    }

    generateNextTetros(){
        let nextTetros = [];
        for (let i=0; i<4; i++){
            let newTetro = this.generateNewTetromino();
            nextTetros.push(newTetro);
        }
        return nextTetros
    }

    initRenderer(){
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        const nextCanvas = document.getElementById("nextTetro");
        const nextContext = nextCanvas.getContext("2d");
        const next3Canvas = document.getElementById("next3Tetro");
        const next3Context = next3Canvas.getContext("2d");
        const holdCanvas = document.getElementById("holdTetro");
        const holdContext = holdCanvas.getContext("2d");
        return new Renderer(canvas, context, nextCanvas, nextContext, next3Canvas, next3Context, holdCanvas, holdContext); 
    }

    generateNewTetromino(){
        return new Tetromino();
    }

    changeTetromino(){

        if (!this.doHold) {
            console.log('既にholdしています');
            return;
        }
        let currentX = this.currentTetromino.x;
        let currentY = this.currentTetromino.y;
        if (this.holdTetromino == null){
            if (!this.canMove(0, 0, this.nextTetros[0].shape)) return; 
            this.currentTetromino.initializeShape();
            this.holdTetromino = this.currentTetromino;
            this.currentTetromino = this.nextTetros.shift(0);
            this.currentTetromino.x = currentX;
            this.currentTetromino.y = currentY;
            this.nextTetros.push(this.generateNewTetromino());
            this.doHold = false;
            return;
        }

        if (!this.canMove(0, 0, this.holdTetromino.shape)) {
            console.log('干渉あり');
            return;
        }
        this.currentTetromino.initializeShape(); 
        let tmp = this.currentTetromino;
        this.currentTetromino = this.holdTetromino;
        this.holdTetromino = tmp;
        this.currentTetromino.x = currentX;
        this.currentTetromino.y = currentY;
        this.doHold = false;
    }

    start(){
        this.isGameOver = false;
        this.sound.startBGM();
        this.update();
    }

    update(){
        this.displayTime();

        this.checkGameOver();
        if (this.isGameOver){
            return;
        }


        this.renderer.clear();
        this.renderer.drawField(this.field);
        this.renderer.drawShadow(this.currentTetromino);
        this.renderer.drawNextTetros(this.nextTetros);
        this.renderer.drawHoldTetro(this.holdTetromino);
        this.renderer.drawTetromino(this.currentTetromino);
        this.moveTetro();
        currentScore.innerHTML = this.scoreManager.score;
        let linesCleared = this.field.clearLines();
        if (linesCleared > 0) {
            this.scoreManager.incrementLinesCleared(linesCleared);
            this.scoreManager.updateLevel();
            this.scoreManager.incrementCombo();
            if (this.field.isClear()){
                this.scoreManager.perfectClear(linesCleared);
            }
        } else {
            this.scoreManager.initCombo();
        }

        setTimeout(() => this.update(), this.updateInterval);
        
    }

    moveTetro() {
        if (!this.canMove(0, 1)) {
            this.scoreManager.score++;
            console.log(this.scoreManager.score);
            this.field.addTetromino(this.currentTetromino);
            this.currentTetromino = this.nextTetros.shift(0);
            this.nextTetros.push(this.generateNewTetromino());
            return;
        }
        this.currentTetromino.y += 1;
    }

    checkGameOver(){
        let shape = this.currentTetromino.shape
        for (let x = 0; x < shape.length; x++){
            for (let y = 0; y < shape.length; y++) {
                
                if (shape[y][x] && this.field.grid[y + this.currentTetromino.y][x + this.currentTetromino.x]) {
                    document.getElementById("modal-btn").dispatchEvent(new Event("click"));
                    this.isGameOver = true;
                }
            }
        }
    }

    canMove(movementX, movementY, newTetro = this.currentTetromino.shape) {
        for (let y = 0; y < newTetro.length; y++) {
            for (let x = 0; x < newTetro[y].length; x++) {
                if (newTetro[y][x]) {
                    let newX = this.currentTetromino.x + movementX + x;
                    let newY = this.currentTetromino.y + movementY + y;
                    if (newY < 0 || newY >= this.field.rows || newX < 0 || newX >= this.field.cols || this.field.grid[newY][newX]) return false;
                }
            }
        }
        return true;
    }

    startStop() {
        if (!this.doPause) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
            this.stopTime += (Date.now() - this.startTime);
            this.doPause = true;
            restartPauseBtn.innerHTML = `Restart`;
            restartPauseBtn.disabled = true;
            restartPauseBtn.disabled = false;
            return;
        }
        this.doPause = false;
        restartPauseBtn.innerHTML = `Pause`;
        restartPauseBtn.disabled = true;
        restartPauseBtn.disabled = false;
        this.startTime = Date.now();
        this.gameInterval = setInterval(() => this.update(), 500);
    }

    displayTime() {
        const currentTime = new Date(Date.now() - this.startTime + this.stopTime);
        const h = String(currentTime.getHours()-9).padStart(2, '0');
        const m = String(currentTime.getMinutes()).padStart(2, '0');
        const s = String(currentTime.getSeconds()).padStart(2, '0');

        const time = document.getElementById('time');
        time.textContent = `${h}:${m}:${s}`;

    }
}

class Tetromino {
    constructor() {
        this.tetrominoShapes = {
            'T': {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: [191, 127, 255],
                startX: 4
            },
            'L': {
                shape: [
                    [0, 0, 2],
                    [2, 2, 2],
                    [0, 0, 0],
                ],
                color: [255,191,127],
                startX: 4
            },
            'I': {
                shape: [
                    [0, 0, 0, 0],
                    [3, 3, 3, 3],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: [127,255,255],
                startX: 3
            },
            'O': {
                shape: [
                    [4, 4],
                    [4, 4]
                ],
                color: [255,255,127],
                startX: 4
            },
            'S': {
                shape: [
                    [0, 5, 5],
                    [5, 5, 0],
                    [0, 0, 0]
                ],
                color: [127,255,127],
                startX: 3
            },
            'J': {
                shape: [
                    [6, 0, 0],
                    [6, 6, 6],
                    [0, 0, 0]
                ],
                color: [127,191,255],
                startX: 3
            },
            'Z': {
                shape: [
                    [7, 7, 0],
                    [0, 7, 7],
                    [0, 0, 0]
                ],
                color: [255,127,127],
                startX: 3
            }
        };
        const tetroInfo = this.getRandomTetrominoShape();
        this.shape = tetroInfo.shape;
        this.originalShape = this.shape;
        this.color = tetroInfo.color;
        this.x = tetroInfo.startX;
        this.y = 0;
    }

    getRandomTetrominoShape() {
        const shapes = Object.keys(this.tetrominoShapes);
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        // return this.tetrominoShapes[randomShape];
        // テスト用
        return this.tetrominoShapes["I"];
    }
    
    initializeShape() {
        this.shape = this.originalShape;
    }

    rotate() {
        let newTetro = [];
        for (let y = 0; y < this.shape.length; y++) {
            newTetro[y] = [];
            for (let x = 0; x < this.shape[y].length; x++) {
                newTetro[y][x] = this.shape[this.shape.length - x - 1][y];
            }
        }
        return newTetro;
    }
}

class Field {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.colorType = {0: [64, 64, 64], 1: [191, 127, 255], 2: [255,191,127], 3: [127,255,255], 4: [255,255,127], 5: [127,255,127], 6: [127,191,255], 7:[255,127,127]};
        this.grid = this.initializeGrid(rows, cols);
    }

    initializeGrid(rows, cols) {
        let grid = [];
        for (let i = 0; i < rows; i++) {
            grid[i] = [];
            for (let j = 0; j < cols; j++) {
                grid[i][j] = 0;
            }
        }
        return grid;
    }

    addTetromino(tetro) {
        for (let y = 0; y < tetro.shape.length; y++) {
            for (let x = 0; x < tetro.shape[y].length; x++) {
                let colorCode = tetro.shape[y][x];
                if (colorCode != 0) {
                    this.grid[tetro.y+y][tetro.x+x] = colorCode;
                }
            }
        }
        game.doHold = true;
    }

    isClear() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] != 0) return false;
            }
        }

        return true;
    }

    clearLines() {
        let linesCleared = 0;
    
        for (let y = this.rows - 1; y >= 0; y--) {
            let isFull = true;
    
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 0) {
                    isFull = false;
                    break;
                }
            }
    
            if (isFull) {
                this.grid.splice(y, 1);
                linesCleared++;
    
                this.grid.unshift(new Array(this.cols).fill(0));
                game.sound.clearLines();
                y++;
            }
        }
        
        return linesCleared;
    }


}

class ScoreManager {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.combo = 0;
    }

    // perfect Clear;
    perfectClear(linesCleared) {
        if (linesCleared == 1) this.score += 900;
        if (linesCleared == 2) this.score += 1500;
        if (linesCleared == 3) this.score += 2300;
        if (linesCleared == 4) {
            this.score += 2800;
            console.log("call 2800");
        }
        
    }

    addScore(linesCleared) {
        const scores = {1: 100, 2: 300, 3: 500, 4 : 800};
        this.score += scores[linesCleared];

    }

    addLevel() {
        if (this.level < 20) game.updateInterval -= 35;
        this.level++;
    }

    updateLevel() {
        const linesPerLevel = 10;
        if (this.level <= 10) {
            if (this.linesCleared >= linesPerLevel * this.level) {
                this.addLevel();
                this.linesCleared = 0;
            }
        } else {
            if  (this.linesCleared >= 100) {
                this.addLevel();
                this.linesCleared = 0;
            }
        }
        currentLevel.innerHTML = this.level;
    }

    incrementLinesCleared(count) {
        this.linesCleared += count;
        this.addScore(count);
    }

    getScore() {
        return this.score;
    }

    getLevel() {
        return this.level;
    }

    initCombo() {
        this.combo = 0;
    }

    incrementCombo() {
        this.combo += 1;
        this.score += this.combo * 50;
    }
}

class Renderer{
    constructor(canvas, context, nextCanvas, nextContext, next3Canvas, next3Context, holdCanvas, holdContext){
        this.canvas = canvas;
        this.context = context;
        this.blockSize = 27;
        this.canvas.width = this.blockSize * 10;
        this.canvas.height = this.blockSize * 20;

        this.canvas.style.backgroundColor = "gray";

        this.miniWidth = 5; 

        this.nextCanvas = nextCanvas;
        this.nextContext = nextContext;
        this.nextCanvas.width = this.blockSize * this.miniWidth;
        this.nextCanvas.height = this.blockSize * 4;
        this.nextCanvas.style.backgroundColor = `rgb(64, 64, 64)`;

        this.next3Canvas = next3Canvas;
        this.next3Context = next3Context;
        this.next3Canvas.width = this.blockSize * this.miniWidth;
        this.next3Canvas.height = this.blockSize * 10;
        this.next3Canvas.style.backgroundColor = `rgb(64, 64, 64)`;

        this.holdCanvas = holdCanvas;
        this.holdContext = holdContext;
        this.holdCanvas.width = this.blockSize * this.miniWidth;
        this.holdCanvas.height = this.blockSize * 4;
        this.holdCanvas.style.backgroundColor = `rgb(64, 64, 64)`;
    }

    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    drawBlock(x, y, r, g, b) {
        let blockEdge = this.blockSize;

        // ブロックの本体
        this.context.fillRect(x * blockEdge, y * blockEdge, blockEdge, blockEdge);
        this.context.strokeRect(x * blockEdge, y * blockEdge, blockEdge, blockEdge);

        // 影の描画
        this.context.fillStyle = `rgba(0, 0, 0, 0.2)`;
        this.context.fillRect(x * blockEdge + 5, y * blockEdge + 5, blockEdge, blockEdge);
    }

    drawField(field){
        for (let y = 0; y < field.rows; y++) {
            for (let x = 0; x < field.cols; x++) {
                let colorCode = field.grid[y][x];
                let [r, g, b] = field.colorType[colorCode];
                this.context.fillStyle = `rgb(${r}, ${g}, ${b})`
                this.context.strokeStyle = `rgba(0, 0, 0, 1)`;
                this.drawBlock(x, y, r, g, b);
            }
        }
    }
    

    drawTetromino(tetro){
        let [r, g, b] = tetro.color;
        for (let y = 0; y < tetro.shape.length; y++) {
            for (let x = 0; x < tetro.shape[y].length; x++) {
                if (tetro.shape[y][x] != 0) {
                    this.context.fillStyle = `rgb(${r}, ${g}, ${b})`
                    this.context.strokeStyle = `rgba(0, 0, 0, 1)`;
                    this.drawBlock(tetro.x+x, tetro.y+y, r, g, b);
                }
            }
        
        }
    }
    drawShadow(tetro) {
        let [r, g, b] = tetro.color;
        this.context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
        this.context.strokeStyle = `rgba(0, 0, 0, 0.1)`;
        let shadowY = 0;
        while (game.canMove(0, shadowY + 1)) shadowY += 1;
        for (let y = 0; y < tetro.shape.length; y++) {
            for (let x = 0; x < tetro.shape[y].length; x++) {
                if (tetro.shape[y][x] != 0) { 
                    this.context.fillRect((tetro.x + x) * this.blockSize, (tetro.y + shadowY + y) * this.blockSize, this.blockSize, this.blockSize);
                    this.context.strokeRect((tetro.x + x) * this.blockSize, (tetro.y + shadowY + y) * this.blockSize, this.blockSize, this.blockSize);
                }
            }
        }
    }

    drawNextTetros(nextTetros) {
        let h = 0;
        for (let y = 0; y < nextTetros[0].shape.length; y++) {
            for (let x = 0; x < nextTetros[0].shape[y].length; x++) {
                if (nextTetros[0].shape[y][x] != 0) {
                    h++;
                    break;
                }
            }
        }
        h = 2 - (h / 2);

        this.nextContext.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height)
        let [r, g, b] = nextTetros[0].color;
        for (let y = 0; y < nextTetros[0].shape.length; y++) {
            let flag = false;
            for (let x = 0; x < nextTetros[0].shape[y].length; x++) {
                if (nextTetros[0].shape[y][x] != 0) {
                    this.nextContext.fillStyle = `rgba(${r}, ${g}, ${b})`;
                    this.nextContext.fillRect((x + (this.miniWidth - nextTetros[0].shape[y].length) / 2) * this.blockSize, h * this.blockSize, this.blockSize, this.blockSize);
                    this.nextContext.strokeRect((x + (this.miniWidth - nextTetros[0].shape[y].length) / 2) * this.blockSize, h * this.blockSize, this.blockSize, this.blockSize);
                    this.nextContext.fillStyle = `rgba(0, 0, 0, 0.2)`;
                    this.nextContext.fillRect((x + (this.miniWidth - nextTetros[0].shape[y].length) / 2) * this.blockSize + 5, h * this.blockSize + 5, this.blockSize, this.blockSize);
                    flag = true;
                }
            }
            if (flag) h++;
        }

        this.next3Context.clearRect(0, 0, this.next3Canvas.width, this.next3Canvas.height);
        for (let i = 1; i <= 3; i++) {
            [r, g, b] = nextTetros[i].color;
            for (let y = 0; y < nextTetros[i].shape.length; y++) {
                for (let x = 0; x < nextTetros[i].shape[y].length; x++) {
                    if (nextTetros[i].shape[y][x] != 0) {
                        this.next3Context.fillStyle = `rgba(${r}, ${g}, ${b})`;
                        this.next3Context.fillRect((x + (this.miniWidth - nextTetros[i].shape[y].length) / 2) * this.blockSize, (y + (i-1)*3 + 1) * this.blockSize, this.blockSize, this.blockSize);
                        this.next3Context.strokeRect((x + (this.miniWidth - nextTetros[i].shape[y].length) / 2) * this.blockSize, (y + (i-1)*3 + 1) * this.blockSize, this.blockSize, this.blockSize);
                        this.next3Context.fillStyle = `rgba(0, 0, 0, 0.2)`;
                        this.next3Context.fillRect((x + (this.miniWidth - nextTetros[i].shape[y].length) / 2) * this.blockSize + 5, (y + (i-1)*3 + 1) * this.blockSize + 5, this.blockSize, this.blockSize);
                    }
                }
            }
        }
    }

    drawHoldTetro(holdTetro) {

        if (game.holdTetromino == null) return;
        let h = 0;
        for (let y = 0; y < holdTetro.shape.length; y++) {
            for (let x = 0; x < holdTetro.shape[y].length; x++) {
                if (holdTetro.shape[y][x] != 0) {
                    h++;
                    break;
                }
            }
        }
        h = 2 - (h / 2);

        this.holdContext.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        let [r, g, b] = holdTetro.color;
        for (let y = 0; y < holdTetro.shape.length; y++) {
            let flag = false;
            for (let x = 0; x < holdTetro.shape[y].length; x++) {
                if (holdTetro.shape[y][x] != 0) {
                    this.holdContext.fillStyle = `rgba(${r}, ${g}, ${b})`;
                    this.holdContext.fillRect((x + (this.miniWidth - holdTetro.shape[y].length) / 2) * this.blockSize, h * this.blockSize, this.blockSize, this.blockSize);
                    this.holdContext.strokeRect((x + (this.miniWidth - holdTetro.shape[y].length) / 2) * this.blockSize, h * this.blockSize, this.blockSize, this.blockSize);
                    this.holdContext.fillStyle = `rgba(0, 0, 0, 0.2)`;
                    this.holdContext.fillRect((x + (this.miniWidth - holdTetro.shape[y].length) / 2) * this.blockSize + 5, h * this.blockSize + 5, this.blockSize, this.blockSize);
                    flag = true;
                }
            }
            if (flag) h++;
        }
    }
}

class Sound{
    
    constructor(){
        this.BGMSound = new Audio('sounds/BGM.mp3');
        this.BGMSound.volume = 0.01;
        this.BGMSound.loop = true;
    }

    hardDrop(){
        let hardDropSound = new Audio('sounds/hardDrop.mp3');
        hardDropSound.volume = 0.1;
        hardDropSound.play();
    }

    rotate(){
        let rotateSound = new Audio('sounds/123.mp3');
        rotateSound.volume = 0.1;
        rotateSound.play();
    }

    clearLines(){
        let clearLinesSound = new Audio('sounds/clearLines.mp3');
        clearLinesSound.volume = 0.1;
        clearLinesSound.play();
    }

    fixTetro(){
        let fixTetroSound = new Audio('sounds/fixTetro.mp3');
        fixTetroSound.volume = 0.1;
        fixTetroSound.play();
    }

    startBGM(){
        this.BGMSound.play();
    }

    stopBGM(){
        this.BGMSound.pause();
    }
}


function displayNone(ele) {
    ele.classList.remove("d-block");
    ele.classList.add("d-none");
}

function displayBlock(ele) {
    ele.classList.remove("d-none");
    ele.classList.add("d-block");
}

function switchPage(page1, page2) {
    displayNone(page1);
    displayBlock(page2);
}

let game;

function gameStart() {
    switchPage(config.initialPage, config.mainPage);
    game = new Game();
    game.start();
}

function startPause() {
    game.startStop();
}

const restartPauseBtn = document.getElementById("restartPauseBtn");

function moveInitialPage() {
    switchPage(config.mainPage, config.initialPage);
}

const resetBtn = document.getElementById("resetBtn");
function resetAllData() {
    if (!game.doPause) startPause();
    resetBtn.disabled = true;
    resetBtn.disabled = false;
    if (window.confirm("Reset All Data?")) {
        gameStart();
        restartPauseBtn.innerHTML = `Pause`;
    }
}

const backBtn = document.getElementById("backBtn");
function backPage() {
    if (!game.doPause) startPause();
    backBtn.disabled = true;
    backBtn.disabled = false;
    if (window.confirm("Back Page?")) {
        moveInitialPage();
        restartPauseBtn.innerHTML = `Pause`;
    }
}

const currentLevel = document.getElementById("level");
const currentScore = document.getElementById("score");

document.onkeydown = function(e) {
    if (game.isGameOver) return;
    if (game.doPause) return;
    switch(e.key) {
        case "ArrowLeft":
            if (game.canMove(-1, 0)) game.currentTetromino.x--;
            break;
        case "ArrowRight":
            if (game.canMove(1, 0)) game.currentTetromino.x++;
            break;
        case "ArrowDown":
            if (game.canMove(0, 1)) game.currentTetromino.y++;
            break;
        case "ArrowUp":
            let newTetro = game.currentTetromino.rotate();
            if (game.canMove(0, 0, newTetro)) game.currentTetromino.shape = newTetro;
            game.sound.rotate();
            break;
        case " ":
            while (game.canMove(0, 1)) game.currentTetromino.y++;
            game.scoreManager.score++;
            game.sound.hardDrop();
            break; 
        case "Shift":
            game.changeTetromino();
            break;
    }
    game.renderer.clear();
    game.renderer.drawField(game.field);
    game.renderer.drawShadow(game.currentTetromino);
    game.renderer.drawTetromino(game.currentTetromino);
}


const titleTetro =
[
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 2, 2, 2, 2, 0, 3, 3, 3, 3, 3, 0, 4, 4, 4, 4, 0, 0, 5, 0, 0, 6, 6, 6, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 4, 0, 5, 0, 6, 0, 0, 0, 6, 0],
    [0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 4, 0, 5, 0, 6, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 3, 0, 0, 0, 4, 4, 4, 4, 0, 0, 5, 0, 0, 6, 6, 6, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 4, 0, 0, 0, 5, 0, 0, 0, 0, 0, 6, 0],
    [0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 4, 0, 0, 5, 0, 6, 0, 0, 0, 6, 0],
    [0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 4, 0, 5, 0, 0, 6, 6, 6, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
const titleColor = {0:[64, 64, 64], 1:[255,127,127], 2:[255,191,127], 3:[255,255,127], 4:[127,255,127], 5:[127,191,255], 6:[191, 127, 255]};
const titleBlockSize = 25;
const titleMiniBlockSize = 10;

const titleCanvas = document.getElementById("title");
const titleContext = titleCanvas.getContext("2d");
titleCanvas.width = titleBlockSize * titleTetro[0].length;
titleCanvas.height = titleBlockSize * titleTetro.length;
titleCanvas.style.backgroundColor = `rgb(64, 64, 64)`;

const titleMiniCanvas = document.getElementById("mini-title");
const titleMiniContext = titleMiniCanvas.getContext("2d");
titleMiniCanvas.width = titleMiniBlockSize * titleTetro[0].length;
titleMiniCanvas.height = titleMiniBlockSize * titleTetro.length;
titleMiniCanvas.style.backgroundColor = `rgb(64, 64, 64)`;

drawTitle(titleContext, titleBlockSize);
drawTitle(titleMiniContext, titleMiniBlockSize);

function drawTitle(targetContext ,blockSize) {
    for (let y = 0; y < titleTetro.length; y++) {
        for (let x = 0; x < titleTetro[0].length; x++) {
            if (titleTetro[y][x] != 0) {
                let [r, g, b] = titleColor[titleTetro[y][x]];
                targetContext.fillStyle = `rgba(${r}, ${g}, ${b})`;
                targetContext.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                // targetContext.strokeStyle = `rgba(0, 0, 0, 1)`;
                targetContext.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
                targetContext.fillStyle = `rgba(0, 0, 0, 0.2)`;
                targetContext.fillRect(x * blockSize + 5, y * blockSize + 5, blockSize, blockSize);
            }
        }
    }
}
