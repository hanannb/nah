// ── CONTENT DATA ─────────────────────────────────────────────────────────────

// ── essays ──────────────────────────────────────────────────────────────────
const essayEntries = [
    { date: '2026-05-28', title: 'why tail risk is hard to model',           subtitle: 'and what that means for decision-making',       tag: 'risk',     readTime: '11 min', lede: 'the events we want models for are exactly the events models are worst at.' },
    { date: '2026-05-12', title: 'the geometry of learning',                 subtitle: 'why hyperbolic space keeps appearing in ML',     tag: 'math',     readTime: '9 min',  lede: 'euclidean space is not a neutral choice. it has a shape, and that shape has consequences.' },
    { date: '2026-04-20', title: 'what generative art taught me about probability',                                                       tag: 'systems',  readTime: '8 min',  lede: 'the phyllotaxis sketch was the most useful thing i did for my understanding of distributions.' },
    { date: '2026-04-05', title: "on the difficulty of measuring what you can't see", subtitle: 'latent variables and economic inference', tag: 'stats',    readTime: '10 min', lede: "the most economically interesting quantities are often the ones you can't directly observe." },
    { date: '2026-03-18', title: 'overfitting as an epistemological problem', subtitle: 'not just a statistical one',                    tag: 'ml',       readTime: '7 min',  lede: "the real problem with overfitting is not that your model fits the training data too well. it's that you trusted it." },
    { date: '2026-03-01', title: 'macro signals and model uncertainty',       subtitle: 'how ML struggles with non-stationary economies', tag: 'macro',    readTime: '12 min', lede: 'the economy changes the rules as you play. standard ML frameworks were not built for this.' },
];

