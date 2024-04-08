let board = document.getElementById("board");
let block = board.getContext("2d");

const FIELD_COL = 10;
const FIELD_ROW = 20;
const BLOCK_SIZE = 30;
const TETRO_SIZE = 4;
const SCREEN_W = BLOCK_SIZE * FIELD_COL;
const SCREEN_H = BLOCK_SIZE * FIELD_ROW;
board.width = SCREEN_W;
board.height = SCREEN_H;


let tetro = [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0]
]

let tetroX = 0;
let tetroY = 0;

drawTetro();


function drawTetro () {
    block.clearRect(0, 0, SCREEN_W, SCREEN_H);
    for (let y=0; y<TETRO_SIZE; y++){
        for (let x=0; x<TETRO_SIZE; x++){
            if (tetro[y][x]){
                let px = (tetroX+x)*BLOCK_SIZE;
                let py = (tetroY+y)*BLOCK_SIZE;
    
                block.fillStyle = "red";
                block.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}


document.addEventListener("keydown", function(event) {
    switch (event.key) {
        case "ArrowUp":
            // 上矢印キーが押されたとき
            break;
        case "ArrowDown":
            // 下矢印キーが押されたとき
            tetroY++;
            drawTetro();
            break;
        case "ArrowLeft":
            // 左矢印キーが押されたとき
            tetroX--;
            break;
        case "ArrowRight":
            // 右矢印キーが押されたとき
            tetroX++;
            break;
        default:
            break;
    }
})

// ==================================================
// ホールド
// ==================================================

let hold = document.getElementById("mini-grid")
let nextBlock = hold.getContext("2d")

hold.width = BLOCK_SIZE * 4;
hold.height = BLOCK_SIZE * 4;