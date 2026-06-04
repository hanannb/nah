window.SKETCHES = window.SKETCHES || {};

window.SKETCHES['flow-field'] = function(canvas) {
    const W = canvas.clientWidth  || 600;
    const H = canvas.clientHeight || 180;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const N = 380;
    const particles = Array.from({ length: N }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        life: Math.floor(Math.random() * 100),
        maxLife: 70 + Math.floor(Math.random() * 80),
    }));

    let tick = 0;
    let raf;

    function field(x, y, t) {
        const s = 0.0055;
        return Math.sin(x * s + Math.sin(y * s * 0.65 + t * 0.004)) * Math.PI * 2.5
             + Math.cos(y * s * 1.1 + t * 0.002) * 0.7;
    }

    function reset(p) {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
        p.life = 0;
        p.maxLife = 70 + Math.floor(Math.random() * 80);
    }

    function loop() {
        // subtle fade — lets trails persist briefly
        ctx.fillStyle = 'rgba(17,17,17,0.045)';
        ctx.fillRect(0, 0, W, H);

        particles.forEach(p => {
            const a = field(p.x, p.y, tick);
            const speed = 1.4;
            p.x += Math.cos(a) * speed;
            p.y += Math.sin(a) * speed;
            p.life++;

            if (p.life > p.maxLife || p.x < -2 || p.x > W + 2 || p.y < -2 || p.y > H + 2) {
                reset(p); return;
            }

            const alpha = Math.min(1, p.life / 18) * 0.55;
            // colour drifts from green to amber based on field strength
            const t2 = (Math.sin(a * 0.5) + 1) * 0.5;
            const r = Math.floor(t2 * 180);
            const g = Math.floor(160 + t2 * 20);
            const b = Math.floor(70 * (1 - t2));
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.fillRect(p.x, p.y, 1.4, 1.4);
        });

        tick++;
        raf = requestAnimationFrame(loop);
    }

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);
    loop();

    return {
        stop() { cancelAnimationFrame(raf); }
    };
};