// ── research ────────────────────────────────────────────────────────────────
const researchEntries = [
    {
        date: 'thesis',
        shortTitle: 'thesis',
        title: 'Bayesian Uncertainty and the Business Cycle: Posterior Sensitivity to Macroeconomic Risk in a SHAP-Augmented Hierarchical Asset Pricing Model',
        desc: 'Hierarchical Bayesian asset pricing model with SHAP attribution of posterior sensitivity to macroeconomic risk — inflation regimes, yield curve dynamics, credit spreads — across business cycle phases.',
        tag: 'wip',
        tags: ['Bayesian', 'SHAP', 'asset pricing', 'macro', 'hierarchical'],
        slug: 'thesis',
        detail: {
            stack: null,
            paragraphs: [
                'Core question: how does the posterior distribution of risk factor loadings shift across business cycle phases? The model pools information across assets in a hierarchical prior, then uses SHAP values to attribute posterior sensitivity — specifically the shift between prior mean and posterior mean — to individual macroeconomic covariates.',
                'SHAP in a Bayesian context: treating the posterior mean as the "model output", SHAP values decompose the difference between each asset\'s posterior mean and the prior mean into contributions from inflation uncertainty, yield curve shape, credit spreads, and output gap measures. Early results suggest inflation uncertainty is the dominant posterior-shifting variable in stress regimes, outweighing equity-specific factors.',
                'Currently working through the theoretical justification for applying Shapley attribution to posterior expectations, and whether the resulting decomposition satisfies the efficiency and symmetry axioms in the presence of correlated macro factors. The empirical implementation uses PyMC with NUTS sampling and a gradient-boosted SHAP explainer on the posterior predictive surface.',
            ],
        }
    },
    {
        date: '2026-04-01',
        shortTitle: 'DeepRGARCH',
        title: 'Hybrid GARCH–LSTM Volatility Model with Bayesian Uncertainty Quantification',
        desc: 'Volatility forecasting combining EGARCH(1,1) structural variance with an LSTM correction for residual dynamics. Three Bayesian UQ schemes. Kupiec and Christoffersen VaR backtests across COVID crash, 2022 Fed tightening, and April 2025 tariff shock.',
        tag: 'done',
        tags: ['Python', 'PyTorch', 'EGARCH', 'statsmodels', 'VaR', 'SPY'],
        slug: 'garch-lstm',
        detail: {
            stack: 'Python · PyTorch · statsmodels · arch · yfinance',
            code:
`log σ²_t = ω + β log σ²_{t-1} + γ log ε²_{t-1} + δ · f_θ(z_{t-p:t-1})
r_t = σ_t z_t,   z_t ~ t(ν),   ν̂ ≈ 5.9

EGARCH (Nelson 1991): β = 0.957  — no IGARCH problem (α+β≈1)
UQ variants: Deep Ensemble · MC Dropout · Bayes-by-Backprop
Train: 2015–2019 (1,257 days, pre-COVID)
Test:  2020–2025 (1,506 days — COVID, 2022 Fed shock, 2025 tariff shock)`,
            paragraphs: [
                'EGARCH provides the structural variance backbone. The LSTM f_θ produces a time-varying additive correction on the log-scale, modelling nonlinear residual structure GARCH misses: leverage asymmetry, post-shock persistence heterogeneity, multi-scale dynamics.',
                'HAR-RV outperforms on 1-day QLIKE over the full test. DeepRGARCH is well-calibrated in calm regimes (2021 QLIKE 1.697 vs HAR 1.029) and systematically undercalibrated in stress — COVID 95% coverage drops to 22%. Kupiec unconditional coverage tests fail in every stress regime; Christoffersen CC passes everywhere. This means breaches are too frequent but not temporally clustered. Failure mode: level mis-specification under sudden regime shift, not bad dynamics. HAR adapts through its realised variance inputs; GARCH-family models conditioned on pre-COVID parameters cannot bridge a COVID-scale level-shift without online re-estimation.',
                'Central null result: CRPS spread across all four UQ variants is <1% — Bayesian uncertainty over LSTM weights cannot correct a level-shift problem. Reported in full because it is the honest finding.',
            ],
            github: 'https://github.com/hannan-n/hybrid-garch-lstm',
        }
    },
    {
        date: '2025-11-05',
        shortTitle: 'autodiff',
        title: 'Higher-Order Automatic Differentiation in Pure Python',
        desc: 'Scalar autodiff engine with two backends: reverse-mode for first-order gradients, Taylor-mode for exact second and third order derivatives. 40 tests, no dependencies.',
        tag: 'done',
        tags: ['Python', 'reverse-mode', 'Taylor-mode', 'backprop'],
        slug: 'autodiff',
        detail: {
            stack: 'Python 3.10+, no dependencies',
            code:
`# reverse-mode (first order)
grad(lambda x: x**3, 2.0)                          # → 12.0

# Taylor-mode (higher order, exact — single forward pass)
higher_order_grad(lambda x: x**3, 2.0, order=2)    # → 12.0
higher_order_grad(lambda x: x**3, 2.0, order=3)    # →  6.0
all_derivatives(lambda x: x.sin(), 0.0)             # → (0.0, 1.0, 0.0, −1.0)`,
            paragraphs: [
                'Two complementary backends. Reverse-mode: each Value node stores its primal, a gradient accumulator, and a VJP closure. Forward pass builds a DAG dynamically; .backward() does a topological sort then traverses in reverse accumulating via the chain rule. Gradient accumulation uses += — the invariant that makes shared (diamond-shaped) subgraphs correct.',
                'Taylor-mode (Griewank & Walther 2008, Ch. 3): a TaylorDual3 number represents a scalar as x(t) = v[0] + v[1]·t + v[2]·t²/2! + v[3]·t³/3!. Seed with x = TaylorDual3(x₀, 1.0), evaluate, read y.d1/d2/d3. All results are exact — no numerical differentiation, no approximation. Multiplication uses the Cauchy discrete convolution product truncated at order 3. Division uses the Cauchy series inversion recurrence.',
                'Why Taylor-mode over reverse-over-reverse for higher orders? Differentiating the backward pass requires a meta-tape — architecturally sound (how JAX implements jacrev(jacrev(f))) but substantially more complex. For a scalar engine making the mathematics explicit, a single forward pass with four arithmetic components achieves the same result without the meta-tape overhead.',
            ],
            github: 'https://github.com/hannan-n/autodiff',
        }
    },
    { date: '2026-05-01', title: 'bounds on predictability in bayesian deep learning — working through the cramer-rao floor argument', tag: 'wip' },
    { date: '2026-04-15', title: 'argentina sovereign credit — tail scenarios and refinancing risk', tag: 'ongoing' },
    { date: '2026-03-20', title: 'covered interest parity deviations and short-term FX forecasting with ARIMA', tag: 'done' },
    { date: '2026-02-28', title: 'real estate equity thesis — rate sensitivity, factor decomposition, DCF', tag: 'done' },
    { date: '2026-01-10', title: 'gaussian processes for volatility surfaces — early exploration, not much yet', tag: 'notes' },
];

