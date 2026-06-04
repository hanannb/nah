window.SKETCHES = window.SKETCHES || {};

window.SKETCHES['phyllotaxis'] = function(canvas) {
    const W  = canvas.clientWidth  || 600;
    const H  = canvas.clientHeight || 180;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const CX = W / 2, CY = H / 2;
    const SCALE    = Math.min(W, H) * 0.46;
    const MAX_SEED = 600;
    const GOLDEN   = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.39996 rad ≈ 137.508°

    let drawn = 0;
    let raf;

    function seedColor(i) {
        const t = i / MAX_SEED;
        const r = Math.floor(0   + t * 20);
        const g = Math.floor(100 + t * 100);
        const b = Math.floor(40  + t * 30);
        const a = 0.35 + t * 0.65;
        return `rgba(${r},${g},${b},${a})`;
    }

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    const BATCH = 6; // seeds per frame — controls grow speed
    function loop() {
        for (let b = 0; b < BATCH && drawn < MAX_SEED; b++, drawn++) {
            const r     = SCALE * Math.sqrt(drawn / MAX_SEED);
            const theta = drawn * GOLDEN;
            const x     = CX + r * Math.cos(theta);
            const y     = CY + r * Math.sin(theta);
            const radius = Math.max(1.2, (1 - drawn / MAX_SEED) * 5 + 1.5);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = seedColor(drawn);
            ctx.fill();
        }

        if (drawn < MAX_SEED) {
            raf = requestAnimationFrame(loop);
        }
        // once fully drawn, hold still — no further frames needed
    }

    loop();

    return {
        stop() {
            cancelAnimationFrame(raf);
            drawn = MAX_SEED; // prevent restart
        }
    };
};
