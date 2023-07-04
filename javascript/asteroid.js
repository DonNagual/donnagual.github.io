

function openAsteroidsGame() {
    document.getElementById("openGame").onclick = null;
    document.getElementById("spielablauf").style.display = "none";
    document.getElementById("btnBack").style.color = "white";
    document.getElementById("btnFullScreen").style.display = "block";


    const FPS = 30;                     // frames pro Sekunde
    const GAME_LIVES = 3;               // Anzahl der Start Leben
    const SAVE_KEY_SCORE = "highscore"; // Schlüssel um das High Score lokal zu speichern
    const SHIP_SIZE = 30;               // Schiff größe in Pixel
    const SHIP_THRUST = 5;              // Beschleunigung des Schiffs in Pixel pro Sekunde zum Quadrat
    const SHIP_EXPLODE_DUR = 0.3;       // Dauer der Schiffsexplosion in Sekunden
    const SHIP_BLINK_DUR = 0.1;         // Dauer des Schiffsblinzelns während der Unsichtbarkeit in Sekunden
    const SHIP_INV_DUR = 3;             // Dauer der Unsichtbarkeit des Schiffes in Sekunden
    const FRICTION = 0.7;               // Weltraum Reibungskoeffizient (0 = keine Reibung, 1 = sehr viel Reibung)
    const TURN_SPEED  = 360;            // Drehgeschwindigkeit des Schiffs in Grad pro Sekunde
    const LASER_MAX = 10;               // Maximale Anzahl von Lasern gleichzeitig auf dem Bildschirm
    const LASER_SPD = 500;              // Geschwindigkeit von Lasern in Pixel pro Sekunde
    const LASER_DIST = 0.6;             // Die maximale Entfernung, die der Laser zurücklegen kann, beträgt einen Bruchteil der Bildschirmbreite
    const LASER_EXPLODE_DUR = 0.1;      // Dauer der Lasersexplosion in Sekunden
    const ROIDS_NUM = 3;                // Anzahl der bei Start erzeugten Asteroiden
    const ROIDS_SIZE = 100;             // Größe der Start Asteroiden
    const ROIDS_SPD = 100;              // Maximale Startgeschwindigkeit der Asteroiden in Pixel
    const ROIDS_VERT = 10;              // Durchschnittliche Anzahl von Scheitelpunkten auf jedem Asteroiden
    const ROIDS_JAG = 0.4;              // Asteroiden Zacken (0 = keine, 1 = viele)
    const ROIDS_PTS_LGE = 20;           // Punkte für große Asteroiden
    const ROIDS_PTS_MED = 50;           // Punkte für mittlere Asteroiden
    const ROIDS_PTS_SML = 100;          // Punkte für kleine Asteroiden
    const TEXT_FADE_TIME = 2.5;         // Text einfeden über Zeit in Sekunden
    const TEXT_SIZE = 40;               // Text größe
    const SOUND_ON = true;              // Schaltet Sound an oder aus
    const MUSIC_ON = true;              // Schaltet Musik an oder aus
    const SHOW_BOUNDING = false;        // Kollisionsstreifen ein- oder ausblenden
    const SHOW_CENTER_DOT = false;      // Schiffsmittenpunkt ein- oder ausblenden


    /** @type {HTMLCanvasElement} */
    let canv = document.getElementById("gameCanves");
    let ctx = canv.getContext("2d");

    // set up sound effects
    let fxExplode = new Sound("../sounds/explode.mp3");
    let fxHit = new Sound("../sounds/hit.mp3", 5);
    let fxLaser = new Sound("../sounds/laser.mp3", 5, 0.5);
    let fxThrust = new Sound("../sounds/thrust.mp3");

    // set up the music
    let music = new Music("../sound/music-low.mp3", "../sound/music-high.mp3");
    let roidsLeft, roidsTotal;

    // set up the game parameters
    let level, lives, roids, score, scoreHigh, ship, text, textAlpha;
    newGame();

    //  set up event handlers
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    // set up the game loop
    setInterval(update, 1000 / FPS);

    function createAsteroidBelt() {
        roids = [];
        roidsTotal = (ROIDS_NUM + level) * 7;
        roidsLeft = roidsTotal;
        let x, y;
        for (let i = 0; i < ROIDS_NUM + level; i++) {
            do {
                x = Math.floor(Math.random() * canv.width);
                y = Math.floor(Math.random() * canv.height);
            }
            while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
            roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
        }
    }

    function destroyAsteroid(index) {
        let x = roids[index].x;
        let y = roids[index].y;
        let r = roids[index].r;

        // split the asteroid in two if necessary
        if (r ==  Math.ceil(ROIDS_SIZE / 2)) {
            roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 3)));
            roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 3)));
            score += ROIDS_PTS_LGE;
        }
        else if (r == Math.ceil(ROIDS_SIZE / 3)) {
            roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 6)));
            roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 6)));
            score += ROIDS_PTS_MED;
        }
        else  {
            score += ROIDS_PTS_SML;
        }

        // check high score
        if (score > scoreHigh) {
            scoreHigh = score;
            localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
        }

        // destroy the asteroid
        roids.splice(index, 1);
        fxHit.play();

        // calculate the ratio of remaining asteroids to determine music tempo
        roidsLeft--;
        music.setAsteroidRatio(roidsLeft == 0 ? 1 : roidsLeft / roidsTotal);

        // new level when no more asteroids
        if (roids.length == 0) {
            level++;
            newLevel();
        }
    }

    function distBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function drawShip(x, y, a, colour = "white") {
        ctx.strokeStyle = colour;
        ctx.lineWidth = SHIP_SIZE / 20;
        ctx.beginPath();
        ctx.moveTo( // nose of the ship
            x + 4 / 3 * ship.r * Math.cos(a),
            y - 4 / 3 * ship.r * Math.sin(a)
        );
        ctx.lineTo( // rear left
            x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
            y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
        );
        ctx.lineTo( // rear right
            x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
            y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
        );
        ctx.closePath();
        ctx.stroke();
    }

    function explodeShip() {
        ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
        fxExplode.play();
    }

    function gameOver() {
        ship.dead = true;
        text = "Game Over"
        textAlpha = 1.0;
    }

    function keyDown(/** @type {KeyboardEvent.keyCode} */ ev) {

        if (ship.dead) {
            return;
        }

        switch(ev.keyCode) {
            case 32:    // shoot the laser (32 is "Spacebar")
                shootLaser();
                break;
            case 65:    // rotate ship left (65 is "A")
                ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
                break;
            case 87:    // thrust the ship forward (87 is "W")
                ship.thrusting = true;
                break;
            case 68:    // rotate ship right (68 is "D")
                ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
                break;
            case 37:    // rotate ship left (65 is "A")
                ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
                break;
            case 38:    // thrust the ship forward (87 is "W")
                ship.thrusting = true;
                break;
            case 39:    // rotate ship right (68 is "D")
                ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
                break;
        }
    }
    function keyUp(/** @type {KeyboardEvent.keyCode} */ ev) {

        if (ship.dead) {
            return;
        }

        switch(ev.keyCode) {
            case 32:    // alloow shooting the laser (32 is "Spacebar")
                ship.canShoot = true;
                break;
            case 65:    // stop rotateing left (65 is "A")
                ship.rot = 0;
                break;
            case 87:    // stop thrusting (87 is "W")
                ship.thrusting = false;
                break;
            case 68:    // stop rotating right (68 is "D")
                ship.rot = 0;
                break;
            case 37:    // stop rotateing left (65 is "A")
                ship.rot = 0;
                break;
            case 38:    // stop thrusting (87 is "W")
                ship.thrusting = false;
                break;
            case 39:    // stop rotating right (68 is "D")
                ship.rot = 0;
                break;
        }
    }

    function newAsteroid(x, y, r) {
        let lvlMult = 1 + 0.1 * level;
        let roid = {
            x: x,
            y: y,
            xv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
            yv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
            r: r,
            a: Math.random() * Math.PI * 2, // in radians
            vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
            offs: []
        }

        // create the vertex offset array
        for (let i = 0; i < roid.vert; i++) {
            roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
        }

        return roid;
    }

    function newGame() {
        level = 0;
        lives = GAME_LIVES;
        score = 0;
        ship = newShip();

        // get the high score from lacal storage
        let scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
        if (scoreStr == null) {
            scoreHigh = 0;
        }
        else {
            scoreHigh = parseInt(scoreStr);
        }

        newLevel();
    }

    function newLevel() {
        text = "Level " + (level +1);
        textAlpha = 1.0;
        createAsteroidBelt();
    }

    function newShip() {
        return {
            x: canv.width / 2,
            y: canv.height / 2,
            r: SHIP_SIZE / 2,
            a: 90 / 180 * Math.PI,   // Schiffsausrichtung 90° ist nach oben und in Bogenmaß umrechnen
            blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
            blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
            canShoot: true,
            dead: false,
            explodeTime: 0,
            lasers: [],
            rot: 0,
            thrusting: false,
            thrust: {
                x: 0,
                y: 0
            }
        }
    }

    function shootLaser() {
        // create the laser object
        if (ship.canShoot && ship.lasers.length < LASER_MAX) {
            
            ship.lasers.push({  // from the nose of the ship
                x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                xv: LASER_SPD * Math.cos(ship.a) / FPS,
                yv: -LASER_SPD * Math.sin(ship.a) / FPS,
                dist: 0,
                explodeTime: 0
            });
            fxLaser.play();
        }

        // prevent further shooting
        ship.canShoot = false;
    }

    function Music(srcLow, srcHigh) {
        this.soundLow = new Audio(srcLow);
        this.soundHigh = new Audio(srcHigh);
        this.low = true;
        this.tempo = 1.0; // seconds per beat
        this.beatTime = 0; // frames left until next beat

        this.play = function() {
            if (MUSIC_ON) {
                if (this.low) {
                    this.soundLow.play();
                }
                else {
                    this.soundHigh.play();
                }
                this.low = !this.low;
            }
        }

        this.setAsteroidRatio = function(ratio) {
            this.tempo = 1.0 - 0.75 * (1.0 -ratio);
        }

        this.tick = function() {
            if (this.beatTime == 0) {
                this.play();
                this.beatTime = Math.ceil(this.tempo * FPS);
            }
            else {
                this.beatTime--;
            }
        }
    }

    function Sound(src, maxStreams = 1, vol = 1.0) {
        this.streamNum = 0;
        this.streams = [];
        for (let i = 0; i < maxStreams; i++) {
            this.streams.push(new Audio(src));
            this.streams[i].volume = vol;
        }

        this.play = function() {
            if (SOUND_ON) {
                this.streamNum = (this.streamNum + 1) % maxStreams;
                this.streams[this.streamNum].play();
            }
        }

        this.stop = function() {
            this.streams[this.streamNum].pause();
            this.streams[this.streamNum].currentTime = 0;
        }
    }


    function update() {
        let blinkOn = ship.blinkNum % 2 == 0;
        let exploding = ship.explodeTime > 0;

        // tick the music
        music.tick();

        // draw space
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canv.width, canv.height);

        // thrust the ship
        if (ship.thrusting && !ship.dead) {
            ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
            ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
            fxThrust.play();
        
            // draw the thruster
            if (!exploding && blinkOn) {
                ctx.fillStyle = "red";
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = SHIP_SIZE / 10;
                ctx.beginPath();
                ctx.moveTo( // rear left
                    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.4 * Math.sin(ship.a)),
                    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.4 * Math.cos(ship.a))
                );
                ctx.lineTo( // rear center behind the ship
                    ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
                    ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
                );
                ctx.lineTo( // rear right
                    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.4 * Math.sin(ship.a)),
                    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.4 * Math.cos(ship.a))
                );
                ctx.closePath();
                ctx.fill()
                ctx.stroke();
            }
        }
        else {
            ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
            ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
            fxThrust.stop();
        }

        // draw a triangular ship
        if (!exploding) {
            if (blinkOn && !ship.dead) {
                drawShip(ship.x, ship.y, ship.a);
            }

            // handle blinking
            if (ship.blinkNum > 0) {

                // reduce the blink time
                ship.blinkTime--;

                // reduce the blink num
                if (ship.blinkTime == 0) {
                    ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                    ship.blinkNum--;
                }
            }
        }
        else {
            // draw the explosion
            ctx.fillStyle = "darkred";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
        }

        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
            ctx.stroke();
        }

        // draw the asteroids
        let x, y, r, a, vert, offs;
        for (let i = 0; i < roids.length; i++) {
            ctx.strokeStyle = "slategrey";
            ctx.lineWidth = SHIP_SIZE / 20;

            // get the asteroid properties
            x = roids[i].x;
            y = roids[i].y;
            r = roids[i].r;
            a = roids[i].a;
            vert = roids[i].vert;
            offs = roids[i].offs;

            // draw a path
            ctx.beginPath();
            ctx.moveTo(
                x + r * offs[0] * Math.cos(a),
                y + r * offs[0] * Math.sin(a)
            );

            // draw the polygon
            for (let j = 1; j < vert; j++) {
                ctx.lineTo(
                    x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                    y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
                );
            }
            ctx.closePath();
            ctx.stroke();

            if (SHOW_BOUNDING) {
                ctx.strokeStyle = "lime";
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2, false);
                ctx.stroke();
            }
        }


        // center dot
        if (SHOW_CENTER_DOT) {
            ctx.fillStyle = "red";
            ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
        }

        // draw the lasers
        for (let i = 0; i < ship.lasers.length; i++ ) {
            if (ship.lasers[i].explodeTime == 0) {
                ctx.fillStyle = "salmon";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
                ctx.fill();
            }
            else {
                // draw the explosion
                ctx.fillStyle = "orangered";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE * 0.4, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "salmon";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE * 0.25, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "pink";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE * 0.15, 0, Math.PI * 2, false);
                ctx.fill();
            }
        }

        // draw the game text
        if (textAlpha >= 0) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
            ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
            ctx.fillText(text, canv.width / 2, canv.height * 0.75);
            textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
        }
        else if (ship.dead) {
            newGame();
        }

        // draw the lives
        let lifeColour;
        for (let i = 0; i < lives; i++) {
            lifeColour = exploding && i == lives -1 ? "red" : "white";
            drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColour);
        }

        // draw the score
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = TEXT_SIZE + "px dejavu sans mono";
        ctx.fillText(score, canv.width / 2, SHIP_SIZE);

        // draw the higt score
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = (TEXT_SIZE * 0.6) + "px dejavu sans mono";
        ctx.fillText("HIGH: " + scoreHigh, canv.width / 4, SHIP_SIZE);


        // detect laser hits on asteroids
        let ax, ay, ar, lx, ly;
        for (let i = roids.length - 1; i >= 0; i--) {

            // grab the asteroids properties
            ax = roids[i].x;
            ay = roids[i].y;
            ar = roids[i].r;

            // loop over the lasers
            for ( let j = ship.lasers.length - 1; j >= 0; j--) {

                // grab the leser properties
                lx = ship.lasers[j].x;
                ly = ship.lasers[j].y;

                // detect hits
                if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                    // destroy the asteroid and activate the laser explosion
                    destroyAsteroid(i);
                    ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                    break;
                }
            }
        }

        // check for asteroid collisions (when not exploding)
        if (!exploding) {

            // only check when not blinking
            if (ship.blinkNum == 0 && !ship.dead) {
                for (let i = 0; i < roids.length; i++) {
                    if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                        explodeShip();
                        destroyAsteroid(i);
                        break;
                    }
                }
            }

            // rotate the ship
            ship.a += ship.rot;

            // move the ship
            ship.x += ship.thrust.x;
            ship.y += ship.thrust.y;
        }
        else {
            // reduce the explode time
            ship.explodeTime--;

            // reset the ship after the explosion has finished
            if (ship.explodeTime == 0) {
                lives--;
                if (lives == 0) {
                    gameOver();
                }
                else {
                    ship = newShip();
                }
            }
        }

        // handle edge of screen
        if (ship.x < 0 - ship.r) {
            ship.x = canv.width + ship.r;
        }
        else if (ship.x > canv.width + ship.r) {
            ship.x = 0 - ship.r;
        }
        if (ship.y < 0 - ship.r) {
            ship.y = canv.height + ship.r;
        }
        else if (ship.y > canv.height + ship.r) {
            ship.y = 0 - ship.r;
        }

        // move the lasers
        for (let i = ship.lasers.length - 1; i >= 0; i--) {
            // check distance travelled
            if (ship.lasers[i].dist > LASER_DIST * canv.width) {
                ship.lasers.splice(i, 1);
                continue;
            }

            // handle the explosion
            if (ship.lasers[i].explodeTime > 0){
                ship.lasers[i].explodeTime--;

                // destroy the laser after the duration is up
                if (ship.lasers[i].explodeTime == 0) {
                    ship.lasers.splice(i, 1);
                    continue;
                }
            }
            else {
                // move the laser
                ship.lasers[i].x += ship.lasers[i].xv;
                ship.lasers[i].y += ship.lasers[i].yv;

                // calculate the distance travelled
                ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
            }

            // handle edge of screen
            if (ship.lasers[i].x < 0) {
                ship.lasers[i].x = canv.width;
            }
            else if (ship.lasers[i].x > canv.width) {
                ship.lasers[i].x = 0;
            }
            if (ship.lasers[i].y < 0) {
                ship.lasers[i].y = canv.height;
            }
            else if (ship.lasers[i].y > canv.height) {
                ship.lasers[i].y = 0;
            }
        }

        // move the asteroids
        for (let i = 0; i < roids.length; i++) {
            roids[i].x += roids[i].xv;
            roids[i].y += roids[i].yv;

            // handle edge of screen
            if (roids[i].x < 0 - roids[i].r) {
                roids[i].x = canv.width + roids[i].r;
            }
            else if (roids[i].x > canv.width + roids[i].r) {
                roids[i].x = 0 - roids[i].r;
            }

            if (roids[i].y < 0 - roids[i].r) {
                roids[i].y = canv.height + roids[i].r;
            }
            else if (roids[i].y > canv.height + roids[i].r) {
                roids[i].y = 0 - roids[i].r;
            }
        }

        // center dot
        // ctx.fillStyle = "red";
        // ctx.fillRect(ship.x -1, ship.y -1, 2, 2);

    }
}
