//* Register the Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/angry-birds/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err));
    });
}

// handle main loader
class Loader {
    static global() {
        Loader.interval;
        Loader.num = 0;
        Loader.pageSize = 135;
    }

    // get Percent
    static getPercent(total) {
        // select page resources
        const resources = performance.getEntries();
        // define a starting size
        let size = 0;

        // loop through resources
        resources.forEach(src => {
            if (src.transferSize !== undefined) size += Number(src.transferSize);
        });

        let current = size / 1000; // get size by kb
        let percent = Math.ceil((current / total) * 100);

        // init fn
        Loader.updateLoader(percent);

        if (Loader.num === 100) {
            // init fn
            Loader.updateLoader(100);
            // clear interval
            clearInterval(Loader.interval);
            // init hide layer fn
            Loader.hideLayer();
        }

    }

    // hide layer
    static hideLayer() {
        // select container
        const layer = document.getElementById('loader');
        setTimeout(() => {
            // hide loader
            layer.style.display = 'none';
            // style body overflow
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // update Loader
    static updateLoader(num) {
        // select container
        const container = document.querySelector('.main-loader');
        // select elements
        const bar = container.querySelector('.innerBar');
        const percent = container.querySelector('.percent');

        //* update info
        bar.style.width = `${num}%`;
        percent.textContent = `${num}%`;
    }

}
// init
Loader.global();
//! Events
// init interval
Loader.interval = setInterval(() => Loader.getPercent(Loader.pageSize), 1);
// onload event
window.addEventListener('load', () => Loader.num = 100, true);


class Game {

    static global() {
        // canvas
        Game.canvas = document.getElementById('canvas');
        Game.ctx = Game.canvas.getContext('2d');
        Game.mql = window.matchMedia('(min-width: 768px)');
        Game.width = (Game.mql.matches) ? 720 : window.innerWidth - 40;
        Game.height = 400;
        Game.ground_h = 50;
        // contoller keys
        Game.up = false;
        Game.left = false;
        Game.right = false;
        Game.jump = true;
        // gold
        Game.goldNum = 0;
        Game.goldSectorsArr = [5];
        // other
        Game.speed = 2;
        Game.score = 0;
        Game.scoreArr = [];
        Game.auto = true;
        Game.skippedKing = true;
        Game.interval;
        // control buttons
        Game.startBtn = document.getElementById('start');
        Game.restartBtn = document.getElementById('restart');
        Game.pauseCon = document.getElementById('pauseCon');
        // touch control
        Game.startX;
        Game.startY;
        Game.walkX;
        Game.walkY;
    }

    constructor(x, y, w, h, dx, dy, id) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.dx = dx;
        this.dy = dy;
        this.id = id;
    }

    // check storage
    static checkStorage() {
        let score;
        if (localStorage.getItem('score') === null) {
            score = [];
        } else {
            score = JSON.parse(localStorage.getItem('score'));
        }
        return score;
    }

    // get highest score fn
    static getHighestScore() {
        //! update
        Game.scoreArr = Game.checkStorage();
        //* push current score
        Game.scoreArr.push(Game.score);

        // get highest number
        let max = Math.max(...Game.scoreArr);
        // set array to highest score only
        Game.scoreArr = [max];

        //! update storage with highest score
        localStorage.setItem('score', JSON.stringify(Game.scoreArr));

        // select score holder
        const p = document.getElementById('highestScore');

        //* append score to UI
        p.textContent = `Highest Score: ${Game.scoreArr[0]}`;
    }

    // add responsiveness to game
    static responsiveness() {
        if (Game.mql.matches) { // min-width 768px
            Game.width = 720;
        } else {
            Game.width = window.innerWidth - 40;
        }
        // update width
        Game.canvas.width = Game.width;
        //! reset array
        Game.goldSectorsArr = [5];
    }

    // make game world
    makeWorld() {
        Game.ctx.drawImage(document.getElementById(this.id), this.x, this.y, this.w, this.h);
    }

    // controller
    static contoller(e) {
        let status = (e.type == 'keydown') ? true : false;
        if (e.keyCode === 38) { // up key
            Game.up = status;
        } else if (e.keyCode === 37) { // left key
            Game.left = status;
        } else if (e.keyCode === 39) { // right key
            Game.right = status;
        }
    }

    // set bird rules 
    static birdRules() {
        //* controller keys
        // up key
        if (Game.up && Game.jump == false) {
            bird.dy -= 30;
            Game.jump = true;
        }
        // left key
        if (Game.left) {
            bird.dx -= 0.5;
        }
        // right key
        if (Game.right) {
            bird.dx += 0.5;
        }

        // gravity
        bird.dy += 1.5;
        // move bird
        bird.x += bird.dx;
        bird.y += bird.dy;
        // elasticity
        bird.dx *= 0.9;
        bird.dy *= 0.9;

        //! detect walls
        // bottom
        if (bird.y > Game.height - ground.h - bird.h) {
            Game.jump = false;
            bird.y = Game.height - ground.h - bird.h;
            bird.dy = 0;
        }
        // left
        if (bird.x < 0) {
            bird.x = 0;
            bird.dx = 0;
        } else if (bird.x > Game.width - bird.w) { // right
            bird.x = Game.width - bird.w;
            bird.dx = 0;
        }
    }

    // control bird via touch
    static touchControl(e) {
        // stop default behavior
        // e.preventDefault();
        e = e || window.event;
        // get accurate x,y values
        let a = Game.canvas.getBoundingClientRect();
        const x = e.touches[0].pageX - a.left;
        const y = e.touches[0].pageY - a.top;
        //! detect event type
        let status = (e.type == 'touchstart') ? true : false;

        //? EVENTS
        if (status) { //* touchstart
            Game.startX = x;
            Game.startY = y;
        } else { //* touchmove
            //? get walk 
            Game.walkX = x - Game.startX;
            Game.walkY = y - Game.startY;

            // swipe left
            if (Game.walkX < 0 && Game.jump == false) {
                bird.dy -= 30;
                bird.dx -= 10;
                Game.jump = true;
            }
            // swipe right
            if (Game.walkX > 0 && Game.jump == false) {
                bird.dy -= 30;
                bird.dx += 10;
                Game.jump = true;
            }

            // gravity
            bird.dy += 0.5;
            // move bird
            bird.x += bird.dx;
            bird.y += bird.dy;
            // elasticity
            bird.dx *= 0.9;
            bird.dy *= 0.9;

            //! detect walls
            // bottom
            if (bird.y > Game.height - ground.h - bird.h) {
                Game.jump = false;
                bird.y = Game.height - ground.h - bird.h;
                bird.dy = 0;
            }
            // left
            if (bird.x < 0) {
                bird.x = 0;
                bird.dx = 0;
            } else if (bird.x > Game.width - bird.w) { // right
                bird.x = Game.width - bird.w;
                bird.dx = 0;
            }

        }

    }

    // start score
    static runScore() {
        //* increament score
        Game.score += 1;
        // append to container
        document.getElementById('score').textContent = `Score: ${Game.score}`;
    }

    // detector
    collision(other) {
        if (this.y > other.y + other.h) { // top > bottom
            return false;
        } else if (this.x + this.w < other.x) { // right < left
            return false;
        } else if (this.y + this.h < other.y) { // bottom < top
            return false;
        } else if (this.x > other.x + other.w) { // left > right
            return false;
        } else { // collision
            return true;
        }
    }

    // handle pigs walk
    static newPos() {
        //! sync pigs with speed
        pigS1_1.dx = Game.speed;
        pigS1_2.dx = Game.speed;
        pigL1_1.dx = Game.speed;
        pigS3_1.dx = Game.speed;
        pigS3_2.dx = Game.speed;
        pigL3_1.dx = Game.speed;
        pigS1_3.dx = Game.speed;
        pigL2_1.dx = Game.speed;
        pigS3_3.dx = Game.speed;
        pigS3_4.dx = Game.speed;
        pigL4_1.dx = Game.speed;
        pigS1_4.dx = Game.speed;
        pigS3_5.dx = Game.speed;
        pigL4_2.dx = Game.speed;
        pigS1_5.dx = Game.speed;
        pigS1_6.dx = Game.speed;
        pigL2_2.dx = Game.speed;
        pigS3_6.dx = Game.speed;
        pigS1_7.dx = Game.speed;
        pigS1_8.dx = Game.speed;
        pigL1_2.dx = Game.speed;
        pigS3_7.dx = Game.speed;
        pigS3_8.dx = Game.speed;
        pigL3_2.dx = Game.speed;
        king1.dx = Game.speed;
        king2.dx = Game.speed;

        //* pigs walk
        pigS1_1.x -= pigS1_1.dx;
        pigS1_2.x -= pigS1_2.dx;
        pigL1_1.x -= pigL1_1.dx;
        pigS3_1.x -= pigS3_1.dx;
        pigS3_2.x -= pigS3_2.dx;
        pigL3_1.x -= pigL3_1.dx;
        pigS1_3.x -= pigS1_3.dx;
        pigL2_1.x -= pigL2_1.dx;
        pigS3_3.x -= pigS3_3.dx;
        pigS3_4.x -= pigS3_4.dx;
        pigL4_1.x -= pigL4_1.dx;
        pigS1_4.x -= pigS1_4.dx;
        pigS3_5.x -= pigS3_5.dx;
        pigL4_2.x -= pigL4_2.dx;
        pigS1_5.x -= pigS1_5.dx;
        pigS1_6.x -= pigS1_6.dx;
        pigL2_2.x -= pigL2_2.dx;
        pigS3_6.x -= pigS3_6.dx;
        pigS1_7.x -= pigS1_7.dx;
        pigS1_8.x -= pigS1_8.dx;
        pigL1_2.x -= pigL1_2.dx;
        pigS3_7.x -= pigS3_7.dx;
        pigS3_8.x -= pigS3_8.dx;
        pigL3_2.x -= pigL3_2.dx;
        king1.x -= king1.dx;
        king2.x -= king2.dx;

        //! repeat pigs
        if (king2.x + king2.w < 0) {
            // reset skip king sound
            Game.skippedKing = true;
            //? speed up next level
            if (Game.speed < 10) {
                Game.speed += 2;
            } else {
                Game.speed = 10;
            }
            // reset pigs position
            pigS1_1.x = Game.width + 100;
            pigS1_2.x = Game.width + 400;
            pigL1_1.x = Game.width + 700;
            pigS3_1.x = Game.width + 1000;
            pigS3_2.x = Game.width + 1300;
            pigL3_1.x = Game.width + 1600;
            pigS1_3.x = Game.width + 1900;
            pigL2_1.x = Game.width + 2200;
            pigS3_3.x = Game.width + 2500;
            pigS3_4.x = Game.width + 2800;
            pigL4_1.x = Game.width + 3100;
            pigS1_4.x = Game.width + 3400;
            pigS3_5.x = Game.width + 3700;
            pigL4_2.x = Game.width + 4000;
            pigS1_5.x = Game.width + 4300;
            pigS1_6.x = Game.width + 4600;
            pigL2_2.x = Game.width + 4900;
            pigS3_6.x = Game.width + 5200;
            pigS1_7.x = Game.width + 5500;
            pigS1_8.x = Game.width + 5800;
            pigL1_2.x = Game.width + 6100;
            pigS3_7.x = Game.width + 6400;
            pigS3_8.x = Game.width + 6700;
            pigL3_2.x = Game.width + 7000;
            king1.x = Game.width + 7700;
            king2.x = Game.width + 8400;
        }

        //* play yahooooooooo sound if skipped the King
        if (bird.x - (king2.x + king2.w) >= 10 && Game.skippedKing) {
            skipKingSound.play();
            // die
            Game.skippedKing = false;
        }

    }

    // handle golden eggs
    static mvGold() {
        let width = Game.width - gold.w - 10;
        const sector = width / 10;

        //! reset array
        Game.goldSectorsArr = [5];

        //* loop to get the 10 sectors
        let startX = 0;
        for (let i = 0; i < 10; i += 1) {
            startX += sector;
            Game.goldSectorsArr.push(startX);
        }

        //* show gold in a random place
        setTimeout(() => {
            gold.x = Game.goldSectorsArr[Math.floor(Math.random() * Game.goldSectorsArr.length)];
        }, 10000);

    }

    // runGame 
    static runGame() {
        //! clear canvas
        Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);

        // run rules
        Game.birdRules();

        //* build world
        ground.makeWorld(); // ground
        bg.makeWorld(); // bg
        // gold
        gold.makeWorld();
        // pigs
        pigS1_1.makeWorld();
        pigS1_2.makeWorld();
        pigL1_1.makeWorld();
        pigS3_1.makeWorld();
        pigS3_2.makeWorld();
        pigL3_1.makeWorld();
        pigS1_3.makeWorld();
        pigL2_1.makeWorld();
        pigS3_3.makeWorld();
        pigS3_4.makeWorld();
        pigL4_1.makeWorld();
        pigS1_4.makeWorld();
        pigS3_5.makeWorld();
        pigL4_2.makeWorld();
        pigS1_5.makeWorld();
        pigS1_6.makeWorld();
        pigL2_2.makeWorld();
        pigS3_6.makeWorld();
        pigS1_7.makeWorld();
        pigS1_8.makeWorld();
        pigL1_2.makeWorld();
        pigS3_7.makeWorld();
        pigS3_8.makeWorld();
        pigL3_2.makeWorld();
        king1.makeWorld();
        king2.makeWorld();
        // bird
        bird.makeWorld();

        //! detect collision of gold
        if (bird.collision(gold)) {
            //! hide gold
            gold.x = -50;
            // run gold sound
            goldSound.play();
            //* count gold
            Game.goldNum += 1;
            // append to container
            document.getElementById('goldNum').textContent = `Golden Eggs: ${Game.goldNum}`;
            // move gold
            Game.mvGold();
        }

        //! detect collision of pigs
        if (bird.collision(pigS1_1) ||
            bird.collision(pigS1_2) ||
            bird.collision(pigL1_1) ||
            bird.collision(pigS3_1) ||
            bird.collision(pigS3_2) ||
            bird.collision(pigL3_1) ||
            bird.collision(pigS1_3) ||
            bird.collision(pigL2_1) ||
            bird.collision(pigS3_3) ||
            bird.collision(pigS3_4) ||
            bird.collision(pigL4_1) ||
            bird.collision(pigS1_4) ||
            bird.collision(pigS3_5) ||
            bird.collision(pigL4_2) ||
            bird.collision(pigS1_5) ||
            bird.collision(pigS1_6) ||
            bird.collision(pigL2_2) ||
            bird.collision(pigS3_6) ||
            bird.collision(pigS1_7) ||
            bird.collision(pigS1_8) ||
            bird.collision(pigL1_2) ||
            bird.collision(pigS3_7) ||
            bird.collision(pigS3_8) ||
            bird.collision(pigL3_2) ||
            bird.collision(king1) ||
            bird.collision(king2)) {
            //! freeze bird
            bird.dx = 0;
            bird.dy = 0;
            // run crash sound
            crashSound.play();
            //! stop score counter
            clearInterval(Game.interval);
            // track highest score
            Game.getHighestScore();
            //* show game over
            document.getElementById('gameOver').style.display = 'block';
            //! hide pause btn
            document.getElementById('pauseCon').style.display = 'none';
            // die
            Game.auto = false;
        }

        // pigs walk
        Game.newPos();

        // update 
        if (Game.auto) window.requestAnimationFrame(Game.runGame);
    }

    // start game
    static startGame() {
        //! hide intro
        document.getElementById('gameIntro').style.display = 'none';
        //* show game container
        document.getElementById('gameContainer').style.display = 'block';
        // run game
        Game.runGame();
        // init score
        Game.interval = setInterval(Game.runScore, 10);
    }

    // restart game
    static restartGame() {
        //! reset gold
        Game.goldNum = 0;
        // append to container
        document.getElementById('goldNum').textContent = `Golden Eggs: ${Game.goldNum}`;
        Game.goldSectorsArr = [5];
        //! reset score
        Game.score = 0;
        //! reset speed
        Game.speed = 2;
        //! reset bird position
        bird.x = 50;
        bird.y = 0;
        //! reset pigs position
        pigS1_1.x = Game.width + 100;
        pigS1_2.x = Game.width + 400;
        pigL1_1.x = Game.width + 700;
        pigS3_1.x = Game.width + 1000;
        pigS3_2.x = Game.width + 1300;
        pigL3_1.x = Game.width + 1600;
        pigS1_3.x = Game.width + 1900;
        pigL2_1.x = Game.width + 2200;
        pigS3_3.x = Game.width + 2500;
        pigS3_4.x = Game.width + 2800;
        pigL4_1.x = Game.width + 3100;
        pigS1_4.x = Game.width + 3400;
        pigS3_5.x = Game.width + 3700;
        pigL4_2.x = Game.width + 4000;
        pigS1_5.x = Game.width + 4300;
        pigS1_6.x = Game.width + 4600;
        pigL2_2.x = Game.width + 4900;
        pigS3_6.x = Game.width + 5200;
        pigS1_7.x = Game.width + 5500;
        pigS1_8.x = Game.width + 5800;
        pigL1_2.x = Game.width + 6100;
        pigS3_7.x = Game.width + 6400;
        pigS3_8.x = Game.width + 6700;
        pigL3_2.x = Game.width + 7000;
        king1.x = Game.width + 7700;
        king2.x = Game.width + 8400;

        // init
        Game.auto = true;
        Game.runGame();
        Game.interval = setInterval(Game.runScore, 10); // init score

        //! hide game over
        document.getElementById('gameOver').style.display = 'none';
        //* show pause btn
        document.getElementById('pauseCon').style.display = 'block';
    }

    // pause game
    static pauseGame(e) {
        if (e.target.classList.contains('pauseBtn')) {
            //! hide pause
            document.getElementById('pause').style.display = 'none';
            //* show resume
            document.getElementById('resume').style.display = 'block';
            // stop score counter
            clearInterval(Game.interval);
            // pause game
            Game.auto = false;

        }
        if (e.target.classList.contains('resumeBtn')) {
            //! hide resume
            document.getElementById('resume').style.display = 'none';
            //* show pause
            document.getElementById('pause').style.display = 'block';
            // init score
            Game.interval = setInterval(Game.runScore, 10);
            // resume
            Game.auto = true;
            // run game
            Game.runGame();
        }
    }

    static init() {
        // run fn
        Game.global();
        // set canvas styling 
        Game.canvas.width = Game.width;
        Game.canvas.height = Game.height;
    }

}
// run fn
Game.init();

// new instance
// sound
const goldSound = new Audio('/angry-birds/media/gold.mp3');
const skipKingSound = new Audio('/angry-birds/media/skip-king.mp3');
const crashSound = new Audio('/angry-birds/media/game-over.mp3');
// ground
const ground = new Game(0, Game.height - Game.ground_h, 720, Game.ground_h, 0, 0, 'ground');
// bg
const bg = new Game(0, 0, 720, 350, 0, 0, 'bg');
// gold
const gold = new Game(Game.width / 2 - 9.5, Game.height - Game.ground_h - 25 - 100, 19, 25, 0, 0, 'gold');
// bird
const bird = new Game(50, 0, 26, 25, 0, 0, 'bird');
// pigs
const pigS1_1 = new Game(Game.width + 100, Game.height - Game.ground_h - 25, 26, 25, 0, 0, 'pig1');
const pigS1_2 = new Game(Game.width + 400, Game.height - Game.ground_h - 25, 26, 25, 0, 0, 'pig1');
const pigL1_1 = new Game(Game.width + 700, Game.height - Game.ground_h - 50, 51, 50, 0, 0, 'pig1');
const pigS3_1 = new Game(Game.width + 1000, Game.height - Game.ground_h - 25, 30, 25, 0, 0, 'pig3');
const pigS3_2 = new Game(Game.width + 1300, Game.height - Game.ground_h - 25, 30, 25, 0, 0, 'pig3');
const pigL3_1 = new Game(Game.width + 1600, Game.height - Game.ground_h - 50, 60, 50, 0, 0, 'pig3');
const pigS1_3 = new Game(Game.width + 1900, Game.height - Game.ground_h - 25, 26, 25, 0, 0, 'pig1');
const pigL2_1 = new Game(Game.width + 2200, Game.height - Game.ground_h - 50, 52, 50, 0, 0, 'pig2');
const pigS3_3 = new Game(Game.width + 2500, Game.height - Game.ground_h - 25, 30, 25, 0, 0, 'pig3');
const pigS3_4 = new Game(Game.width + 2800, Game.height - Game.ground_h - 25, 30, 25, 0, 0, 'pig3');
const pigL4_1 = new Game(Game.width + 3100, Game.height - Game.ground_h - 50, 59, 50, 0, 0, 'pig4');
const pigS1_4 = new Game(Game.width + 3400, Game.height - Game.ground_h - 25, 26, 25, 0, 0, 'pig1');
const pigS3_5 = new Game(Game.width + 3700, Game.height - Game.ground_h - 25, 30, 25, 0, 0, 'pig3');
const pigL4_2 = new Game(Game.width + 4000, Game.height - Game.ground_h - 50, 59, 50, 0, 0, 'pig4');
const pigS1_5 = new Game(Game.width + 4300, Game.height - Game.ground_h - 25, 26, 25, 0, 0, 'pig1');
const pigS1_6 = new Game(Game.width + 4600, Game.height - Game.ground_h - 25, 26, 25, 0, 0, 'pig1');
const pigL2_2 = new Game(Game.width + 4900, Game.height - Game.ground_h - 50, 52, 50, 0, 0, 'pig2');
const pigS3_6 = new Game(Game.width + 5200, Game.height - Game.ground_h - 25, 30, 25, 0, 0, 'pig3');
const pigS1_7 = new Game(Game.width + 5500, Game.height - Game.ground_h - 25, 26, 25, 0, 0, 'pig1');
const pigS1_8 = new Game(Game.width + 5800, Game.height - Game.ground_h - 25, 26, 25, 0, 0, 'pig1');
const pigL1_2 = new Game(Game.width + 6100, Game.height - Game.ground_h - 50, 51, 50, 0, 0, 'pig1');
const pigS3_7 = new Game(Game.width + 6400, Game.height - Game.ground_h - 25, 30, 25, 0, 0, 'pig3');
const pigS3_8 = new Game(Game.width + 6700, Game.height - Game.ground_h - 25, 30, 25, 0, 0, 'pig3');
const pigL3_2 = new Game(Game.width + 7000, Game.height - Game.ground_h - 50, 60, 50, 0, 0, 'pig3');
const king1 = new Game(Game.width + 7700, Game.height - Game.ground_h - 60, 70, 60, 0, 0, 'king1');
const king2 = new Game(Game.width + 8400, Game.height - Game.ground_h - 78, 70, 78, 0, 0, 'king2');

//! EVENTS
// control btn
Game.startBtn.addEventListener('click', Game.startGame, true);
Game.restartBtn.addEventListener('click', Game.restartGame, true);
Game.pauseCon.addEventListener('click', Game.pauseGame, true);
// control keys
window.addEventListener('keydown', Game.contoller, true);
window.addEventListener('keyup', Game.contoller, true);
// control via touch
Game.canvas.addEventListener('touchstart', Game.touchControl, {
    passive: true
});
Game.canvas.addEventListener('touchmove', Game.touchControl, {
    passive: true
});
// responsiveness
window.addEventListener('resize', Game.responsiveness, true);
window.addEventListener('DOMContentLoaded', Game.responsiveness, true);