/* =========================================================
   VELOCITY MOTION SIMULATION
   MOBILE-FIRST RESPONSIVE JAVASCRIPT
   ========================================================= */
const vc = document.getElementById("velocityCanvas");
const ac = document.getElementById("accCanvas");
const vctx = vc.getContext("2d");
const actx = ac.getContext("2d");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const carContainer = document.getElementById("carContainer");
const carSVG = document.getElementById("carSVG");
const road = document.querySelector(".road");
let t = 0;
let playing = false;
let id = null;
/* Pointer dragging */
let drag = false;
let activePointerId = null;
let wasPlayingBeforeDrag = false;
const T = 18;
/* =========================================================
   RESPONSIVE GRAPH SETTINGS
   ========================================================= */
let graphSettings = {
    left: 45,
    right: 12,
    top: 15,
    bottom: 30,
    font: 12,
    lineWidth: 2,
    pointRadius: 5
};
/* =========================================================
   GET RESPONSIVE GRAPH SETTINGS
   ========================================================= */
function updateGraphSettings() {
    const width = Math.min(
        vc.clientWidth || window.innerWidth,
        ac.clientWidth || window.innerWidth
    );
    if (width <= 374) {
        graphSettings = {
            left: 36,
            right: 8,
            top: 12,
            bottom: 25,
            font: 10,
            lineWidth: 2,
            pointRadius: 4
        };
    } else if (width <= 599) {
        graphSettings = {
            left: 40,
            right: 10,
            top: 14,
            bottom: 27,
            font: 11,
            lineWidth: 2.5,
            pointRadius: 5
        };
    } else if (width <= 899) {
        graphSettings = {
            left: 55,
            right: 15,
            top: 18,
            bottom: 32,
            font: 14,
            lineWidth: 2.5,
            pointRadius: 6
        };
    } else {
        graphSettings = {
            left: 60,
            right: 20,
            top: 20,
            bottom: 40,
            font: 18,
            lineWidth: 3,
            pointRadius: 8
        };
    }
}
/* =========================================================
   HIGH-RESOLUTION RESPONSIVE CANVAS
   ========================================================= */
function resizeCanvas(canvas, context) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(
        1,
        Math.round(rect.width)
    );
    const height = Math.max(
        1,
        Math.round(rect.height)
    );
    const dpr = Math.min(
        window.devicePixelRatio || 1,
        3
    );
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    /*
       Draw using CSS-pixel coordinates.
       This keeps the graphs sharp on
       Retina phones and iPads.
    */
    context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}
/* =========================================================
   RESIZE EVERYTHING
   ========================================================= */
function resize() {
    resizeCanvas(vc, vctx);
    resizeCanvas(ac, actx);
    updateGraphSettings();
    drawAll();
}
window.addEventListener(
    "resize",
    resize
);
/* =========================================================
   RESIZE OBSERVER
   ========================================================= */
if ("ResizeObserver" in window) {
    const resizeObserver =
        new ResizeObserver(() => {
            resize();
        });
    resizeObserver.observe(vc);
    resizeObserver.observe(ac);
    resizeObserver.observe(road);
}
/* =========================================================
   VELOCITY
   ========================================================= */
function vel(t) {
    if (t <= 4) {
        return 5 * t;
    }
    if (t <= 8) {
        return 20;
    }
    if (t <= 12) {
        return 20 - 12.5 * (t - 8);
    }
    if (t <= 18) {
        return -30 + 5 * (t - 12);
    }
    return 0;
}
/* =========================================================
   ACCELERATION
   ========================================================= */
function acc(t) {
    if (t <= 4) {
        return 5;
    }
    if (t <= 8) {
        return 0;
    }
    if (t <= 12) {
        return -12.5;
    }
    if (t <= 18) {
        return 5;
    }
    return 0;
}
/* =========================================================
   POSITION
   ========================================================= */
