window.SKETCHES = window.SKETCHES || {};

window.SKETCHES['truchet'] = function(canvas) {
    const W  = canvas.clientWidth  || 600;
    const H  = canvas.clientHeight || 180;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const CELL  = 28;
    const COLS  = Math.ceil(W / CELL) + 1;
    const ROWS  = Math.ceil(H / CELL) + 1;
    const TOTAL = COLS * ROWS;

    // 0 = NW–SE arcs, 1 = NE–SW arcs
    const tiles = new Uint8Array(TOTAL).map(() => (Math.random() < 0.5 ? 0 : 1));

    let raf;
    let flipTimer = 0;
    const FLIP_INTERVAL = 90; // frames between random flips
    const FLIP_COUNT    = 6;  // how many tiles flip each cycle

    function drawTile(col, row, type) {
        const x = col * CELL;
        const y = row * CELL;
        const r = CELL / 2;
        ctx.beginPath();
        if (type === 0) {
            // arc from mid-top to mid-left, and arc from mid-bottom to mid-right
            ctx.arc(x,          y,          r, 0,          Math.PI / 2);
            ctx.moveTo(x + CELL, y + CELL);
            ctx.arc(x + CELL,   y + CELL,   r, Math.PI,    3 * Math.PI / 2);
        } else {
            // arc from mid-top to mid-right, and arc from mid-bottom to mid-left
            ctx.arc(x + CELL,   y,          r, Math.PI / 2, Math.PI);
            ctx.moveTo(x, y + CELL);
            ctx.arc(x,          y + CELL,   r, 3 * Math.PI / 2, 2 * Math.PI);
        }
        ctx.stroke();
    }

    function redrawAll() {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#00aa44';
        ctx.lineWidth = 1.5;
        ctx.lineCap  = 'round';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                drawTile(c, r, tiles[r * COLS + c]);
            }
        }
    }

    function flashTile(col, row, type) {
        // draw the new tile in a bright flash colour then it settles to normal on next full redraw
        ctx.strokeStyle = '#b8f0a0';
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        drawTile(col, row, type);
    }

    redrawAll();

    let frame = 0;
    function loop() {
        frame++;
        if (frame - flipTimer >= FLIP_INTERVAL) {
            flipTimer = frame;
            for (let i = 0; i < FLIP_COUNT; i++) {
                const idx = Math.floor(Math.random() * TOTAL);
                tiles[idx] ^= 1;
                const col = idx % COLS;
                const row = Math.floor(idx / COLS);
                flashTile(col, row, tiles[idx]);
            }
            // settle after a short delay
            setTimeout(redrawAll, 120);
        }
        raf = requestAnimationFrame(loop);
    }

    loop();

    return {
        stop() { cancelAnimationFrame(raf); }
    };
};