// ── tinkering: math art ─────────────────────────────────────────────────────
const mathArtEntries = [
    {
        label: 'flow',
        title: 'sine flow field — layered waves driving a particle system',
        tag: 'canvas',
        slug: 'flow-field',
        detail: {
            paragraphs: [
                'A vector field defined by nested sine and cosine functions. Particles follow the field, leaving short trails that fade. The patterns sit somewhere between laminar flow and a chaotic dynamical system — globally organised, locally unpredictable.',
                'θ(x,y) = sin(x·f₁ + sin(y·f₂)) · 2π + cos(y·f₃). Three frequency parameters modulate slowly over time, shifting the topology of the attractors.',
            ]
        }
    },
    {
        label: 'tiling',
        title: 'truchet tiling — random arcs, unexpected global curves',
        tag: 'canvas',
        slug: 'truchet',
        detail: {
            paragraphs: [
                'Each cell of a grid contains one of two quarter-circle arc configurations. Truchet (1704) noted that random placement produces surprisingly coherent large-scale patterns — labyrinthine curves the eye follows as if they were intentional. Every few seconds a handful of tiles flip and the global topology changes discontinuously.',
                "Related to Escher's periodic tilings in spirit: local rules generating unexpected global structure. Unlike Escher, there is no underlying symmetry — the order is entirely emergent.",
            ]
        }
    },
    {
        label: 'series',
        title: 'fourier epicycles — rotating circles tracing a closed curve',
        tag: 'canvas',
        slug: 'epicycles',
        detail: {
            paragraphs: [
                'Any closed curve can be written as a sum of rotating circles. The DFT of sampled path coordinates gives the radii and phases. Feed those coefficients into nested circles rotating at integer multiples of a base frequency and they trace the original curve. The target here is a lemniscate (Bernoulli\'s ∞).',
                "In 1807 Fourier was using this machinery for heat conduction with no visual interpretation in mind. The rotating-circles picture came much later. It is one of the clearest ways to understand why frequency-domain representations exist: you're not changing the shape, just choosing a different basis.",
            ]
        }
    },
    {
        label: 'growth',
        title: 'phyllotaxis spiral — golden angle seed arrangement',
        tag: 'canvas',
        slug: 'phyllotaxis',
        detail: {
            paragraphs: [
                'N seeds placed at radius r = √i and angle θ = i · φ_angle, where φ_angle = π(3 − √5) ≈ 137.508° — the golden angle. No two seeds share a spoke. The result is the optimal packing of a growing disk: maximum exposure, minimum overlap.',
                'This is the arrangement found in sunflower heads, pinecone scales, and leaf spirals. The golden angle is irrational in a specific sense: it is the hardest number to approximate by rationals, which is exactly why no two seeds ever align.',
            ]
        }
    },
];

// ── tinkering: p5 generative art ────────────────────────────────────────────
const p5ArtEntries = [
    {
        label: 'cabinet',
        title: 'Torpid Cabinet — golden ratio infinite zoom',
        desc: 'φ-scaled rings of 32 rotating squares morph continuously between circle and square topology. Fractional zoom resets perfectly at every cycle — Escher depth without a seam.',
        slug: 'torpid-cabinet',
        featured: true,
    },
    {
        label: 'woven',
        title: 'Woven Field — scalar field φ drives grid rotation',
        desc: 'φ = sin·cos superposition sets per-cell orientation and size across a 45×45 lattice. A roaming observer attenuates brightness by distance, pulling the field into relief.',
        slug: 'woven-field',
    },
    {
        label: 'hyperbolic',
        title: 'Hyperbolic Weave — Poincaré disk rings',
        desc: 'Ring radii follow rₖ = tan(k·0.25). A Möbius addition (Poincaré translation) continuously orbits the pattern through hyperbolic space. Square size ∝ sech(r).',
        slug: 'hyperbolic-weave',
    },
    {
        label: 'dipole',
        title: 'Vortex Dipole — two counter-rotating vortices',
        desc: 'Point vortices Γ = ±1 orbit each other. Each grid node rotates by the sum of induced velocities — strength·atan2(Δy,Δx)/dist — producing a living dipole field.',
        slug: 'vortex-dipole',
    },
    {
        label: 'bloom',
        title: 'Phyllotaxis Bloom — Fibonacci veins and petals',
        desc: '945 golden-angle seeds (φ ≈ 137.5°) stitched along Fibonacci spirals n±8 and n±13. Wave torsion breathes the seeds; petal ellipses emerge past the 55th percentile.',
        slug: 'phyllotaxis-bloom',
    },
];

