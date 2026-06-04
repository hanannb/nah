window.SKETCHES = window.SKETCHES || {};

window.SKETCHES['epicycles'] = function(canvas) {
    const W  = canvas.clientWidth  || 600;
    const H  = canvas.clientHeight || 180;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const CX = W / 2, CY = H / 2;
    const SCALE = Math.min(W, H) * 0.36;

    // ── sample the lemniscate of Bernoulli ──────────────────────────
    // Parametric: x = cos(t)/(1+sin²(t)),  y = sin(t)cos(t)/(1+sin²(t))
    const N = 128;
    const pts = [];
    for (let i = 0; i < N; i++) {
        const t = (i / N) * 2 * Math.PI;
        const d = 1 + Math.sin(t) * Math.sin(t);
        pts.push({ x: Math.cos(t) / d * SCALE, y: Math.sin(t) * Math.cos(t) / d * SCALE });
    }

    // ── DFT over complex points ─────────────────────────────────────
    function dft(points) {
        const result = [];
        for (let k = 0; k < N; k++) {
            let re = 0, im = 0;
            for (let n = 0; n < N; n++) {
                const phi = (2 * Math.PI * k * n) / N;
                re += points[n].x * Math.cos(phi) + points[n].y * Math.sin(phi);
                im += -points[n].x * Math.sin(phi) + points[n].y * Math.cos(phi);
            }
            re /= N; im /= N;
            const freq = k < N / 2 ? k : k - N; // map to signed frequency
            result.push({ re, im, freq, amp: Math.hypot(re, im), phase: Math.atan2(im, re) });
        }
        return result.sort((a, b) => b.amp - a.amp);
    }

    const terms = dft(pts);
    const TOP   = 40; // use top 40 terms by amplitude

    // ── traced path ─────────────────────────────────────────────────
    const path = [];
    const FRAMES_PER_CYCLE = 360;
    let raf, frame = 0;

    function loop() {
        ctx.fillStyle = 'rgba(17,17,17,0.18)';
        ctx.fillRect(0, 0, W, H);

        const time = (frame / FRAMES_PER_CYCLE) * 2 * Math.PI;

        // draw epicycle arms
        let x = CX, y = CY;
        ctx.strokeStyle = 'rgba(0,120,50,0.35)';
        ctx.lineWidth   = 0.8;

        for (let i = 0; i < TOP; i++) {
            const { re, im, freq, amp, phase } = terms[i];
            const angle = freq * time + phase;
            const nx = x + Math.cos(angle) * amp;
            const ny = y + Math.sin(angle) * amp;

            // draw circle
            ctx.beginPath();
            ctx.arc(x, y, amp, 0, 2 * Math.PI);
            ctx.stroke();

            // draw arm
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nx, ny);
            ctx.stroke();

            x = nx; y = ny;
        }

        // record tip
        path.push({ x, y });
        if (path.length > FRAMES_PER_CYCLE + 2) path.shift();

        // draw traced path
        if (path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.strokeStyle = '#00cc55';
            ctx.lineWidth   = 1.6;
            ctx.stroke();
        }

        // draw tip dot
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#b0ffb0';
        ctx.fill();

        frame++;
        raf = requestAnimationFrame(loop);
    }

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);
    loop();

    return {
        stop() { cancelAnimationFrame(raf); }
    };
};
