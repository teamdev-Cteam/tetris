class Game {
    constructor(){
        this.field = new Field(20, 10);
        this.currentTetromino = this.generateNewTetromino();
        this.isGameOver = false;
        this.gameInterval = null;
        this.renderer = this.initRenderer();
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
        if (this.isGameOver){
            clearInterval(this.gameInterval);
            console.log("Game Over");
            return;
        }
        //ゲームの更新

        // プレイヤーの入力を受け付ける
        // キー入力で回転


        // 当たり判定
        // もし次移動する場所がブロックまたは床だったら、fieldにテトロを追加


        // canMoveの動作チェック
        console.log(this.field.canMove(this.currentTetromino.x, this.currentTetromino.y, 0, 1, this.currentTetromino.tetro));

        // 仮にy座標を+1ずつする
        if (!this.field.canMove(this.currentTetromino.x, this.currentTetromino.y, 0, 1, this.currentTetromino.tetro)) {
            return;
        }
        this.currentTetromino.y += 1;

        this.renderer.clear();
        this.renderer.drawField(this.field);
        this.renderer.drawTetromino(this.currentTetromino);

    }

    checkGameOver(){

    }
}

class Tetromino {
    constructor() {
        this.tetrominoShapes = {
            'T': {
                shape: [
                    [1, 0, 0],
                    [1, 1, 0],
                    [1, 0, 0]
                ],
                color: 'purple',
                startX: 4
            },
            'L': {
                shape: [
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 1, 0]
                ],
                color: 'orange',
                startX: 4
            },
            'I': {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: 'cyan',
                startX: 3
            },
            'O': {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: 'yellow',
                startX: 4
            },
            'S': {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: 'green',
                startX: 3
            },
            'J': {
                shape: [
                    [0, 1, 0],
                    [0, 1, 0],
                    [1, 1, 0]
                ],
                color: 'blue',
                startX: 3
            },
            'Z': {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: 'red',
                startX: 3
            }
        };
        this.tetroInfo = this.getRandomTetrominoShape();
        this.tetro = this.tetroInfo.shape;
        this.color = this.tetroInfo.color;
        this.x = this.tetroInfo.startX;
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

    }
}

class Field {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
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

    }

    clearLines() {

    }

    canMove(currX, currY, movementX, movementY, newTetro) {
        for (let y = 0; y < newTetro.length; y++) {
            for (let x = 0; x < newTetro[y].length; x++) {
                if (newTetro[y][x]) {
                    let newX = currX + movementX + x;
                    let newY = currY + movementY + y;
                    if (newY < 0 || newY >= this.rows || newX < 0 || newX >= this.cols || this.grid[newY][newX]) return false;
                }
            }
        }
        return true;
    }
}

class Renderer{
    constructor(canvas, field){
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext('2d');
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
                if (field.grid[y][x] !== 0) {
                    this.context.fillStyle = 'gray'; // ここではすべてのテトロミノを灰色で描画しています
                    this.context.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                    this.context.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize); // ブロックの枠線を描画
                }
            }
        }
    }

    drawTetromino(tetromino){
        this.context.fillStyle = tetromino.color; // テトロミノの色を設定
        for (let y = 0; y < tetromino.tetro.length; y++) {
            for (let x = 0; x < tetromino.tetro[y].length; x++) {
                if (tetromino.tetro[y][x]) { // テトロミノの形状配列で1に相当する部分を描画
                    this.context.fillRect((tetromino.x + x) * this.blockSize, (tetromino.y + y) * this.blockSize, this.blockSize, this.blockSize);
                    this.context.strokeRect((tetromino.x + x) * this.blockSize, (tetromino.y + y) * this.blockSize, this.blockSize, this.blockSize); // ブロックの枠線を描画
                }
            }
        
        }
    }
    
}




function gameStart() {
    console.log("gameStart");
    const game = new Game();
    game.start();
}

gameStart();
