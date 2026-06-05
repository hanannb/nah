(() => {
    const $  = id => document.getElementById(id);
    const esc = s => String(s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // ── safe localStorage ─────────────────────────────────────────────────────
    const safeGet     = (k, fb) => { try { const v = localStorage.getItem(k); return v !== null ? v : fb; } catch (e) { return fb; } };
    const safeSet     = (k, v)  => { try { localStorage.setItem(k, v); } catch (e) {} };
    const safeGetJSON = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };
    const safeSetJSON = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

    // ── state ─────────────────────────────────────────────────────────────────
    const PUZZLE_KEY = 'nah_hannan_puzzle_solved';
    const SIGN_KEY   = 'nah_hannan_sign_space';
    const SOURCE_KEY = 'nah_hannan_source_found';

    let puzzleSolved       = safeGet(PUZZLE_KEY, 'false') === 'true';
    let sourcePuzzleSolved = safeGet(SOURCE_KEY, 'false') === 'true';
    let glitchInterval     = null;

    // ── SVD canvas resize observer ────────────────────────────────────────────
    let svdResizeObserver = null;
    let svdRedrawPending  = null;
    function ensureObserver(canvas) {
        if (!canvas) return;
        if (!svdResizeObserver) {
            svdResizeObserver = new ResizeObserver(() => {
                if (svdRedrawPending) cancelAnimationFrame(svdRedrawPending);
                svdRedrawPending = requestAnimationFrame(updateSVD);
            });
        }
        svdResizeObserver.observe(canvas);
    }
    function disconnectObserver() { if (svdResizeObserver) svdResizeObserver.disconnect(); }

    // ── puzzle solved ─────────────────────────────────────────────────────────
    function markPuzzleSolved() {
        if (puzzleSolved) return;
        puzzleSolved = true;
        safeSet(PUZZLE_KEY, 'true');
        const g = $('glitch');
        if (!g) return;
        g.classList.add('vanishing');
        g.addEventListener('animationend', () => { if (g.parentNode) g.remove(); }, { once: true });
        if (glitchInterval) { clearTimeout(glitchInterval); glitchInterval = null; }
    }

    // ── sketch accordion (canvas 2D + p5 generative) ─────────────────────────
    const activeSketch = {};

    function openEntry(entryEl) {
        entryEl.classList.add('open');
        const slug = entryEl.dataset.slug;
        if (!slug || activeSketch[slug]) return;

        if (entryEl.dataset.type === 'p5') {
            // p5.js instance mode sketch
            const container = document.getElementById('p5c-' + slug);
            if (!container || !window.P5_SKETCHES || !window.P5_SKETCHES[slug]) return;
            activeSketch[slug] = window.P5_SKETCHES[slug].run(container);
            return;
        }

        // raw canvas 2D sketch
        const canvas = entryEl.querySelector('.sketch-canvas');
        if (!canvas || !window.SKETCHES || !window.SKETCHES[slug]) return;
        const W = canvas.clientWidth  || entryEl.clientWidth || 500;
        const H = canvas.clientHeight || 180;
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        activeSketch[slug] = window.SKETCHES[slug](canvas);
    }

    function closeEntry(entryEl) {
        const slug = entryEl.dataset.slug;
        if (slug && activeSketch[slug]) { activeSketch[slug].stop(); delete activeSketch[slug]; }
        entryEl.classList.remove('open');
    }

    function handleEntryClick(e) {
        // code toggle buttons — handle before accordion logic
        const toggleBtn = e.target.closest('.sketch-code-toggle');
        if (toggleBtn) {
            const pre = document.getElementById(toggleBtn.dataset.target);
            if (pre) {
                const open = pre.style.display === 'block';
                pre.style.display = open ? 'none' : 'block';
                toggleBtn.textContent = open ? 'view source ▸' : 'hide source ▴';
            }
            return;
        }
        const entry = e.target.closest('[data-expandable]');
        if (!entry) return;
        const wasOpen = entry.classList.contains('open');
        const feed = entry.closest('.feed, .p5-featured');
        if (feed) feed.querySelectorAll('[data-expandable].open').forEach(el => { if (el !== entry) closeEntry(el); });
        // also close across sections on the same page
        document.querySelectorAll('#page-tinkering [data-expandable].open').forEach(el => { if (el !== entry) closeEntry(el); });
        wasOpen ? closeEntry(entry) : openEntry(entry);
    }

    // ── render: notes / essays ────────────────────────────────────────────────
    function renderFeed(key, entries) {
        const el = $('page-' + key);
        if (!el) return;

        if (key === 'essays') {
            const rows = entries.map(e => {
                const body = (typeof essayBodies !== 'undefined' && essayBodies[e.id]) || '';
                const subtitle = e.subtitle ? `<p class="essay-subtitle">${esc(e.subtitle)}</p>` : '';
                const detail = `<div class="project-detail">
                        ${subtitle}
                        <p class="essay-lede"><em>${esc(e.lede)}</em></p>
                        <div class="essay-body">${body}</div>
                    </div>`;
                return `<div class="entry" data-expandable data-id="${esc(e.id)}">
                    <div class="row">
                        <time datetime="${esc(e.date)}">${esc(e.date)}</time>
                        <span class="title">${esc(e.title)}</span>
                        <span class="expand-hint">→</span>
                    </div>
                    ${detail}
                </div>`;
            }).join('');
            el.innerHTML = `<div class="feed">${rows}</div>`;
            el.addEventListener('click', handleEntryClick);
            return;
        }

        const rows = entries.map(e =>
            `<div class="row">
                <time datetime="${esc(e.date)}">${esc(e.date)}</time>
                <span class="title">${esc(e.title)}</span>
                <span class="tag">[${esc(e.tag)}]</span>
            </div>`
        ).join('');
        el.innerHTML = `<div class="feed">${rows}</div>`;
    }

    // ── render: research ──────────────────────────────────────────────────────
    function renderResearch() {
        const el = $('page-research');
        if (!el) return;
        let html = '<div class="feed">';
        researchEntries.forEach(e => {
            if (e.shortTitle) {
                html += `<div class="entry" data-project="${esc(e.slug)}">
                    <div class="row">
                        <time datetime="${esc(e.date)}">${esc(e.date)}</time>
                        <span class="title">${esc(e.title)}</span>
                        <span class="expand-hint">→</span>
                    </div>
                </div>`;
            } else {
                html += `<div class="row">
                    <time datetime="${esc(e.date)}">${esc(e.date)}</time>
                    <span class="title">${esc(e.title)}</span>
                    <span class="tag">[${esc(e.tag)}]</span>
                </div>`;
            }
        });
        html += `</div><p class="promptline">${esc(pages.research.prompt)}</p>`;
        el.innerHTML = html;
        el.addEventListener('click', e => {
            const entry = e.target.closest('[data-project]');
            if (entry) transitionToProject(entry.dataset.project);
        });
    }

    // ── render: project page ──────────────────────────────────────────────────
    function renderProject(slug) {
        const el = $('page-project');
        if (!el) return;
        const entry = researchEntries.find(e => e.slug === slug);
        if (!entry || !entry.detail) {
            el.innerHTML = `<button class="project-back" id="projectBack">← research</button>
                <p class="promptline">project not found.</p>`;
            $('projectBack').addEventListener('click', () => transitionToPage('research'));
            return;
        }
        const d = entry.detail;
        const tagsHtml   = (entry.tags || []).map(t => `<span class="project-page-tag">${esc(t)}</span>`).join('');
        const statusHtml = `<span class="project-page-status ${esc(entry.tag)}">${esc(entry.tag)}</span>`;
        const stackHtml  = d.stack ? `<div class="project-page-stack">${esc(d.stack)}</div>` : '';
        const codeHtml   = d.code  ? `<pre class="project-page-code">${esc(d.code)}</pre>` : '';
        const parasHtml  = d.paragraphs.map(p => `<p>${esc(p)}</p>`).join('');
        const githubHtml = d.github
            ? `<a class="project-github" href="${esc(d.github)}" target="_blank" rel="noopener noreferrer">→ view source</a>`
            : '';
        el.innerHTML = `
            <button class="project-back" id="projectBack">← research</button>
            <div class="project-page-title">${esc(entry.title)}</div>
            <div class="project-page-tags">${statusHtml}${tagsHtml}</div>
            ${stackHtml}
            ${codeHtml}
            <div class="project-page-body">${parasHtml}</div>
            ${githubHtml}
            <p class="promptline">${esc(pages.research.prompt)}</p>`;
        $('projectBack').addEventListener('click', () => transitionToPage('research'));
    }

    // ── render: tinkering ─────────────────────────────────────────────────────
    function p5EntryHTML(e) {
        const code = window.P5_SKETCHES?.[e.slug]?.code || '';
        return `<div class="sketch-p5-container" id="p5c-${esc(e.slug)}"></div>
            <div class="sketch-code-panel">
                <button class="sketch-code-toggle" data-target="skcode-${esc(e.slug)}">view source ▸</button>
                <pre class="sketch-code-pre" id="skcode-${esc(e.slug)}" style="display:none">${esc(code)}</pre>
            </div>
            ${e.desc ? `<p class="project-p" style="margin-top:4px;">${esc(e.desc)}</p>` : ''}`;
    }

    function renderTinkering() {
        const el = $('page-tinkering');
        if (!el) return;
        let html = '';

        // ── generative section (p5) ────────────────────────────────────────
        html += '<div class="lib-category">sketches</div>';

        // Featured: Torpid Cabinet — standalone hero
        const featured = p5ArtEntries.find(e => e.featured);
        if (featured) {
            html += `<div class="entry p5-featured" data-expandable data-slug="${esc(featured.slug)}" data-type="p5">
                <div class="row lib">
                    <span class="label">${esc(featured.label)}</span>
                    <span class="title">${esc(featured.title)}</span>
                    <span class="expand-hint">▸</span>
                </div>
                <div class="project-detail">${p5EntryHTML(featured)}</div>
            </div>`;
        }

        // Rest of p5 entries
        html += '<div class="feed">';
        p5ArtEntries.filter(e => !e.featured).forEach(e => {
            html += `<div class="entry" data-expandable data-slug="${esc(e.slug)}" data-type="p5">
                <div class="row lib">
                    <span class="label">${esc(e.label)}</span>
                    <span class="title">${esc(e.title)}</span>
                    <span class="expand-hint">▸</span>
                </div>
                <div class="project-detail">${p5EntryHTML(e)}</div>
            </div>`;
        });
        html += '</div>';

        // ── math art section (canvas 2D) ───────────────────────────────────
        html += '<div class="lib-category">math art</div>';
        html += '<div class="feed">';
        mathArtEntries.forEach(e => {
            const detailContent = `<canvas class="sketch-canvas" id="sketch-${esc(e.slug)}"></canvas>${
                e.detail.paragraphs.map(p => `<p class="project-p">${esc(p)}</p>`).join('')
            }`;
            html += `<div class="entry" data-expandable data-slug="${esc(e.slug)}">
                <div class="row lib">
                    <span class="label">${esc(e.label)}</span>
                    <span class="title">${esc(e.title)}</span>
                    <span class="expand-hint">▸</span>
                </div>
                <div class="project-detail">${detailContent}</div>
            </div>`;
        });
        html += '</div>';

        // ── builds section ─────────────────────────────────────────────────
        html += '<div class="lib-category">builds</div>';
        html += '<div class="feed">';
        tinkerEntries.forEach(e => {
            html += `<div class="row lib">
                <span class="label">${esc(e.label)}</span>
                <span class="title">${esc(e.title)}</span>
                <span class="tag">[${esc(e.tag)}]</span>
            </div>`;
        });
        html += '</div>';

        html += ``;
        el.innerHTML = html;
        el.addEventListener('click', handleEntryClick);
    }

    // ── render: library ───────────────────────────────────────────────────────
    function renderLibrary() {
        const el = $('page-library');
        if (!el) return;
        const cats = [...new Set(books.map(b => b.cat))];
        let html = '';
        cats.forEach(cat => {
            html += `<div class="lib-category">${esc(cat)}</div>`;
            books.filter(b => b.cat === cat).forEach(b => {
                html += `<div class="book-entry">
                    <div class="book-title-row">
                        <span>${esc(b.title)}</span>
                        <span class="book-author">${esc(b.author)}</span>
                    </div>
                    <div class="book-thoughts">${esc(b.thoughts)}</div>
                </div>`;
            });
        });
        html += ``;
        el.innerHTML = html;
        el.addEventListener('click', e => {
            const entry = e.target.closest('.book-entry');
            if (entry) entry.classList.toggle('open');
        });
    }

    // ── sign: falling equation ────────────────────────────────────────────────
    function addFallingEquation(text, isSecret = false) {
        const container = $('fallingContainer');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'falling-equation';
        div.textContent = text;
        if (isSecret) div.classList.add('secret');
        container.appendChild(div);
        div.offsetHeight; // force reflow to trigger animation
        div.classList.add('fall');
        div.addEventListener('animationend', () => {
            div.remove();
            const log = $('equationLog');
            if (log) {
                const li = document.createElement('li');
                li.textContent = text;
                if (isSecret) li.style.color = '#80ff80';
                log.prepend(li);
            }
        }, { once: true });
    }

    // ── render: sign terminal (cyberdeck) ─────────────────────────────────────
    const SECRET_CMDS = {
        'det(a)=0':          '> DET(A) = 0 — null space opens.',
        'det(a) = 0':        '> DET(A) = 0 — null space opens.',
        'σ₁·σ₂=|det(a)|':   '> σ₁ · σ₂ = |det(A)| — source unlocked.',
        'σ₁·σ₂ = |det(a)|': '> σ₁ · σ₂ = |det(A)| — source unlocked.',
        'source':            '> source reading acknowledged.',
        'e^(iπ)+1=0':        '> e^(iπ) + 1 = 0 — Euler\'s identity.',
        'e^(iπ) + 1 = 0':   '> e^(iπ) + 1 = 0 — Euler\'s identity.',
    };

    function renderSign() {
        const el = $('page-sign');
        if (!el) return;
        const stored = safeGetJSON(SIGN_KEY, []);
        const allEquations = [...SEEDED_EQUATIONS, ...stored];
        const logHtml = allEquations.map(eq => `<li>${esc(eq)}</li>`).join('');
        el.innerHTML = `
            <div class="cyber-sign">
                <div class="sign-header">
                    <span class="sign-glitch">SIGN IN SPACE</span>
                    <span class="sign-sub">[ cyberdeck v1.0 ]</span>
                </div>
                <div class="falling-zone" id="fallingContainer"></div>
                <div class="equation-log-container">
                    <div class="log-header">» DATA STREAM «</div>
                    <ul class="equation-log" id="equationLog">${logHtml}</ul>
                </div>
                <div class="sign-input-group">
                    <span class="prompt">&gt;</span>
                    <input type="text" id="cyberInput" class="cyber-input"
                           placeholder="enter an equation..." autocomplete="off" spellcheck="false">
                    <button id="cyberSubmit" class="cyber-btn">&#x21B5;</button>
                </div>
                <div class="kbd-hints">[ secret commands: det(a)=0 | source | e^(i&#x03C0;)+1=0 ]</div>
            </div>
            <p class="promptline">${esc(pages.sign.prompt)}</p>`;

        const input  = $('cyberInput');
        const submit = $('cyberSubmit');
        const logEl  = $('equationLog');

        function submitEquation() {
            const val = input.value.trim();
            if (!val) return;
            input.value = '';
            const lower = val.toLowerCase();
            if (SECRET_CMDS[lower]) {
                addFallingEquation(SECRET_CMDS[lower], true);
                if (!sourcePuzzleSolved) { sourcePuzzleSolved = true; safeSet(SOURCE_KEY, 'true'); }
                return;
            }
            const storedNow = safeGetJSON(SIGN_KEY, []);
            storedNow.push(val);
            safeSetJSON(SIGN_KEY, storedNow);
            addFallingEquation(val, false);
            const li = document.createElement('li');
            li.textContent = val;
            logEl.prepend(li);
        }

        submit.addEventListener('click', submitEquation);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') submitEquation(); });
        setTimeout(() => input.focus(), 100);
    }

    // ── SVD puzzle: revelation animation ─────────────────────────────────────
    let revelationAnimFrame = null;
    let revelationActive    = false;

    function drawRevelation(ctx, w, h) {
        const t = Date.now() / 1000;
        ctx.clearRect(0, 0, w, h);
        const cell = 40;
        for (let x = 0; x < w + cell; x += cell) {
            for (let y = 0; y < h + cell; y += cell) {
                const nx = x / w, ny = y / h;
                const r = Math.sin(nx * Math.PI * 2 + t)           * 0.5 + 0.5;
                const g = Math.cos(ny * Math.PI * 2 + t * 1.3)     * 0.5 + 0.5;
                const b = Math.sin((nx + ny) * Math.PI * 3 + t * 0.7) * 0.5 + 0.5;
                ctx.fillStyle = `rgb(${Math.round(40+r*150)},${Math.round(80+g*120)},${Math.round(20+b*100)})`;
                ctx.fillRect(x, y, cell - 1, cell - 1);
                ctx.fillStyle = 'rgba(0,255,100,0.2)';
                ctx.fillRect(x + 2, y + 2, cell - 5, cell - 5);
            }
        }
        ctx.font = '12px monospace';
        ctx.fillStyle = '#80ff80';
        ctx.shadowBlur = 0;
        ctx.fillText('σ₂ = 0 — dimension collapsed', 20, 30);
        ctx.fillText('↯ singularity revealed ↯', 20, 50);
    }

    function stopRevelation() {
        if (revelationAnimFrame) { cancelAnimationFrame(revelationAnimFrame); revelationAnimFrame = null; }
        revelationActive = false;
    }

    function startRevelation(canvas) {
        if (revelationActive) return;
        revelationActive = true;
        const ctx = canvas.getContext('2d');
        function animate() {
            if (!revelationActive) return;
            const w = canvas.clientWidth, h = canvas.clientHeight;
            if (w && h) {
                const dpr = window.devicePixelRatio || 1;
                canvas.width  = w * dpr;
                canvas.height = h * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                drawRevelation(ctx, w, h);
            }
            revelationAnimFrame = requestAnimationFrame(animate);
        }
        animate();
    }

    // ── SVD maths ─────────────────────────────────────────────────────────────
    function svd(a, b, c, d) {
        const ATA11 = a*a + c*c, ATA12 = a*b + c*d, ATA22 = b*b + d*d;
        const trace = ATA11 + ATA22, det = ATA11 * ATA22 - ATA12 * ATA12;
        const disc  = Math.sqrt(Math.max(0, trace * trace / 4 - det));
        return {
            sigma1: Math.sqrt(Math.max(0, trace / 2 + disc)),
            sigma2: Math.sqrt(Math.max(0, trace / 2 - disc)),
        };
    }

    function drawSVD(ctx, w, h, a, b, c, d, isSingular) {
        const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.30;
        ctx.fillStyle = '#111111'; ctx.fillRect(0, 0, w, h);

        ctx.beginPath(); ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 0.5;
        for (let x = cx % s; x <= w; x += s) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = cy % s; y <= h; y += s) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();

        ctx.beginPath(); ctx.strokeStyle = '#2e3e2e'; ctx.lineWidth = 1;
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.stroke();

        ctx.beginPath(); ctx.strokeStyle = '#2a4a6a'; ctx.lineWidth = 1;
        for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.02) {
            const x = cx + Math.cos(t) * s, y = cy - Math.sin(t) * s;
            t < 0.01 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();

        ctx.beginPath(); ctx.strokeStyle = isSingular ? '#aa3322' : '#b87840'; ctx.lineWidth = 2;
        for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.02) {
            const x0 = Math.cos(t), y0 = Math.sin(t);
            const x = cx + (a * x0 + b * y0) * s, y = cy - (c * x0 + d * y0) * s;
            t < 0.01 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();

        const arrow = (tx, ty) => {
            const ang = Math.atan2(ty - cy, tx - cx), L = 7;
            ctx.moveTo(tx, ty); ctx.lineTo(tx - L * Math.cos(ang - 0.38), ty - L * Math.sin(ang - 0.38));
            ctx.moveTo(tx, ty); ctx.lineTo(tx - L * Math.cos(ang + 0.38), ty - L * Math.sin(ang + 0.38));
        };
        ctx.beginPath(); ctx.strokeStyle = '#00aa44'; ctx.lineWidth = 1.5;
        ctx.moveTo(cx, cy); ctx.lineTo(cx + a * s, cy - c * s);
        ctx.moveTo(cx, cy); ctx.lineTo(cx + b * s, cy - d * s);
        arrow(cx + a * s, cy - c * s); arrow(cx + b * s, cy - d * s);
        ctx.stroke();

        if (isSingular) {
            ctx.save(); ctx.setLineDash([3, 5]);
            ctx.beginPath(); ctx.strokeStyle = 'rgba(170,51,34,0.22)'; ctx.lineWidth = 1;
            ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
            ctx.restore();
        }
        ctx.beginPath(); ctx.fillStyle = isSingular ? '#aa3322' : '#409040';
        ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    }

    function updateSVD() {
        const a = +$('svdA').value || 0, b = +$('svdB').value || 0,
              c = +$('svdC').value || 0, d = +$('svdD').value || 0;
        const { sigma1, sigma2 } = svd(a, b, c, d);
        const isZero    = !a && !b && !c && !d;
        const rank      = isZero ? 0 : (Math.abs(sigma2) < 1e-6 ? 1 : 2);
        const isSingular = rank < 2 && !isZero;

        $('svdMatrixStr').innerHTML   = `⎡ ${a.toFixed(2)}  ${b.toFixed(2)} ⎤<br>⎣ ${c.toFixed(2)}  ${d.toFixed(2)} ⎦`;
        $('svdSingularStr').innerHTML = `σ₁ = ${sigma1.toFixed(3)}, σ₂ = ${sigma2.toFixed(3)}`;
        $('svdCondStr').innerHTML     = sigma2 < 1e-6 ? '∞' : (sigma1 / sigma2).toFixed(3);
        $('svdRankStr').innerHTML     = rank === 0 ? '0 (zero matrix)' : rank === 1 ? '1 (dimension lost)' : '2 (full)';
        $('svdRecoverStr').innerHTML  = isSingular ? 'FALSE' : 'TRUE';
        $('svdRecoverStr').classList.toggle('warning',   isSingular);
        $('svdRecoverStr').classList.toggle('highlight', !isSingular);

        const rewardEl = $('puzzleReward');
        const canvas   = $('svdCanvas');

        if (isSingular) {
            if (rewardEl) rewardEl.style.display = 'block';
            if (canvas && !revelationActive) startRevelation(canvas);
            markPuzzleSolved();
        } else {
            if (rewardEl) rewardEl.style.display = 'none';
            stopRevelation();
            if (canvas) {
                const w = canvas.clientWidth, h = canvas.clientHeight;
                if (!w || !h) return;
                const dpr = window.devicePixelRatio || 1;
                canvas.width = w * dpr; canvas.height = h * dpr;
                const ctx = canvas.getContext('2d');
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                drawSVD(ctx, w, h, a, b, c, d, false);
            }
        }
    }

    function setupField(id) {
        const inp = $(id);
        if (!inp) return;
        inp.addEventListener('input', updateSVD);
        inp.addEventListener('keydown', e => {
            const step = e.shiftKey ? 0.1 : 1;
            if (e.key === 'ArrowUp')   { e.preventDefault(); inp.value = ((+inp.value) + step).toFixed(e.shiftKey ? 1 : 0); updateSVD(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); inp.value = ((+inp.value) - step).toFixed(e.shiftKey ? 1 : 0); updateSVD(); }
            if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault(); $('svdA').value = 1; $('svdB').value = 0; $('svdC').value = 0; $('svdD').value = 1; updateSVD();
            }
        });
    }

    function renderPuzzle() {
        const el = $('page-puzzle');
        if (!el) return;
        el.innerHTML = `<div class="terminal-puzzle">
<h3>SVD · dimensional collapse</h3>
<div class="lede">every 2×2 matrix <b>A</b> stretches or squashes the plane along two principal directions. the singular values σ₁ and σ₂ measure how much. when σ₂ hits zero the matrix folds the plane onto a line — a move it cannot undo.</div>
<div class="puzzle-math">A = UΣVᵀ   where   Σ = ⎡ σ₁  0 ⎤
                      ⎣  0 σ₂ ⎦</div>
<canvas class="matrix-stage" id="svdCanvas"></canvas>
<div class="puzzle-readout">
  <div><span class="k">matrix A</span></div><div class="v" id="svdMatrixStr"></div>
  <div><span class="k">singular values</span></div><div class="v" id="svdSingularStr"></div>
  <div><span class="k">condition number</span></div><div class="v" id="svdCondStr"></div>
  <div><span class="k">rank</span></div><div class="v" id="svdRankStr"></div>
  <div><span class="k">invertible</span></div><div class="v highlight" id="svdRecoverStr"></div>
</div>
<div class="puzzle-input-group">
  <label for="svdA">a</label><input type="number" id="svdA" class="matrix-input" step="1" value="2" autocomplete="off" aria-label="Matrix a">
  <label for="svdB">b</label><input type="number" id="svdB" class="matrix-input" step="1" value="0" autocomplete="off" aria-label="Matrix b">
  <label for="svdC">c</label><input type="number" id="svdC" class="matrix-input" step="1" value="0" autocomplete="off" aria-label="Matrix c">
  <label for="svdD">d</label><input type="number" id="svdD" class="matrix-input" step="1" value="1" autocomplete="off" aria-label="Matrix d">
  <button class="btn" id="svdReset">identity</button>
</div>
<div class="kbd-hints">
  <span><kbd>Tab</kbd> next field</span><span><kbd>↑↓</kbd> ±1</span><span><kbd>Shift</kbd>+<kbd>↑↓</kbd> ±0.1</span><span><kbd>r</kbd> reset</span>
</div>
<div id="puzzleReward" class="puzzle-reward" style="display:none;">
  <div class="puzzle-reward-text">&gt; determinant zero.<br>&gt; a dimension is gone. the matrix lives on a line.<br>&gt; information cannot be reconstructed. welcome to the null space.<br><span style="font-size:10.5px;color:#507050;">&gt; [ ▒ permanently deleted from the DOM ]</span></div>
</div>
<div class="puzzle-math">goal: make σ₂ = 0. watch the ellipse collapse to a line.</div>
</div>`;
        ['svdA', 'svdB', 'svdC', 'svdD'].forEach(setupField);
        $('svdReset').addEventListener('click', () => {
            $('svdA').value = 1; $('svdB').value = 0; $('svdC').value = 0; $('svdD').value = 1; updateSVD();
        });
        updateSVD();
        const canvas = $('svdCanvas');
        if (canvas) { disconnectObserver(); ensureObserver(canvas); }
    }

    // ── nav / DOM refs ────────────────────────────────────────────────────────
    const nav         = $('nav');
    const typedEl     = $('typed');
    const winTitleEl  = $('winTitle');
    const statusLeft  = $('statusLeft');
    const statusRight = $('statusRight');
    const clockEl     = $('clock');
    const bodyEl      = $('body');
    const crtScreen   = $('crtScreen');

    navOrder.forEach(key => {
        const a = document.createElement('a');
        a.textContent = pages[key].label;
        a.href = '#' + key;
        a.dataset.page = key;
        nav.appendChild(a);
    });

    // ── audio ─────────────────────────────────────────────────────────────────
    let audioCtx;
    function playCrtPop() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const now = audioCtx.currentTime;
            const gain = audioCtx.createGain();
            gain.connect(audioCtx.destination);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            const osc = audioCtx.createOscillator();
            osc.connect(gain); osc.frequency.value = 100;
            osc.start(); osc.stop(now + 0.07);
        } catch (e) {}
    }

    // ── typewriter ────────────────────────────────────────────────────────────
    let typeTimer, currentWords = [], wordIdx = 0, charIdx = 0, deleting = false;
    function startTypewriter(words) {
        if (!words || !typedEl) return;
        clearTimeout(typeTimer);
        currentWords = words; wordIdx = charIdx = 0; deleting = false;
        typedEl.textContent = '';
        function step() {
            if (!typedEl) return;
            const t = currentWords[wordIdx];
            if (!t) return;
            if (!deleting) {
                if (charIdx < t.length) { charIdx++; typedEl.textContent = t.slice(0, charIdx); typeTimer = setTimeout(step, 80 + Math.random() * 40); }
                else { deleting = true; typeTimer = setTimeout(step, 1800); }
            } else {
                if (charIdx > 0) { charIdx--; typedEl.textContent = t.slice(0, charIdx); typeTimer = setTimeout(step, 40 + Math.random() * 20); }
                else { deleting = false; wordIdx = (wordIdx + 1) % currentWords.length; typeTimer = setTimeout(step, 300); }
            }
        }
        step();
    }

    // ── page transitions ──────────────────────────────────────────────────────
    let isTransitioning = false, currentKey = null;

    function itemCount(key) {
        if (key === 'research')  return researchEntries.length;
        if (key === 'essays')    return essayEntries.length;
        if (key === 'library')   return books.length;
        if (key === 'tinkering') return mathArtEntries.length + tinkerEntries.length;
        return 0;
    }

    function swapPageContent(key, fromNav) {
        if (!pages[key]) key = 'research';
        if (key === currentKey && !fromNav) return;

        if (currentKey === 'tinkering') {
            Object.keys(activeSketch).forEach(slug => { activeSketch[slug].stop(); delete activeSketch[slug]; });
            const el = $('page-tinkering');
            if (el) el.querySelectorAll('[data-expandable].open').forEach(closeEntry);
        }
        if (key !== 'puzzle') stopRevelation();

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const ap = $('page-' + key);
        if (ap) ap.classList.add('active');

        nav.querySelectorAll('a').forEach(a => {
            const m = a.dataset.page === key;
            a.classList.toggle('active', m);
            m ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
        });

        winTitleEl.textContent = pages[key].winTitle;
        document.title         = pages[key].winTitle;
        statusLeft.textContent = pages[key].label;
        const n = itemCount(key);
        statusRight.textContent = n > 0 ? `${n} item${n > 1 ? 's' : ''}` : 'ready';
        if (bodyEl) bodyEl.scrollTop = 0;
        startTypewriter(pages[key].words);
        currentKey = key;
        if (!fromNav) history.replaceState(null, '', '#' + key);
        if (key === 'puzzle') { const c = $('svdCanvas'); if (c) ensureObserver(c); }
        else disconnectObserver();
    }

    function transitionToPage(key) {
        if (isTransitioning) return;
        isTransitioning = true;
        playCrtPop();
        if (crtScreen) {
            crtScreen.classList.add('crt-shutdown');
            setTimeout(() => {
                swapPageContent(key, true);
                crtScreen.classList.remove('crt-shutdown');
                crtScreen.classList.add('crt-startup');
                setTimeout(() => { crtScreen.classList.remove('crt-startup'); isTransitioning = false; }, 400);
            }, 70);
        } else {
            swapPageContent(key, true); isTransitioning = false;
        }
    }

    // ── project page transition ───────────────────────────────────────────────
    function transitionToProject(slug) {
        if (isTransitioning) return;
        isTransitioning = true;
        playCrtPop();
        if (crtScreen) {
            crtScreen.classList.add('crt-shutdown');
            setTimeout(() => {
                renderProject(slug);
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                const ap = $('page-project');
                if (ap) ap.classList.add('active');
                nav.querySelectorAll('a').forEach(a => {
                    const m = a.dataset.page === 'research';
                    a.classList.toggle('active', m);
                    m ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
                });
                const entry = researchEntries.find(e => e.slug === slug);
                const shortName = entry ? entry.shortTitle : slug;
                winTitleEl.textContent = `nah.hannan — ${shortName}`;
                document.title         = `nah.hannan — ${shortName}`;
                statusLeft.textContent = 'research';
                statusRight.textContent = entry ? entry.tag : 'project';
                if (bodyEl) bodyEl.scrollTop = 0;
                startTypewriter(pages.project.words);
                currentKey = 'project';
                history.replaceState(null, '', '#research');
                crtScreen.classList.remove('crt-shutdown');
                crtScreen.classList.add('crt-startup');
                setTimeout(() => { crtScreen.classList.remove('crt-startup'); isTransitioning = false; }, 400);
            }, 70);
        } else {
            renderProject(slug);
            isTransitioning = false;
        }
    }

    nav.addEventListener('click', e => {
        const a = e.target.closest('a[data-page]');
        if (!a) return;
        e.preventDefault();
        transitionToPage(a.dataset.page);
    });

    window.addEventListener('hashchange', () => {
        const k = location.hash.replace('#', '');
        if (k && k !== currentKey && pages[k]) transitionToPage(k);
    });

    // ── glitch button ─────────────────────────────────────────────────────────
    const glitchBtn = $('glitch');
    function moveGlitch() {
        if (!glitchBtn || !glitchBtn.isConnected || puzzleSolved) return;
        const pad = 28, maxX = Math.max(0, window.innerWidth - 76), maxY = Math.max(0, window.innerHeight - 76);
        glitchBtn.style.left = Math.min(pad + Math.random() * maxX, maxX) + 'px';
        glitchBtn.style.top  = Math.min(pad + Math.random() * maxY, maxY) + 'px';
    }
    if (glitchBtn) {
        if (puzzleSolved) { glitchBtn.remove(); }
        else {
            (function scheduleGlitch() {
                moveGlitch();
                glitchInterval = setTimeout(scheduleGlitch, 3200 + Math.random() * 6400);
            })();
            window.addEventListener('resize', moveGlitch);
            glitchBtn.addEventListener('click', () => transitionToPage('puzzle'));
        }
    }

    // ── clock ─────────────────────────────────────────────────────────────────
    function tickClock() {
        const d = new Date(), h12 = ((d.getHours() + 11) % 12) + 1;
        clockEl.textContent = `${h12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
    }
    tickClock();
    setInterval(tickClock, 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tickClock(); });

    // ── initial render ────────────────────────────────────────────────────────
    renderResearch();
    renderFeed('essays', essayEntries);
    renderLibrary();
    renderTinkering();
    renderPuzzle();

    const initial = location.hash.replace('#', '') || 'research';
    swapPageContent(initial);
})();
