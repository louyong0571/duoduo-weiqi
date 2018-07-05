var chess = document.getElementById("mycanvas");
var context = chess.getContext('2d');
var me = true;
var chessBox = [];//用于存放棋盘中落子的情况

var B = [];
var eatCount = 0;
var need_wait = false
var eatBlackCount = 0;
var eatWhiteCount = 0;


function initShaFive() {
    for (var i = 0; i < 19; i++) {
        chessBox[i] = [];
        for (var j = 0; j < 19; j++) {
            chessBox[i][j] = 0;//初始值为0
        }
    }
    chessBox[9][9] = 1;
    chessBox[9][10] = 2;
    chessBox[10][9] = 2;
    chessBox[10][10] = 1;
}

function drawChessBoard() {
    context.clearRect(0, 0, 570, 570);
    for (var i = 0; i < 19; i++) {
        context.strokeStyle = "#D6D1D1";
        context.moveTo(15 + i * 30, 15);//垂直方向画19根线，相距30px;
        context.lineTo(15 + i * 30, 555);
        context.stroke();
        context.moveTo(15, 15 + i * 30);//水平方向画19根线，相距30px;棋盘为14*14；
        context.lineTo(555, 15 + i * 30);
        context.stroke();
    }

    for (var i = 0; i < 19; i++) {
        for (var j = 0; j < 19; j++) {
            if (chessBox[i][j] !== 0) {
                oneStep(i, j, chessBox[i][j]);
            }
        }
    }
}

function initGame() {
    initShaFive();
    drawChessBoard();
    eatBlackCount = 0;
    eatWhiteCount = 0;
}


function initFlagMatrix() {
    for (var i = 0; i < 19; i++) {
        B[i] = [];
        for (var j = 0; j < 19; j++)
            B[i][j] = false;
    }
}

function hasAir(i, j, type) {
    if (chessBox[i][j] == 0)
        return true;
    if (chessBox[i][j] != type)
        return false;
    eatCount++;

    B[i][j] = true;
    if (i > 0 && !B[i - 1][j] && hasAir(i - 1, j, type)) return true;
    else if (i < 18 && !B[i + 1][j] && hasAir(i + 1, j, type)) return true;
    else if (j > 0 && !B[i][j - 1] && hasAir(i, j - 1, type)) return true;
    else if (j < 18 && !B[i][j + 1] && hasAir(i, j + 1, type)) return true;
    else return false;
}

function hasAirOfType(type) {
    for (var i = 0; i < 19; i++) {
        for (var j = 0; j < 19; j++) {
            initFlagMatrix();
            if (chessBox[i][j] != type || B[i][j])
                continue;
            eatCount = 0;
            if (!hasAir(i, j, type)) {
                return {result: false, x: i, y: j}
            }
        }
    }
    return {result: true, x: -1, y: -1};
}

function oneStep(i, j, k) {
    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);//绘制棋子
    var g = context.createRadialGradient(15 + i * 30, 15 + j * 30, 13, 15 + i * 30, 15 + j * 30, 0);//设置渐变
    if (k === 1) {                           //k=true是黑棋，否则是白棋
        g.addColorStop(0, '#0A0A0A');//黑棋
        g.addColorStop(1, '#636766');
    } else {
        g.addColorStop(0, '#D1D1D1');//白棋
        g.addColorStop(1, '#F9F9F9');
    }
    context.fillStyle = g;
    context.fill();
    context.closePath();
}

function eatenChesscount(i, j, type) {
    initFlagMatrix();
    var self_hasAir = hasAir(i, j, type);
    eatCount = 0;

    var other_type = (type == 1 ? 2 : 1);
    initFlagMatrix();
    var other_hasAir = hasAirOfType(other_type);

    if (!self_hasAir && other_hasAir.result)//自杀
    {
        console.log('自杀');
        return 2147483647;
    }
    if (!other_hasAir.result) {
        console.log('发生吃子');
        eatChess(other_hasAir.x, other_hasAir.y, other_type);
        if (other_type == 1) //白子正数
            return eatCount;
        else                //黑子负数
            return 0 - eatCount;
    }
    return 0;
}

function eatChess(i, j, type) {
    if (chessBox[i][j] != type) return;
    chessBox[i][j] = 0;    //吃掉子
    if (type === 1) {
        eatBlackCount ++;
    }
    if (type === 2) {
        eatWhiteCount ++;
    }
    if (i > 0) eatChess(i - 1, j, type);
    if (i < 18) eatChess(i + 1, j, type);
    if (j > 0) eatChess(i, j - 1, type);
    if (j < 18) eatChess(i, j + 1, type);
}

function onStep(i, j, a_me) {
    if (chessBox[i][j] == 0) {
        if (a_me) {
            chessBox[i][j] = 1;
        } else {
            chessBox[i][j] = 2;
        }
        if (2147483647 === eatenChesscount(i, j, a_me ? 1 : 2)) {
            alert('禁入点！！');
            chessBox[i][j] = 0;
        } else {
            if (!force_me) me = !a_me;//非对战的话下一步白棋
        }
    }
    drawChessBoard();
    console.log("黑子被吃：" + eatBlackCount + " 白子被吃：" + eatWhiteCount)
    onEaten(eatBlackCount,eatWhiteCount);
}

chess.onclick = function (e) {
    if (need_wait)  {
        alert('等待对方下子');
        return;
    }
    var x = e.offsetX;//相对于棋盘左上角的x坐标
    var y = e.offsetY;//相对于棋盘左上角的y坐标
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);
    onStep(i, j, me);
    if (force_me) {
        ws.send('chess:' + i + ":" + j + ":" + me);
        need_wait = true;
    }
}


initGame();