
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

//let img = document.getElementById("redtop");

let img = new Image();
img.src = "/images/redtop.png";
img.onload = function() {
    context.drawImage(img, 1, 1);
}
  
const matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0]
];

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 && 
                (arena[y+o.y] && arena[y + o.y][x + o.x]) !== 0 ) {
                return true;
            }
        }
    }
    return false;
}


const colors = [
    null,
    '#ef233c',
    '#56E39F',
    '#BF4E30',
    '#8B80F9',
    '#E7E247',
    '#9B287B',
    '#48BF84'
]

function createPiece(type) {
    /* Pieces
    O - 2x2 Box
                    x x
                    x x

    i - 1x4 line
                    x
                    x
                    x
                    x

    s - 2x(1x2)
                      x x   
                    x x

    z - 2x(1x2)
                    x x    
                      x x

    l - 1x(1x3) & 1x1
                    x
                    x
                    x x

    j - 1x(1x3) & 1x1
                      x
                      x
                    x x
                       
                
    t - 1x(3x1) & 1x1
                    x x x 
                      x
    */          
    switch(type) {
        case 'O': 
        return [[1, 1],
                [1, 1]]; break;

        case 'I': 
        return [[0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],]; break;     

        case 'S': 
        return [[0, 0, 0],
                [0, 3, 3],
                [3, 3, 0]]; break;     
                
        case 'Z': 
        return [[0, 0, 0],
                [4, 4, 0],
                [0, 4, 4]]; break;     
                

        case 'L': 
        return [[0, 5, 0],
                [0, 5, 0],
                [0, 5, 5]]; break;     
                
        case 'J': 
        return [[0, 6, 0],
                [0, 6, 0],
                [6, 6, 0]]; break;

        case 'T': 
        return [[0, 0, 0],
                [7, 7, 7],
                [0, 7, 0]]; break;

    }


}


//Creates a 2d array representing the game board, filling it's values with empty slots.
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                arena[y+player.pos.y][[x + player.pos.x]] = value;
            }
        });
    });
}



let dropCounter = 0;
let dropInterval = 1000;
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        //console.table(arena);
    }
    dropCounter = 0;
}


function playerMove(direction) {
    player.pos.x += direction;
    if(collide(arena, player)) {
        player.pos.x -= direction;
    }
}


function playerReset() {
    const pieces = 'OISZJLT';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2));

    if(collide(arena, player)) {
        arena.forEach(row => row.fill(0));
    }
}

function playerRotate(direction) {
    let offset = 1;
    const pos = player.pos.x;
    rotate(player.matrix, direction);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = (offset * - 1) + 1;
        if(offset > player.matrix[0].length) {
            rotate(player.matrix, -direction);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, direction) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x =0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    if (direction > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}


let lastTime = 0;
function update(time = 0) {
    const deltaTtime = time - lastTime;
    lastTime = time;
    //console.log(deltaTtime);
    dropCounter+=deltaTtime;
    if(dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const player = {
    pos: {x: 5, y: 5},
    matrix: createPiece('I')
}

const arena = createMatrix(12, 20);
//console.log(arena); console.table(arena);

document.addEventListener('keydown', event => {
    
    console.log(event.key);

    switch(event.key) {
        case "ArrowLeft": playerMove(-1);
            break;
        case "ArrowRight": playerMove(1);
            break;
        case "ArrowDown": playerDrop();
            break;
        case "r": playerRotate(-1);
            break;
        case "t": playerRotate(1);
            break;

    }
});

update();