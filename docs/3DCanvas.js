
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
    var shoot_state = {
        val: 1,
        health: 100,
        bullet: {
            isShooting: false,
            BulletHole: {
                x: -20,
                y: -20
            }
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





    // some copy-pasta from mdn that initiates pointer lock
    scene.requestPointerLock = scene.requestPointerLock ||
        scene.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;
    scene.onclick = function () {
        scene.requestPointerLock();
        shoot(2);
        gunSound();
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
        //resetMidcanvas();
    }

    // A bunch of functions that update variables or perform  actions on tick
    function updatePosition(e) {
        mousePosition.x = e.movementX;
        mousePosition.y = e.movementY;
    }
    function resetMouseMove() {
        mousePosition.x = 0;
        mousePosition.y = 0;
    }
    function resetMidcanvas() {
        midcanvas.x = x
        midcanvas.y = y
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

    // most of the objects being drawn are called from here
    function draw(midcanvasX, midcanvasY) {

        // Accepts coordinates as parameters and draws a line with them..... prevents tautology
        function perspecLine(x1, y1, x2, y2) {
            var lineA = new createjs.Shape();
            lineA.graphics.setStrokeStyle(1.5).beginStroke("#000000");
            lineA.graphics.moveTo(x1, y1);
            lineA.graphics.lineTo(x2, y2);
            lineA.graphics.endStroke();
            stage.addChild(lineA);
        }

        // Back 'o the room
        function endpoint(midcanvasX, midcanvasY) {
            perspecLine(midcanvasX - 250, midcanvasY - 125, midcanvasX + 250, midcanvasY - 125); // Top
            perspecLine(midcanvasX - 250, midcanvasY + 125, midcanvasX + 250, midcanvasY + 125); // bottom
            perspecLine(midcanvasX - 250, midcanvasY - 125, midcanvasX - 250, midcanvasY + 125); // Left
            perspecLine(midcanvasX + 250, midcanvasY - 125, midcanvasX + 250, midcanvasY + 125); // right
        }

        // Draws the window / picture frame at the end of the room.... only god knows what'll happen if I change any one of these
        function leftpictureFrame(midcanvasX, midcanvasY) {
            perspecLine((70 / 100) * (midcanvasX - 300), midcanvasY - 130, (70 / 100) * (midcanvasX - 300), midcanvasY + 50); // left
            perspecLine(midcanvasX - 300, midcanvasY - 100, midcanvasX - 300, midcanvasY + 30); // right
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
                var persistent_hand = new createjs.Bitmap("Assets/Guns/Handgun/" + shoot_state.val + ".png");
                persistent_hand.x = 5
                persistent_hand.y = -30
                stage.addChild(persistent_hand);
            } else {
                //console.log("shoot state off");
            }
        }

        // Draws the four corners of the room
        function cornerwalls() {
            perspecLine(0, 0 - 70, midcanvasX - 250, midcanvasY - 125);
            perspecLine(scene.width, 0 - 70, midcanvasX + 250, midcanvasY - 125);
            perspecLine(0, scene.height + 100, midcanvasX - 250, midcanvasY + 125);
            perspecLine(scene.width, scene.height + 100, midcanvasX + 250, midcanvasY + 125);
        }

        // Health level indicator...yes, I know the variable names are weird
        function HealthbarFill() {
            if (shoot_state.health >= 0) {
                let healthLiquid = RangeConvert(shoot_state.health, 0, 100, 2, 211);
                let healthfillLiq = new createjs.Shape();
                healthfillLiq.graphics.beginFill("#6d6d6d").drawRect(0, 0, healthLiquid, 10);
                healthfillLiq.x = 75;
                healthfillLiq.y = 456;

                var life = new createjs.Text(shoot_state.health, "20px Roboto", "#000000");
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
            var text = new createjs.Text("FPS: " + l, "20px Roboto", "#000000");
            text.y = 4;
            text.x = 4;
            text.alpha = 0.6
            stage.addChild(text)
        }

        // idk what to do with this yet
        function Bullet() {
            var bullet = new createjs.Shape();
            bullet.graphics.beginFill("#83837f").drawCircle(0, 0, 5);
            bullet.x = 505;
            bullet.y = 350;
            stage.addChild(bullet)
        }

        function bulletHole() {
            mcanvastobulletx = RangeConvert(shoot_state.bullet.BulletHole.x, -1500, 2500, 2000, -2000);
            mcanvastobullety = RangeConvert(shoot_state.bullet.BulletHole.y, -1000, 1000, 1200, -800)
            //document.getElementById("rrr").innerText = midcanvas.x + ", " + shoot_state.bullet.BulletHole.x
            bulletHolex = (mcanvastobulletx + midcanvasX) - 3
            bulletHoley = (mcanvastobullety + midcanvasY) + 13
            var BulletHole = new createjs.Bitmap("Assets/Guns/BulletHole/def_Bullet_Hole.png");
            BulletHole.x = bulletHolex
            BulletHole.y = bulletHoley
            BulletHole.scaleX = BulletHole.scaleY = 0.15
            stage.addChild(BulletHole);
        }

        function drawLHG() {
            let healthLiquid = RangeConvert(shoot_state.health, 0, 100, 2, 211);
            lH = new createjs.Shape();
            lH.graphics.beginFill("#ff3333").drawRect(0, 0, healthLiquid + shoot_state.bullet.LHval, 10);
            lH.x = 75;
            lH.y = 456;
            lH.alpha = 0.5;
            stage.addChild(lH)
        }

        // calls all the functions above in one fell swoop.... Theres probably a better ways to do this tho
        document.getElementById("sss").innerText = "( " + Math.round(midcanvasX) + ", " + Math.round(midcanvasY) + " )";
        //Bullet();
        cornerwalls();
        endpoint(midcanvasX, midcanvasY);
        leftpictureFrame(midcanvasX, midcanvasY);
        bulletHole();
        persistent_hand_gun();
        moving_hand_gun();
        crosshairUpdate();
        Healthbar();
        drawLHG()
        HealthbarFill();
        Pfp();
        Fps();
        stage.update()
    }

    // onclick shoot
    function shoot(k) {
        shootA(k)
        function shootA(frame) {
            if (shoot_state.health >= 0) {
                if (frame <= 5) {
                    shoot_state.val = frame;
                    shoot_state.bullet.isShooting = true
                    //stage.removeChildAt(16);
                    setTimeout(() => {
                        shoot(frame += 1)
                    }, 40);
                } else {
                    updateBulletBulletHole()
                    setTimeout(() => { Recoil(12) }, 20)

                    shoot_state.val = 1;
                    shoot_state.bullet.isShooting = false
                    //shoot_state.health -= 2
                }
            }
        }
        return () => {
            gunSound()
        }
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
            createjs.Sound.play(soundID);
        }
    }

    //restores health to maximum
    function hick() {
        shoot_state.health = 100
    }

    // opens the settings menu
    function settings() {
        let stage1 = new createjs.Stage("scene");
        createjs.Ticker.removeEventListener("tick", handleTick);
        //
        var bullet = new createjs.Shape();
        bullet.graphics.beginFill("#83837f").drawCircle(0, 0, 5);
        bullet.x = 505;
        bullet.y = 350;
        stage1.addChild(bullet)
        stage1.update();
    }


    // call functions out of this....WOOOOOOORRRLD
    init.hick = hick
    init.shoot = shoot
}
































/*


var canvas = document.getElementById("scene")
canvas.requestPointerLock = canvas.requestPointerLock ||
    canvas.mozRequestPointerLock;

canvas.requestPointerLock()

if (document.pointerLockElement === canvas ||
    document.mozPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked');
} else {
    console.log('The pointer lock status is now unlocked');
}

function ini() {
    var stage = new createjs.Stage("scene");
    createjs.Ticker.framerate = 40;
    createjs.Ticker.addEventListener("tick", () => {

    })

    let scene = document.getElementById("scene")
    let defcanvasX = scene.width / 2
    let defcanvasY = scene.height / 2
    let gun_frames_array = []
    let shoot_state = false

    function perspecLine(x1, y1, x2, y2) {
        var lineA = new createjs.Shape();
        stage.addChild(lineA);
        lineA.graphics.setStrokeStyle(1.5).beginStroke("#000000");
        lineA.graphics.moveTo(x1, y1);
        lineA.graphics.lineTo(x2, y2);
        lineA.graphics.endStroke();
    }

    function mouseCoord(scene, event) {
        var rect = scene.getBoundingClientRect()
        var x = 1000 - (event.clientX - rect.left);
        var y = 500 - (event.clientY - rect.top);
        var newX = Math.round(RangeConvert(x, 300, 1000, -1000, 1000));
        var newY = Math.round(RangeConvert(y, 150, 500, 0, 500));
        drawLines(newX, newY);
        stage.update();
    }

    function drawLines(midcanvasX = defcanvasX, midcanvasY = defcanvasY) {
        stage.removeAllChildren();
        perspecLine(0, 0 - 70, midcanvasX - 250, midcanvasY - 125);
        perspecLine(scene.width, 0 - 70, midcanvasX + 250, midcanvasY - 125);
        perspecLine(0, scene.height + 100, midcanvasX - 250, midcanvasY + 125);
        perspecLine(scene.width, scene.height + 100, midcanvasX + 250, midcanvasY + 125);

        pageUpdate(midcanvasX, midcanvasY)
        //stage.removeChildAt(14) // persistent handgun
        stage.update();
    }

    function RangeConvert(oldInput, oldMin, oldMax, newMin, newMax) {
        let s1 = oldInput - oldMin;
        let s2 = newMax - newMin;
        let s3 = oldMax - oldMin;
        let d1 = (s1 * s2) / s3;
        return d1 + newMin;
    }


    function pageUpdate(midcanvasX, midcanvasY) {
        function endpoint(midcanvasX, midcanvasY) {
            perspecLine(midcanvasX - 250, midcanvasY - 125, midcanvasX + 250, midcanvasY - 125); // Top
            perspecLine(midcanvasX - 250, midcanvasY + 125, midcanvasX + 250, midcanvasY + 125); // bottom
            perspecLine(midcanvasX - 250, midcanvasY - 125, midcanvasX - 250, midcanvasY + 125); // Left
            perspecLine(midcanvasX + 250, midcanvasY - 125, midcanvasX + 250, midcanvasY + 125); // right
        }

        function leftpictureFrame(midcanvasX, midcanvasY) {
            perspecLine((70 / 100) * (midcanvasX - 300), midcanvasY - 130, (70 / 100) * (midcanvasX - 300), midcanvasY + 50); // left
            perspecLine(midcanvasX - 300, midcanvasY - 100, midcanvasX - 300, midcanvasY + 30); // right
            perspecLine((70 / 100) * (midcanvasX - 300), midcanvasY - 130, midcanvasX - 300, midcanvasY - 100); // top
            perspecLine((70 / 100) * (midcanvasX - 300), midcanvasY + 50, midcanvasX - 300, midcanvasY + 30);  // bottom
            stage.update();
        }

        function crosshairUpdate() {
            var bitmap = new createjs.Bitmap("Assets/Crosshairs/default-crosshair-png-1.png");
            bitmap.x = 500 - 50
            bitmap.y = 125 + 50
            stage.addChild(bitmap)
        }

        function Healthbar() {
            var bitmap = new createjs.Bitmap("Assets/Healthbar/Healthbar-outer-template-v2.png");
            bitmap.x = -15
            bitmap.y = 380
            bitmap.scaleX = 1.3;
            bitmap.scaleY = 1.3;
            stage.addChild(bitmap)
        }

        function persistent_hand_gun() {
            if (shoot_state === false) {
                var persistent_hand = new createjs.Bitmap("Assets/Guns/Handgun/1.png");
                persistent_hand.x = 5
                persistent_hand.y = -30
                stage.addChild(persistent_hand);
            } else {
                console.log("shoot state not set");
            }
        }
        endpoint(midcanvasX, midcanvasY);
        leftpictureFrame(midcanvasX, midcanvasY);
        //cubeDraw(midcanvasX, midcanvasY, 600, 300, 200, 70)
        crosshairUpdate();
        Healthbar();
        persistent_hand_gun();
    }


    setTimeout(() => { shoot() }, 7000)



    function shootcall(frame) {
        setshootstatetrue();
        var frameLocation = "Assets/Guns/Handgun/" + frame + ".png";
        stage.removeAllChildren()
        var bitmap = new createjs.Bitmap(frameLocation);
        bitmap.x = 5
        bitmap.y = -30
        stage.addChild(bitmap);
        console.log("im actually getting called > " + frame);
        stage.update();
    }

    function shoot() {
        setshootstatetrue();
        var tween = createjs.Tween.get(this).wait(1);
        for (var i = 1; i < 5; i++) {
            let frame = i;
            tween.wait(2000).call(shootcall(frame));
        }
        tween.call(setshootstatefalse, null, this); // Call something when done
    }


    function shoot(frame) {
        if (frame <= 5) {
            //setshootstatetrue();
            var frameLocation = "Assets/Guns/Handgun/" + frame + ".png";

            stage.removeChildAt(16);
            var bitmap = new createjs.Bitmap(frameLocation);
            bitmap.x = 5
            bitmap.y = -30
            stage.addChild(bitmap);
            stage.update();
            console.log(frameLocation);
            setTimeout(() => {
                shoot(frame += 1)
            }, 100);
        } else {
            //setshootstatefalse();
        }
    }
    shoot(1);


    function setshootstatetrue() {
        shoot_state = true;
        console.log("shoot state set true");
    }
    function setshootstatefalse() {
        shoot_state = false;
        console.log("shoot state set false");
    }

    function cubeDraw(midcanvasX, midcanvasY, x, y, width, height) {
        // perspecLine(x, y, length, y);
        // perspecLine(length, y, length, width);
        // perspecLine(length, width, x, width);
        // perspecLine(x, width, x, y);

        //console.log(createjs.Ticker.getTicks())
        //console.log("boo " + width);
        //return cubeDraw(midcanvasX, midcanvasY, 600, 300, width - 1, 70)

        var perspwidth = RangeConvert(midcanvasY, -2, 510, 70, 200)
        perspecLine(x + ((20 / 100) * perspwidth), y - midcanvasY, x - perspwidth, y - midcanvasY);
    }


    drawLines();
    stage.update();
    init.mouseCoord = mouseCoord
    //init.shoot = shoot
}

*/