function pos(t) {
    let x;
    if (t <= 4) {
        x = 2.5 * t * t;
    } else if (t <= 8) {
        x = 40 + 20 * (t - 4);
    } else if (t <= 12) {
        const u = t - 8;
        x =
            120 +
            20 * u -
            6.25 * u * u;
    } else {
        const u = t - 12;
        x =
            100 -
            30 * u +
            2.5 * u * u;
    }
    return x;
}
/* =========================================================
   GRAPH COORDINATES
   ========================================================= */
function graphX(time, canvas) {
    const s = graphSettings;
    const width = canvas.clientWidth;
    const graphWidth =
        width - s.left - s.right;
    return (
        s.left +
        (time / T) * graphWidth
    );
}
function velocityY(value) {
    const s = graphSettings;
    const height = vc.clientHeight;
    const graphHeight =
        height - s.top - s.bottom;
    return (
        height -
        s.bottom -
        ((value + 35) / 60) *
        graphHeight
    );
}
function accelerationY(value) {
    const s = graphSettings;
    const height = ac.clientHeight;
    const graphHeight =
        height - s.top - s.bottom;
    return (
        height -
        s.bottom -
        ((value + 15) / 25) *
        graphHeight
    );
}
/* =========================================================
   VELOCITY GRID
   ========================================================= */
function drawVelocityGrid() {
    const width = vc.clientWidth;
    const height = vc.clientHeight;
    const s = graphSettings;
    vctx.strokeStyle = "#dddddd";
    vctx.lineWidth = 1;
    /*
       Vertical time grid
    */
    for (let sec = 0; sec <= T; sec++) {
        const x = graphX(sec, vc);
        vctx.beginPath();
        vctx.moveTo(
            x,
            s.top
        );
        vctx.lineTo(
            x,
            height - s.bottom
        );
        vctx.stroke();
    }
    /*
       Horizontal grid
    */
    const gridSpacing = Math.max(
        25,
        (height - s.top - s.bottom) / 5
    );
    for (
        let y = s.top;
        y <= height - s.bottom;
        y += gridSpacing
    ) {
        vctx.beginPath();
        vctx.moveTo(
            s.left,
            y
        );
        vctx.lineTo(
            width - s.right,
            y
        );
        vctx.stroke();
    }
}
/* =========================================================
   ACCELERATION GRID
   ========================================================= */
function drawAccelerationGrid() {
    const width = ac.clientWidth;
    const height = ac.clientHeight;
    const s = graphSettings;
    actx.strokeStyle = "#dddddd";
    actx.lineWidth = 1;
    /*
       Vertical time grid
    */
    for (let sec = 0; sec <= T; sec++) {
        const x = graphX(sec, ac);
        actx.beginPath();
        actx.moveTo(
            x,
            s.top
        );
        actx.lineTo(
            x,
            height - s.bottom
        );
        actx.stroke();
    }
    /*
       Horizontal grid
    */
    const gridSpacing = Math.max(
        25,
        (height - s.top - s.bottom) / 5
    );
    for (
        let y = s.top;
        y <= height - s.bottom;
        y += gridSpacing
    ) {
        actx.beginPath();
        actx.moveTo(
            s.left,
            y
        );
        actx.lineTo(
            width - s.right,
            y
        );
        actx.stroke();
    }
}
/* =========================================================
   VELOCITY GRAPH
   ========================================================= */
