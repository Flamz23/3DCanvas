// var canvas = document.getElementById("scene")
// canvas.requestPointerLock = canvas.requestPointerLock ||
//     canvas.mozRequestPointerLock;

// canvas.requestPointerLock()

// if (document.pointerLockElement === canvas ||
//     document.mozPointerLockElement === canvas) {
//     console.log('The pointer lock status is now locked');
// } else {
//     console.log('The pointer lock status is now unlocked');
// }

function init() {
    var stage = new createjs.Stage("scene");
    createjs.Ticker.framerate = 40;

    let scene = document.getElementById("scene")
    let defcanvasX = scene.width / 2
    let defcanvasY = scene.height / 2
    let gun_frames_array = []
    let shoot_state = false

    function perspecLine(x1, y1, x2, y2) {
        var lineA = new createjs.Shape();
        stage.addChild(lineA);
        lineA.graphics.setStrokeStyle(2).beginStroke("#000000");
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
        //console.log(newX + " : " + newY);
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
            var bitmap = new createjs.Bitmap("Assets/Healthbar/Healthbar-outer-template.png");
            bitmap.x = 790
            bitmap.y = 400
            bitmap.scaleX = 0.6;
            bitmap.scaleY = 0.7;
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
            return persistent_hand;
        }


        endpoint(midcanvasX, midcanvasY);
        leftpictureFrame(midcanvasX, midcanvasY);
        //cubeDraw(midcanvasX, midcanvasY, 600, 300, 200, 70)
        crosshairUpdate();
        Healthbar();
        persistent_hand_gun();
    }

    // function shoot(frame) {
    //     let framerate = 12

    //     if (frame <= 5) {
    //         setTimeout(() => {
    //             requestAnimationFrame(shoot);
    //             setshootstatetrue()
    //             var bitmap = new createjs.Bitmap("Assets/Guns/Handgun/3.png");
    //             bitmap.x = 5
    //             bitmap.y = -30
    //             stage.addChild(bitmap);
    //             stage.update();
    //         }, 1000)
    //     } else {
    //         setshootstatefalse();
    //     }
    // }
















    function setshootstatetrue() {
        shoot_state = true
    }
    function setshootstatefalse() {
        shoot_state = false
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