// ── tinkering: builds ───────────────────────────────────────────────────────
const tinkerEntries = [
    { label: 'vis', title: 'interactive SVD explorer — singular values, rank, condition number, unit circle transform', tag: 'done' },
    { label: 'sim', title: 'agent-based market simulation — 100 trading agents, 50 assets, emergent order book dynamics', tag: 'done' },
];

// ── books ───────────────────────────────────────────────────────────────────
const books = [
    { title: 'Probability Theory: The Logic of Science', author: 'E.T. Jaynes', cat: 'Probability & Statistics', thoughts: 'Changed how I think about what probability actually means. Probability as a measure of uncertainty rather than a frequency of events. Still working through the later chapters.' },
    { title: 'Bayesian Data Analysis', author: 'Gelman et al.', cat: 'Probability & Statistics', thoughts: 'The book I open when I need to actually compute something. Jaynes gave me the framing; this gives me the tools.' },
    { title: 'Statistical Rethinking', author: 'Richard McElreath', cat: 'Probability & Statistics', thoughts: 'The most readable stats book I have found. The causal diagrams chapter changed how I set up problems.' },
    { title: 'All of Statistics', author: 'Larry Wasserman', cat: 'Probability & Statistics', thoughts: 'Dense. Better as a second book than a first.' },
    { title: 'Statistical Inference', author: 'Casella & Berger', cat: 'Probability & Statistics', thoughts: 'Standard grad text. The sufficiency chapters are the ones I go back to.' },
    { title: 'Elements of Information Theory', author: 'Cover & Thomas', cat: 'Probability & Statistics', thoughts: 'Where probability and computation start sharing vocabulary. Most of ML is downstream of these ideas.' },
    { title: 'Probability with Martingales', author: 'David Williams', cat: 'Probability & Statistics', thoughts: 'Short and precise. The footnotes are worth reading.' },
    { title: 'Linear Algebra and Its Applications', author: 'Gilbert Strang', cat: 'Mathematics', thoughts: 'Strang teaches it as geometry first. The SVD chapters are the reason the little interactive thing on this site exists.' },
    { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', cat: 'Mathematics', thoughts: 'Determinants get pushed to the last chapter. By the time you get there you understand why.' },
    { title: 'Principles of Mathematical Analysis', author: 'Walter Rudin', cat: 'Mathematics', thoughts: 'You work through it slowly rather than read it. A lot of analysis clicked afterwards.' },
    { title: 'Numerical Linear Algebra', author: 'Trefethen & Bau', cat: 'Mathematics', thoughts: 'Short, careful, good intuitions about conditioning. I go back to the SVD chapters fairly often.' },
    { title: 'Convex Optimization', author: 'Boyd & Vandenberghe', cat: 'Mathematics', thoughts: 'Useful for spotting when a problem is secretly convex. That is more often than you think.' },
    { title: 'Pattern Recognition and Machine Learning', author: 'Christopher Bishop', cat: 'Machine Learning', thoughts: 'The Bayesian-leaning ML text. Graphical models and variational inference chapters still hold up.' },
    { title: 'The Elements of Statistical Learning', author: 'Hastie, Tibshirani, Friedman', cat: 'Machine Learning', thoughts: 'Better as a second book. More useful after you have actually built a few models.' },
    { title: 'Reinforcement Learning: An Introduction', author: 'Sutton & Barto', cat: 'Machine Learning', thoughts: 'They have been refining this since 1998 and you can feel it. The TD-learning chapters are the ones I re-read.' },
    { title: 'Gaussian Processes for Machine Learning', author: 'Rasmussen & Williams', cat: 'Machine Learning', thoughts: 'The GP book. Elegant and practical. The covariance function chapters are quietly excellent.' },
    { title: 'Understanding Deep Learning', author: 'Simon Prince', cat: 'Machine Learning', thoughts: 'A 2023 book that already feels like the right one to start with. Probabilistic eye throughout.' },
    { title: 'Options, Futures, and Other Derivatives', author: 'John C. Hull', cat: 'Finance', thoughts: 'The standard reference. Methodical. Does not oversimplify.' },
    { title: 'Stochastic Calculus for Finance', author: 'Steven Shreve', cat: 'Finance', thoughts: 'Two volumes. The discrete-time first volume is the one to start with.' },
    { title: 'The Black Swan', author: 'Nassim Nicholas Taleb', cat: 'Finance', thoughts: 'The core point — rare events do most of the work — matters more than the presentation sometimes suggests.' },
    { title: 'Antifragile', author: 'Nassim Nicholas Taleb', cat: 'Finance', thoughts: 'Some systems get stronger under volatility. Useful framing even when you set the rest aside.' },
    { title: 'Against the Gods', author: 'Peter Bernstein', cat: 'Finance', thoughts: 'A history of how we learned to quantify uncertainty. Pascal through Markowitz, told as a story.' },
    { title: 'The Signal and the Noise', author: 'Nate Silver', cat: 'Finance', thoughts: 'The case studies are where the Bayesian thinking actually shows up. More useful than the frame suggests.' },
    { title: 'Thinking in Systems', author: 'Donella Meadows', cat: 'Systems', thoughts: 'The clearest short book about why well-intentioned fixes often do not work.' },
    { title: 'The Mythical Man-Month', author: 'Fred Brooks', cat: 'Systems', thoughts: 'Written in 1975 about OS/360 and still basically accurate about software.' },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', cat: 'Systems', thoughts: 'Most database choices are consistency-versus-availability choices in disguise.' },
    { title: 'Structure and Interpretation of Computer Programs', author: 'Abelson & Sussman', cat: 'Software', thoughts: 'Computer science as managing complexity through abstraction.' },
    { title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', cat: 'Software', thoughts: 'Two decades of software lessons. The broken windows metaphor has stuck.' },
    { title: 'A Geometry of Music', author: 'Dmitri Tymoczko', cat: 'Music & Maths', thoughts: 'Chords as points in geometric spaces, voice leading as motion between them. Once it clicks you cannot unsee it.' },
    { title: 'The Structure of Scientific Revolutions', author: 'Thomas Kuhn', cat: 'Philosophy', thoughts: 'Kuhn gave us "paradigm shift" and then spent years explaining that people had taken it wrong. Both halves are interesting.' },
    { title: 'Gödel, Escher, Bach', author: 'Douglas Hofstadter', cat: 'Philosophy', thoughts: 'Self-reference and strange loops. I have read it twice and got something different each time.' },
    { title: 'The Beginning of Infinity', author: 'David Deutsch', cat: 'Philosophy', thoughts: 'Good explanations are creative and hard to vary. I do not buy all of it but the parts I do run deep.' },
];

// ── sign: seeded equations ───────────────────────────────────────────────────
const SEEDED_EQUATIONS = [
    '∫₋∞^∞ e^(−x²) dx = √π',
    'e^(iπ) + 1 = 0',
    'P(H|E) = P(E|H) · P(H) / P(E)',
    'dS = μS dt + σS dW_t',
    '∇ · E = ρ/ε₀',
    'H(X) = −Σ p(x) log p(x)',
    'det(A) = σ₁ · σ₂ · ⋯ · σₙ',
    'Ax = λx',
];

// ── page metadata ────────────────────────────────────────────────────────────
const pages = {
    research:  { label: 'research',  winTitle: 'nah.hannan — research',  words: ['research', 'open questions', 'live work'],              prompt: 'sovereign credit, applied ML, quantitative finance. some ongoing, some done, some barely started.' },
    essays:    { label: 'essays',    winTitle: 'nah.hannan — essays',    words: ['essays', 'longer reads', 'probability', 'geometry'],    prompt: 'six pieces on probability, geometry, markets, and what generative art taught me about all three.' },
    library:   { label: 'library',   winTitle: 'nah.hannan — library',   words: ['library', 'books', 'reading list'],                    prompt: 'books i have read and have something to say about. click to expand.' },
    tinkering: { label: 'tinkering', winTitle: 'nah.hannan — tinkering', words: ['tinkering', 'small builds', 'math art'],               prompt: 'things built to understand how they work. some finished, some not.' },
    sign:      { label: 'sign',      winTitle: 'nah.hannan — sign',      words: ['sign', 'leave something', 'equations welcome'],        prompt: 'leave an equation. it stays.' },
    puzzle:    { label: '▒',         winTitle: 'nah.hannan — singular',  words: ['singular', 'σ₂ = 0', 'rank collapse'],                prompt: 'drag σ₂ to zero.' },
    project:   { label: 'research',  winTitle: 'nah.hannan — research',  words: ['project', 'the details', 'under the hood'],           prompt: '' },
};

const navOrder = ['research', 'essays', 'library', 'tinkering', 'sign'];