function drawVel() {
    const width = vc.clientWidth;
    const height = vc.clientHeight;
    const s = graphSettings;
    vctx.clearRect(
        0,
        0,
        width,
        height
    );
    drawVelocityGrid();
    const axisY = velocityY(0);
    /*
       Axes
    */
    vctx.strokeStyle = "black";
    vctx.lineWidth = 1;
    vctx.beginPath();
    vctx.moveTo(
        s.left,
        axisY
    );
    vctx.lineTo(
        width - s.right,
        axisY
    );
    vctx.moveTo(
        s.left,
        s.top
    );
    vctx.lineTo(
        s.left,
        height - s.bottom
    );
    vctx.stroke();
    /* =====================================================
       Y-AXIS LABELS
       ===================================================== */
    vctx.fillStyle = "black";
    vctx.font =
        `${s.font}px Arial`;
    vctx.textAlign = "right";
    vctx.textBaseline = "middle";
    const velocityLabels = [
        20,
        0,
        -20,
        -30
    ];
    velocityLabels.forEach(value => {
        vctx.fillText(
            value,
            s.left - 6,
            velocityY(value)
        );
    });
    /* =====================================================
       X-AXIS LABELS
       ===================================================== */
    vctx.textAlign = "center";
    vctx.textBaseline = "alphabetic";
    for (
        let sec = 0;
        sec <= T;
        sec++
    ) {
        const x =
            graphX(sec, vc);
        vctx.fillText(
            sec,
            x,
            height - 6
        );
    }
    /* =====================================================
       VELOCITY CURVE
       ===================================================== */
    vctx.strokeStyle = "green";
    vctx.lineWidth =
        s.lineWidth;
    vctx.beginPath();
    const step = 0.02;
    for (
        let i = 0;
        i <= T;
        i += step
    ) {
        const x =
            graphX(i, vc);
        const y =
            velocityY(vel(i));
        if (i === 0) {
            vctx.moveTo(
                x,
                y
            );
        } else {
            vctx.lineTo(
                x,
                y
            );
        }
    }
    vctx.stroke();
    /* =====================================================
       CURRENT POINT
       ===================================================== */
    const x =
        graphX(t, vc);
    const y =
        velocityY(vel(t));
    vctx.fillStyle = "red";
    vctx.beginPath();
    vctx.arc(
        x,
        y,
        s.pointRadius,
        0,
        Math.PI * 2
    );
    vctx.fill();
    /* =====================================================
       TANGENT / SLOPE LINE
       ===================================================== */
    const slope = acc(t);
    const scaleX =
        (width - s.left - s.right) / T;
    const scaleY =
        (height - s.top - s.bottom) / 60;
    const canvasSlope =
        -(slope * scaleY) / scaleX;
    /*
       Tangent length scales with
       the available screen width.
    */
    const dx = Math.min(
        90,
        (width - s.left - s.right) * 0.18
    );
    const dy =
        canvasSlope * dx;
    vctx.strokeStyle = "red";
    vctx.lineWidth = 1.5;
    vctx.setLineDash([
        6,
        6
    ]);
    vctx.beginPath();
    vctx.moveTo(
        x - dx,
        y - dy
    );
    vctx.lineTo(
        x + dx,
        y + dy
    );
    vctx.stroke();
    vctx.setLineDash([]);
}
/* =========================================================
   ACCELERATION GRAPH
   ========================================================= */
function drawAcc() {
    const width = ac.clientWidth;
    const height = ac.clientHeight;
    const s = graphSettings;
    actx.clearRect(
        0,
        0,
        width,
        height
    );
    drawAccelerationGrid();
    const axisY =
        accelerationY(0);
    /* =====================================================
       AXES
       ===================================================== */
    actx.strokeStyle = "black";
    actx.lineWidth = 1;
    actx.beginPath();
    actx.moveTo(
        s.left,
        axisY
    );
    actx.lineTo(
        width - s.right,
        axisY
    );
    actx.moveTo(
        s.left,
        s.top
    );
    actx.lineTo(
        s.left,
        height - s.bottom
    );
    actx.stroke();
    /* =====================================================
       Y-AXIS LABELS
       ===================================================== */
    actx.fillStyle = "black";
    actx.font =
        `${s.font}px Arial`;
    actx.textAlign = "right";
    actx.textBaseline = "middle";
    const accelerationLabels = [
        5,
        0,
        -10,
        -12.5
    ];
    accelerationLabels.forEach(value => {
        actx.fillText(
            value,
            s.left - 6,
            accelerationY(value)
        );
    });
    /* =====================================================
       X-AXIS LABELS
       ===================================================== */
    actx.textAlign = "center";
    actx.textBaseline = "alphabetic";
    for (
        let sec = 0;
        sec <= T;
        sec++
    ) {
        const x =
            graphX(sec, ac);
        actx.fillText(
            sec,
            x,
            height - 6
        );
    }
    /* =====================================================
       ACCELERATION CURVE
       ===================================================== */
    actx.strokeStyle = "blue";
    actx.lineWidth =
        s.lineWidth;
    actx.beginPath();
    const step = 0.02;
    for (
        let i = 0;
        i <= T;
        i += step
    ) {
        const x =
            graphX(i, ac);
        const y =
            accelerationY(acc(i));
        if (i === 0) {
            actx.moveTo(
                x,
                y
            );
        } else {
            actx.lineTo(
                x,
                y
            );
        }
    }
    actx.stroke();
    /* =====================================================
       CURRENT POINT
       ===================================================== */
    const x =
        graphX(t, ac);
    const y =
        accelerationY(acc(t));
    actx.fillStyle = "red";
    actx.beginPath();
    actx.arc(
        x,
        y,
        s.pointRadius,
        0,
        Math.PI * 2
    );
    actx.fill();
}
/* =========================================================
   RESPONSIVE CAR
   ========================================================= */
