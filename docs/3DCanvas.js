
function init() {

    const stage = new createjs.Stage("scene");
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

    const scene = document.getElementById("scene");
    var mousePosition = {
        x: 0,
        y: 0
    }
    const x = 500;
    const y = 125;
    var shoot_state = {
        val: 1,
        health: 100,
        healthbarAlpha: 1
    };
    var sensitivity = 250;
    var midcanvas = {
        x: x,
        y: y
    }
    createjs.Ticker.framerate = 60;


    scene.requestPointerLock = scene.requestPointerLock ||
        scene.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;
    scene.onclick = function () {
        scene.requestPointerLock();
        shoot(2)
    }

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
        if (document.pointerLockElement === scene ||
            document.mozPointerLockElement === scene) {
            //console.log('The pointer is now locked');
            document.addEventListener("mousemove", updatePosition, false);
        } else {
            //console.log('The pointer has been unlocked');
            document.removeEventListener("mousemove", updatePosition, false);

        }
        //resetMouseMove();
        //resetMidcanvas();
    }

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
        let s1 = oldInput - oldMin;
        let s2 = newMax - newMin;
        let s3 = oldMax - oldMin;
        let d1 = (s1 * s2) / s3;
        return d1 + newMin;
    }


    createjs.Ticker.addEventListener("tick", handleTick);
    function handleTick() {
        midcanvas.x -= ((sensitivity / 100) * mousePosition.x);
        midcanvas.y -= ((sensitivity / 100) * mousePosition.y);

        stage.removeAllChildren();
        draw(midcanvas.x, midcanvas.y);
        resetMouseMove();
        //document.getElementById("framerate").innerText = "FPS: " + Math.round(createjs.Ticker.getMeasuredFPS());
    }

    function draw(midcanvasX, midcanvasY) {

        function perspecLine(x1, y1, x2, y2) {
            var lineA = new createjs.Shape();
            lineA.graphics.setStrokeStyle(1.5).beginStroke("#000000");
            lineA.graphics.moveTo(x1, y1);
            lineA.graphics.lineTo(x2, y2);
            lineA.graphics.endStroke();
            stage.addChild(lineA);
        }

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
            var defCrosshair = new createjs.Bitmap("Assets/Crosshairs/default-crosshair-png-1.png");
            defCrosshair.x = 500 - 50
            defCrosshair.y = 125 + 50
            stage.addChild(defCrosshair)
        }

        function Healthbar() {
            var defHbar = new createjs.Bitmap("Assets/Healthbar/Healthbar-outer-template-v3.png");
            defHbar.x = -15
            defHbar.y = 380
            defHbar.scaleX = 1.3;
            defHbar.scaleY = 1.3;
            stage.addChild(defHbar)
        }

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

        function cornerwalls() {
            perspecLine(0, 0 - 70, midcanvasX - 250, midcanvasY - 125);
            perspecLine(scene.width, 0 - 70, midcanvasX + 250, midcanvasY - 125);
            perspecLine(0, scene.height + 100, midcanvasX - 250, midcanvasY + 125);
            perspecLine(scene.width, scene.height + 100, midcanvasX + 250, midcanvasY + 125);
        }

        function HealthbarFill() {
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

        function Pfp() {
            let newPfp = new createjs.Bitmap("Assets/Healthbar/Pfp/HB_pfp.png");
            newPfp.x = 7.5
            newPfp.y = 405.5
            newPfp.scaleX = 0.21;
            newPfp.scaleY = 0.21;
            stage.addChild(newPfp)
        }

        function Fps() {
            let l = Math.round(createjs.Ticker.getMeasuredFPS())
            var text = new createjs.Text("FPS: " + l, "20px Roboto", "#000000");
            text.y = 4;
            text.x = 4;
            text.alpha = 0.6
            stage.addChild(text)


        }
        //lowHealthGrad();
        cornerwalls();
        endpoint(midcanvasX, midcanvasY);
        leftpictureFrame(midcanvasX, midcanvasY);
        persistent_hand_gun();
        moving_hand_gun();
        crosshairUpdate();
        Healthbar();
        HealthbarFill();
        Pfp();
        Fps();
        stage.update()
    }


    function shoot(frame) {
        if (frame <= 5) {
            shoot_state.val = frame;
            //stage.removeChildAt(16);
            setTimeout(() => {
                shoot(frame += 1)
            }, 45);
        } else {
            shoot_state.val = 1;
            shoot_state.health -= 5
        }
    }

    function lowHealthGrad(alpha) {
        if (alpha <= 1) {
            shoot_state.healthbarAlpha += 1
            lowHealthGrad(shoot_state.health)
        }
        //         let healthfillLiqLow = new createjs.Shape();
        //         healthfillLiqLow.graphics.beginFill("#6d6d6d").drawRect(0, 0, 40, 10);
        //         healthfillLiqLow.x = 75;
        //         healthfillLiqLow.y = 456;
        //         healthfillLiqLow.alpha = alpha
        //         stage.addChild(healthfillLiqLow);
        //         console.log("im running");
        //         setTimeout(() => {
        //             lowHealthGrad(alpha + 0.1)
        //         }, 500);
        // }



    }

    lowHealthGrad(0.5)
    init.shoot = shoot()

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




