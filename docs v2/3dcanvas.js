/*
    Mouse movements and control
    Create a new instantiable person
    Build the scene
    Create default draw functions
    Add assets and place them in the scene
*/


function init() {
    const stage = new createjs.Stage("scene");
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

    const scene = document.getElementById("scene")
    var Global = {
        "Location": {
            "midcanvas": {
                "defx": 500,
                "defy": 125,
                "x": 0,
                "y": 0
            },
            "touch": {
                "touchstart": [0, 0],
                "touchend": [0, 0],
                "touchmove": [0, 0]
            },
            "mouse": [0, 0]
        },
        "Assets": {
            "Gun": {
                "def_gun": "Assets/Guns/Handgun/1.png",
                "shoot_frames": "Assets/Guns/Handgun",
                "bullet_hole": "Assets/Guns/BulletHole/def_Bullet_Hole1.png",
                "isShooting": false
            }
        },
        "User": {
            "Health": 100,
            "Sensitvity": 100,
            "setFramerate": 60
        },
        "props": {
            "pointerlock": false,
            "touch_enabled": false,
            "touch_input_sensitivity": 0.008,
            "global_sensitivity": 1
        }
    }








    // Mouse control
    scene.requestPointerLock = scene.requestPointerLock ||
        scene.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;
    scene.onclick = function () {
        if (Global.props.touch_enabled === false) {
            if (document.pointerLockElement === scene) {
                Global.props.pointerlock = true
            }
            else {
                Global.props.pointerlock = false;
                scene.requestPointerLock();
            }
            mainClick();
        }
    }

    // Touch enabled device
    scene.addEventListener("touchstart", (ev) => {
        Global.props.touch_enabled = true
        let pos = Global.Location.touch
        pos.touchstart[0] = ev.touches[0].pageX
        pos.touchstart[1] = ev.touches[0].pageY
        //mainClick();
    }, false);
    scene.addEventListener("touchmove", updatePositionTouch, false);
    scene.addEventListener("touchend", (e) => {
        Global.Location.touch.touchend[0] = e.changedTouches[0].pageX;
        Global.Location.touch.touchend[1] = e.changedTouches[0].pageY;
        mainClick()
    }, false)

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    function lockChangeAlert() {
        if (document.pointerLockElement === scene ||
            document.mozPointerLockElement === scene) {
            //The pointer is now locked
            document.addEventListener("mousemove", updatePositionMouse, false);
            //createjs.Ticker.addEventListener("tick", handleTick);
        } else {
            //The pointer has been unlocked
            document.removeEventListener("mousemove", updatePositionMouse, false);
        }
    }

    function updatePositionTouch(e) {
        //console.log(e.touches[0].pageX, e.touches[0].pageY);
        let evPos = e.touches[0]
        let startPos = Global.Location.touch
        let sens = Global.props.touch_input_sensitivity
        startPos.touchmove[0] = n(sens * (n(evPos.pageX) - n(startPos.touchstart[0])))
        startPos.touchmove[1] = Math.round(sens * (Math.round(evPos.pageY) - Math.round(startPos.touchstart[1])))
        //console.log(startPos.touchmove);
    }

    function updatePositionMouse(e) {
        //console.log(e.movementX, e.movementY);
        Global.Location.mouse[0] = e.movementX;
        Global.Location.mouse[1] = e.movementY;
    }

    function resetMove() {
        Global.Location.touch.touchmove[0] = Global.Location.touch.touchmove[1] = 0
        Global.Location.mouse[0] = Global.Location.mouse[1] = 0
    }









    createjs.Ticker.addEventListener("tick", handleTick);
    function handleTick() {
        console.log(Global.props.touch_enabled);
        let sens = Global.props.global_sensitivity
        let eMov = Global.Location.mouse
        let angleX = RangeConvert(Global.Location.midcanvas.x, -200, 200, 0, 360)
        let angleY = RangeConvert(Global.Location.midcanvas.y, -200, 200, 0, 360)
        if (Global.props.touch_enabled === true) {
            eMov = Global.Location.touch.touchmove
        }

        Global.Location.midcanvas.x += (sens * eMov[0]);
        Global.Location.midcanvas.y -= (sens * eMov[1]);
        stage.removeAllChildren();
        draw(Global.Location.midcanvas.x, Global.Location.midcanvas.y);
        document.getElementById("log1").innerText = angleX + ", " + angleY
        resetMove();
    }

    function RangeConvert(oldInput, oldMin, oldMax, newMin, newMax) {
        let s1 = oldInput - oldMin;
        let s2 = newMax - newMin;
        let s3 = oldMax - oldMin;
        let d1 = (s1 * s2) / s3;
        return d1 + newMin;
    }

    function n(num) {
        return Math.round(num)
    }

    function mainClick() {
        console.log("click");
        //console.log(Global.Location.touch.touchstart);
    }

    function draw(midcanvasX, midcanvasY) {

        function perspecLine(x1, y1, x2, y2, alpha = 1) {
            var lineA = new createjs.Shape();
            lineA.graphics.setStrokeStyle(1.5).beginStroke("#000000");
            lineA.graphics.moveTo(x1, y1);
            lineA.graphics.lineTo(x2, y2);
            lineA.alpha = alpha
            lineA.graphics.endStroke();
            stage.addChild(lineA);
        }


        //p
    }
}