function car() {
    if (
        !road ||
        !carContainer ||
        !carSVG
    ) {
        return;
    }
    const roadWidth =
        road.clientWidth;
    /*
       Get actual displayed car width.
       This automatically works on:
       - small phones
       - large phones
       - tablets
       - laptops
    */
    const carWidth =
        carSVG.getBoundingClientRect().width;
    const usableWidth =
        Math.max(
            0,
            roadWidth - carWidth
        );
    /*
       Physical position:
       0 m → 150 m
    */
    let p = pos(t);
    /*
       Keep visual car inside the road.
    */
    p = Math.max(
        0,
        Math.min(150, p)
    );
    const left =
        (p / 150) * usableWidth;
    carContainer.style.left =
        `${left}px`;
    /*
       Turn car around when moving backwards.
    */
    carSVG.style.transform =
        vel(t) < 0
            ? "scaleX(-1)"
            : "scaleX(1)";
}
/* =========================================================
   DRAW EVERYTHING
   ========================================================= */
function drawAll() {
    drawVel();
    drawAcc();
    car();
}
/* =========================================================
   ANIMATION
   ========================================================= */
function animate() {
    if (!playing) {
        return;
    }
    t += 0.03;
    if (t >= T) {
        t = T;
        playing = false;
        id = null;
        drawAll();
        return;
    }
    drawAll();
    id =
        requestAnimationFrame(
            animate
        );
}
/* =========================================================
   PLAY
   ========================================================= */
playBtn.addEventListener(
    "click",
    () => {
        /*
           If already at the end,
           start again from zero.
        */
        if (t >= T) {
            t = 0;
        }
        if (!playing) {
            playing = true;
            id =
                requestAnimationFrame(
                    animate
                );
        }
    }
);
/* =========================================================
   STOP
   ========================================================= */
stopBtn.addEventListener(
    "click",
    () => {
        playing = false;
        if (id !== null) {
            cancelAnimationFrame(id);
            id = null;
        }
        drawAll();
    }
);
/* =========================================================
   RESET
   ========================================================= */
resetBtn.addEventListener(
    "click",
    () => {
        playing = false;
        if (id !== null) {
            cancelAnimationFrame(id);
            id = null;
        }
        t = 0;
        drawAll();
    }
);
/* =========================================================
   POINTER → TIME
   ========================================================= */
function pointerToTime(e) {
    const rect =
        vc.getBoundingClientRect();
    const s =
        graphSettings;
    /*
       Pointer coordinate relative
       to the canvas.
    */
    const x =
        e.clientX - rect.left;
    /*
       Actual graph width in CSS pixels.
    */
    const graphWidth =
        rect.width -
        s.left -
        s.right;
    /*
       Convert horizontal position
       to simulation time.
    */
    let newTime =
        ((x - s.left) / graphWidth) * T;
    /*
       Clamp to 0–18 seconds.
    */
    newTime =
        Math.max(
            0,
            Math.min(T, newTime)
        );
    return newTime;
}
/* =========================================================
   UPDATE FROM POINTER
   ========================================================= */
