
function init() {
    // create scene/stage
    const stage = new createjs.Stage("scene");
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED; //set timing mode to RAF

    // initialize some global variables and objects to be used later
    const scene = document.getElementById("scene");
    var mousePosition = {
        // mouse position updated every tick
        x: 0,
        y: 0
    }
    const x = 500;
    const y = 125;
    let rf_health;
    let rf_startregen
    var shoot_state = {
        val: 1,
        health: 100,
        bullet: {
            isShooting: false,
            BulletHole: {
                x: -20,
                y: -20
            },
            BulletHoleAlpha: 1
        },
        lowHealthGradient: 0.5

    };
    var sensitivity = 250; // movement sensitivity 
    var midcanvas = {
        x: x, // determines centre canvas or where to start draw each frame
        y: y
    }
    createjs.Ticker.framerate = 60;


    function startup() {
        var el = document.getElementById("canvas");
        el.addEventListener("touchstart", handleStart, false);
        el.addEventListener("touchend", handleEnd, false);
        el.addEventListener("touchcancel", handleCancel, false);
        el.addEventListener("touchmove", handleMove, false);
    }


    scene.requestPointerLock = scene.requestPointerLock ||
        scene.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;
    scene.onclick = function () {
        if (document.pointerLockElement === scene) {
            if (!shoot_state.bullet.isShooting) {
                shoot(2);
                gunSound();
            }
        } else {
            scene.requestPointerLock();
        }
    }

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
        if (document.pointerLockElement === scene ||
            document.mozPointerLockElement === scene) {
            //console.log('The pointer is now locked');
            document.addEventListener("mousemove", updatePosition, false);
            createjs.Ticker.addEventListener("tick", handleTick);
        } else {
            //console.log('The pointer has been unlocked');
            document.removeEventListener("mousemove", updatePosition, false);
            //settings()
        }
        //resetMouseMove();
    }

    function updatePosition(e) {
        mousePosition.x = e.movementX;
        mousePosition.y = e.movementY;
    }
    function resetMouseMove() {
        mousePosition.x = 0;
        mousePosition.y = 0;
    }
    function RangeConvert(oldInput, oldMin, oldMax, newMin, newMax) {
        // super helpful function that converts ranges....helps avoid a lot of math
        let s1 = oldInput - oldMin;
        let s2 = newMax - newMin;
        let s3 = oldMax - oldMin;
        let d1 = (s1 * s2) / s3;
        return d1 + newMin;
    }

    // The main tick event listener
    createjs.Ticker.addEventListener("tick", handleTick);
    function handleTick() {
        midcanvas.x -= ((sensitivity / 100) * mousePosition.x);
        midcanvas.y -= ((sensitivity / 100) * mousePosition.y);

        stage.removeAllChildren();
        draw(midcanvas.x, midcanvas.y);
        resetMouseMove();
    }

    function draw(midcanvasX, midcanvasY) {
        var roomWidth = 350; // width from the centerline (div 2)
        var roomHeight = 150; // height from centerline

        // Accepts coordinates as parameters and draws a line with them..... prevents tautology
        function perspecLine(x1, y1, x2, y2) {
            var lineA = new createjs.Shape();
            lineA.graphics.setStrokeStyle(1.5).beginStroke("#000000");
            lineA.graphics.moveTo(x1, y1);
            lineA.graphics.lineTo(x2, y2);
            lineA.graphics.endStroke();
            stage.addChild(lineA);
        }

        function endpoint() {
            perspecLine(midcanvasX - roomWidth, midcanvasY - roomHeight, midcanvasX + roomWidth, midcanvasY - roomHeight); // Top
            perspecLine(midcanvasX - roomWidth, midcanvasY + roomHeight, midcanvasX + roomWidth, midcanvasY + roomHeight); // bottom
            perspecLine(midcanvasX - roomWidth, midcanvasY - roomHeight, midcanvasX - roomWidth, midcanvasY + roomHeight); // Left
            perspecLine(midcanvasX + roomWidth, midcanvasY - roomHeight, midcanvasX + roomWidth, midcanvasY + roomHeight); // right
        }

        // Draws the window / picture frame at the end of the room.... only god knows what'll happen if I change any one of these
        function leftpictureFrame() {
            perspecLine((70 / 100) * (midcanvasX - 300), midcanvasY - 130, (70 / 100) * (midcanvasX - 300), midcanvasY + 50); // left
            perspecLine((100 / 100) * (midcanvasX - 300), midcanvasY - 100, (100 / 100) * (midcanvasX - 300), midcanvasY + 30); // right
            perspecLine((70 / 100) * (midcanvasX - 300), midcanvasY - 130, midcanvasX - 300, midcanvasY - 100); // top
            perspecLine((70 / 100) * (midcanvasX - 300), midcanvasY + 50, midcanvasX - 300, midcanvasY + 30);  // bottom
            stage.update();
        }

        // Adds the crosshair bitmap at the centre of the screen
        function crosshairUpdate() {
            var defCrosshair = new createjs.Bitmap("Assets/Crosshairs/default-crosshair-png-1.png");
            defCrosshair.x = 500 - 50
            defCrosshair.y = 125 + 50
            stage.addChild(defCrosshair)
        }

        // Healthbar outlline.... Fun fact I drew it myself in Ms Paint 3D with nothing but a mouse
        function Healthbar() {
            var defHbar = new createjs.Bitmap("Assets/Healthbar/Healthbar-outer-template-v3.png");
            defHbar.x = -15
            defHbar.y = 380
            defHbar.scaleX = 1.3;
            defHbar.scaleY = 1.3;
            stage.addChild(defHbar)
        }

        // Default hangun frame
        function persistent_hand_gun() {
            if (shoot_state.val === 1) {
                var persistent_hand = new createjs.Bitmap("Assets/Guns/Handgun/1.png");
                persistent_hand.x = 5
                persistent_hand.y = -30
                stage.addChild(persistent_hand);
            } else {
                //console.log("shoot state on");
            }
        }

        // cycles through other frames of the shoot animation
        function moving_hand_gun() {
            if (shoot_state.val >= 2) {
                let persistent_hand = new createjs.Bitmap("Assets/Guns/Handgun/" + shoot_state.val + ".png");
                persistent_hand.x = 5
                persistent_hand.y = -30
                stage.addChild(persistent_hand);
            } else {
                //console.log("shoot state off");
            }
        }

        // Draws the four corners of the room
        function cornerwalls() {
            perspecLine(0, 0 - 70, midcanvasX - roomWidth, midcanvasY - roomHeight);
            perspecLine(scene.width, 0 - 70, midcanvasX + roomWidth, midcanvasY - roomHeight);
            perspecLine(0, scene.height + 100, midcanvasX - roomWidth, midcanvasY + roomHeight);
            perspecLine(scene.width, scene.height + 100, midcanvasX + roomWidth, midcanvasY + roomHeight);
        }

        // Health level indicator...yes, I know the variable names are weird
        function HealthbarFill() {
            if (shoot_state.health >= 0) {
                let healthLiquid = RangeConvert(shoot_state.health, 0, 100, 2, 211);
                let healthfillLiq = new createjs.Shape();
                healthfillLiq.graphics.beginFill("#6d6d6d").drawRect(0, 0, healthLiquid, 10);
                healthfillLiq.x = 75;
                healthfillLiq.y = 456;

                let life = new createjs.Text(shoot_state.health, "20px Roboto", "#000000");
                life.y = 450;
                life.x = 290;
                stage.addChild(healthfillLiq, life)
            }
        }

        // pfp = profile pic
        function Pfp() {
            let newPfp = new createjs.Bitmap("Assets/Healthbar/Pfp/HB_pfp.png");
            newPfp.x = 7.5
            newPfp.y = 405.5
            newPfp.scaleX = 0.21;
            newPfp.scaleY = 0.21;
            stage.addChild(newPfp)
        }

        //displays the frame rate at the top of the screen
        function Fps() {
            let l = Math.round(createjs.Ticker.getMeasuredFPS())
            let text = new createjs.Text("FPS: " + l, "20px Roboto", "#000000");
            text.y = 4;
            text.x = 4;
            text.alpha = 0.6
            stage.addChild(text)
        }

        function bulletHole() {
            mcanvastobulletx = RangeConvert(shoot_state.bullet.BulletHole.x, -1500, 2500, 2000, -2000);
            mcanvastobullety = RangeConvert(shoot_state.bullet.BulletHole.y, -1000, 1000, 1200, -800)
            bulletHolex = (mcanvastobulletx + midcanvasX) - 3
            bulletHoley = (mcanvastobullety + midcanvasY) + 13
            let BulletHole = new createjs.Bitmap("Assets/Guns/BulletHole/def_Bullet_Hole1.png");
            BulletHole.x = bulletHolex
            BulletHole.y = bulletHoley
            BulletHole.alpha = shoot_state.bullet.BulletHoleAlpha
            BulletHole.scaleX = BulletHole.scaleY = 0.2
            stage.addChild(BulletHole);
        }

        function drawLHG() {
            if (shoot_state.health <= 50) {
                let outerLHalpha = RangeConvert(shoot_state.health, 0, 50, 1, 0)
                let outerLH = new createjs.Shape();
                outerLH.graphics.beginRadialGradientFill(["#ffffff", "#ff4747c4"], [0, 1], 100, 100, 400, 100, 100, 700).drawCircle(100, 100, 700);
                outerLH.x = 410
                outerLH.y = 125
                outerLH.alpha = outerLHalpha;
                stage.addChild(outerLH)
            }

        }

        function cubeDraw(x, y, z, length, height, depth, isCube = true) {
            /*
                when this function is called its values are defaulted to a particular location
                Later use RangeConvert to make position absolute
            */
            let xdifference = RangeConvert(z, 0, 1, 0, 350);
            let ydifference = RangeConvert(z, 0, 1, 70, 150)
            let cubeX = (z * midcanvasX) + x - xdifference;
            let cubeY = (z * midcanvasY) + y - ydifference;
            let cubeLength = cubeX + length;
            let cubeHeight = cubeY + height;
            let z2 = RangeConvert(depth, 0, 100, z, 1)

            perspecLine(cubeX, cubeY, cubeLength, cubeY)
            perspecLine(cubeX, cubeY, cubeX, cubeHeight)
            perspecLine(cubeX, cubeHeight, cubeLength, cubeHeight)
            perspecLine(cubeLength, cubeHeight, cubeLength, cubeY)

            if (isCube === true) {
                let xdifference = RangeConvert(z2, 0, 1, 0, 350);
                let ydifference = RangeConvert(z2, 0, 1, 70, 150)
                let cubeX2 = (z2 * midcanvasX) + x - xdifference;
                let cubeY2 = (z2 * midcanvasY) + y - ydifference;
                let cubeLength2 = cubeX2 + length;
                let cubeHeight2 = cubeY2 + height;

                perspecLine(cubeX2, cubeY2, cubeLength2, cubeY2)
                perspecLine(cubeX2, cubeY2, cubeX2, cubeHeight2)
                perspecLine(cubeX2, cubeHeight2, cubeLength2, cubeHeight2)
                perspecLine(cubeLength2, cubeHeight2, cubeLength2, cubeY2)
            }

            return {
                x: cubeX,
                y: cubeY,
                z: z,
                length: cubeLength,
                height: cubeHeight,
                xdifference: xdifference,
                ydifference: ydifference
            }

        }

        document.getElementById("sss").innerText = "( " + Math.round(midcanvasX) + ", " + Math.round(midcanvasY) + " )";
        drawLHG()
        cornerwalls();
        endpoint();
        //leftpictureFrame();
        bulletHole();
        persistent_hand_gun();
        moving_hand_gun();
        crosshairUpdate();
        Healthbar();
        cubeDraw(350, 100, 0.6, 100, 100, 50, false);
        HealthbarFill();
        Pfp();
        Fps();
        stage.update()
    }

    // onclick shoot
    function shoot(k) {
        //shoot_state.bullet.BulletHoleAlpha = 0.7;
        stophealthRegen();
        shootA(k)
        function shootA(frame) {
            if (shoot_state.health >= 0) {
                if (frame <= 5) {
                    shoot_state.val = frame;
                    shoot_state.bullet.isShooting = true;
                    setTimeout(() => {
                        shootA(frame += 1)
                    }, 40);
                } else {
                    setTimeout(() => { Recoil(20) }, 5)
                    shoot_state.val = 1;
                    shoot_state.bullet.isShooting = false
                    shoot_state.health -= 3
                }
            }
        }
        gunSound()
    }

    //updates the bullet hole location on mouse click
    function updateBulletBulletHole() {
        shoot_state.bullet.BulletHole.x = midcanvas.x
        shoot_state.bullet.BulletHole.y = midcanvas.y
    }

    // simulates recoil
    function Recoil(val) {
        midcanvas.y += val
    }

    // sound onshoot animation call
    var soundID = "Thunder";
    createjs.Sound.registerSound("Assets/Guns/Handgun/1911pubg.mp3", soundID)
    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.volume = 0.4;

    function gunSound() {
        if (shoot_state.health >= 0) {
            clearTimeout(rf_startregen);
            rf_startregen = setTimeout(() => {
                replenishHealth()
            }, 3000)
            updateBulletBulletHole()
            createjs.Sound.play(soundID);
        }
    }

    function replenishHealth() {
        if (shoot_state.health <= 99) {
            clearTimeout(rf_health)
            rf_health = setTimeout(() => {
                shoot_state.health += 1
                replenishHealth()
            }, 700)
        }
    }

    function stophealthRegen() {
        clearTimeout(rf_health)
        clearTimeout(rf_startregen)
    }

    // opens the settings menu
    function settings() {
        let stage1 = new createjs.Stage("scene");
        createjs.Ticker.removeEventListener("tick", handleTick);
        //
        var base = new createjs.Shape();
        base.graphics.beginFill("#83837f").drawRect(0, 0, 850, 400);
        base.x = 75;
        base.y = 50;
        base.alpha = 0.5
        stage1.addChild(base)
        stage1.update();
    }
}