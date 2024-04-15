class Game {
    constructor(){
        this.field = new Field(20, 10);
        this.currentTetromino = this.generateNewTetromino();
        this.isGameOver = false;
        this.gameInterval = null;
        this.renderer = this.initRenderer();
        this.doPause = true;
    }

    initRenderer(){
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        return new Renderer(canvas, context); 

    }

    generateNewTetromino(){
        return new Tetromino();
    }

    start(){
        this.isGameOver = false;
        this.gameInterval = setInterval(() => this.update(), 500);

    }

    update(){

        this.checkGameOver();
        if (this.isGameOver){
            clearInterval(this.gameInterval);
            console.log("Game Over");
            return;
        }


        this.renderer.clear();
        this.renderer.drawField(this.field);
        this.renderer.drawTetromino(this.currentTetromino);

        this.moveTetro();
        this.field.clearLines();
        
    }

    moveTetro() {
        if (!this.canMove(0, 1)) {
            this.field.addTetromino(this.currentTetromino);
            this.currentTetromino = this.generateNewTetromino();
            return;
        }
        this.currentTetromino.y += 1;
    }

    checkGameOver(){
        let shape = this.currentTetromino.shape
        for (let x = 0; x < shape.length; x++){
            for (let y = 0; y < shape.length; y++) {
                
                if (shape[y][x] && this.field.grid[y + this.currentTetromino.y][x + this.currentTetromino.x]) {
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
        if (this.doPause) {
            clearInterval(this.gameInterval);
            this.doPause = false;
            return;
        }
        this.doPause = true;
        this.gameInterval = setInterval(() => this.update(), 500);
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
                color: 'purple',
                startX: 4
            },
            'L': {
                shape: [
                    [0, 0, 2],
                    [2, 2, 2],
                    [0, 0, 0],
                ],
                color: 'orange',
                startX: 4
            },
            'I': {
                shape: [
                    [0, 0, 0, 0],
                    [3, 3, 3, 3],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: 'cyan',
                startX: 3
            },
            'O': {
                shape: [
                    [4, 4],
                    [4, 4]
                ],
                color: 'yellow',
                startX: 4
            },
            'S': {
                shape: [
                    [0, 5, 5],
                    [5, 5, 0],
                    [0, 0, 0]
                ],
                color: 'green',
                startX: 3
            },
            'J': {
                shape: [
                    [6, 0, 0],
                    [6, 6, 6],
                    [0, 0, 0]
                ],
                color: 'blue',
                startX: 3
            },
            'Z': {
                shape: [
                    [7, 7, 0],
                    [0, 7, 7],
                    [0, 0, 0]
                ],
                color: 'red',
                startX: 3
            }
        };
        const tetroInfo = this.getRandomTetrominoShape();
        this.shape = tetroInfo.shape;
        this.color = tetroInfo.color;
        this.x = tetroInfo.startX;
        this.y = 0;
    }

    getRandomTetrominoShape() {
        const shapes = Object.keys(this.tetrominoShapes);
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        return this.tetrominoShapes[randomShape];
    }
    

    move(dx, dy){
        this.x += dx;
        this.y += dy;
    }

    rotate() {
        let newTetro = [];
        for (let y = 0; y < this.shape.length; y++) {
            newTetro[y] = [];
            for (let x = 0; x < this.shape[y].length; x++) {
                newTetro[y][x] = this.shape[this.shape.length - x - 1][y];
            }
        }
        console.log(newTetro);
        return newTetro;
    }
}

class Field {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.colorType = {1: 'purple', 2: 'orange', 3: 'cyan', 4: 'yellow', 5: 'green', 6: 'blue', 7:'red'};
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
    
                y++;
            }
        }
    
        return linesCleared;
    }


}

class Renderer{
    constructor(canvas, context){
        this.canvas = canvas;
        this.context = context;
        this.blockSize = 25;
        this.canvas.width = this.blockSize * 10;
        this.canvas.height = this.blockSize * 20;
        this.canvas.style.backgroundColor = "gray";
    }

    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawField(field){

        for (let y = 0; y < field.rows; y++) {
            for (let x = 0; x < field.cols; x++) {
                let colorCode = field.grid[y][x];
                if (colorCode !== 0) {
                    this.context.fillStyle = field.colorType[colorCode];
                    this.context.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                    this.context.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize); // ブロックの枠線を描画
                }
            }
        }
    }

    drawTetromino(tetro){
        this.context.fillStyle = tetro.color; // テトロミノの色を設定
        for (let y = 0; y < tetro.shape.length; y++) {
            for (let x = 0; x < tetro.shape[y].length; x++) {
                if (tetro.shape[y][x] != 0) { // テトロミノの形状配列で1に相当する部分を描画
                    this.context.fillRect((tetro.x + x) * this.blockSize, (tetro.y + y) * this.blockSize, this.blockSize, this.blockSize);
                    this.context.strokeRect((tetro.x + x) * this.blockSize, (tetro.y + y) * this.blockSize, this.blockSize, this.blockSize); // ブロックの枠線を描画
                }
            }
        
        }
    }
    
}




function gameStart() {
    console.log("gameStart");
    game.start();
}

const game = new Game();
gameStart();


document.onkeydown = function(e) {
    if (game.isGameOver) return;
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
            break;
        case " ":
            while (game.canMove(0, 1)) game.currentTetromino.y++;
            break; 
    }
    game.renderer.clear();
    game.renderer.drawField(game.field);
    game.renderer.drawTetromino(game.currentTetromino);
}