function updateFromPointer(e) {
    t =
        pointerToTime(e);
    drawAll();
}
/* =========================================================
   POINTER DOWN
   ========================================================= */
vc.addEventListener(
    "pointerdown",
    e => {
        /*
           Only use the primary pointer.
           This prevents two fingers from
           controlling the graph simultaneously.
        */
        if (!e.isPrimary) {
            return;
        }
        /*
           Supported pointer types:
           mouse, touch and pen.
        */
        if (
            e.pointerType !== "mouse" &&
            e.pointerType !== "touch" &&
            e.pointerType !== "pen"
        ) {
            return;
        }
        drag = true;
        activePointerId =
            e.pointerId;
        /*
           Remember animation state.
        */
        wasPlayingBeforeDrag =
            playing;
        /*
           Pause animation while dragging.
           This gives precise manual control.
        */
        if (playing) {
            playing = false;
            if (id !== null) {
                cancelAnimationFrame(id);
                id = null;
            }
        }
        /*
           Capture pointer.
           This is particularly important
           on phones and tablets because the
           finger may move outside the canvas.
        */
        if (vc.setPointerCapture) {
            vc.setPointerCapture(
                e.pointerId
            );
        }
        updateFromPointer(e);
        /*
           Prevent scrolling and browser
           gestures while dragging.
        */
        e.preventDefault();
    },
    {
        passive: false
    }
);
/* =========================================================
   POINTER MOVE
   ========================================================= */
vc.addEventListener(
    "pointermove",
    e => {
        if (!drag) {
            return;
        }
        if (
            e.pointerId !==
            activePointerId
        ) {
            return;
        }
        updateFromPointer(e);
        e.preventDefault();
    },
    {
        passive: false
    }
);
/* =========================================================
   FINISH POINTER DRAG
   ========================================================= */
function finishPointerDrag(e) {
    if (!drag) {
        return;
    }
    if (
        activePointerId !== null &&
        e.pointerId !== activePointerId
    ) {
        return;
    }
    drag = false;
    /*
       Release pointer capture.
    */
    if (
        vc.hasPointerCapture &&
        vc.hasPointerCapture(
            e.pointerId
        )
    ) {
        vc.releasePointerCapture(
            e.pointerId
        );
    }
    activePointerId = null;
    /*
       Continue animation if it was
       playing before manual dragging.
    */
    if (
        wasPlayingBeforeDrag &&
        t < T
    ) {
        playing = true;
        id =
            requestAnimationFrame(
                animate
            );
    }
    wasPlayingBeforeDrag = false;
    e.preventDefault();
}
/* =========================================================
   POINTER UP
   ========================================================= */
vc.addEventListener(
    "pointerup",
    finishPointerDrag,
    {
        passive: false
    }
);
/* =========================================================
   POINTER CANCEL
   ========================================================= */
vc.addEventListener(
    "pointercancel",
    finishPointerDrag,
    {
        passive: false
    }
);
/* =========================================================
   LOST POINTER CAPTURE
   ========================================================= */
vc.addEventListener(
    "lostpointercapture",
    () => {
        if (drag) {
            drag = false;
            activePointerId = null;
            wasPlayingBeforeDrag = false;
        }
    }
);
/* =========================================================
   EXTRA SAFETY
   ========================================================= */
window.addEventListener(
    "blur",
    () => {
        if (drag) {
            drag = false;
            activePointerId = null;
            wasPlayingBeforeDrag = false;
        }
    }
);
/* =========================================================
   INITIALISE
   ========================================================= */
function initialise() {
    updateGraphSettings();
    resize();
    drawAll();
}
/*
   Wait until page is fully rendered so
   clientWidth/clientHeight are correct.
*/
if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initialise
    );
} else {
    initialise();
}
