// essays.js
// Six essays for the nah.hannan essays section.
// Each essay has: id, title, date, tags, readTime, lede (one-line tease), body (HTML string)
// Body uses <p>, <h3>, <blockquote>, <code>, <em>, <strong> only — no external deps.

const essayEntries = [

  // ─── 1 ───────────────────────────────────────────────────────────────────
  {
    id: 'tail-risk',
    title: 'Why tail risk is hard to model',
    subtitle: 'and what that means for decision-making',
    date: '2026-05-28',
    tags: ['risk', 'bayesian', 'econometrics', 'probability'],
    readTime: '11 min',
    lede: 'the events we want models for are exactly the events models are worst at.',
    body: `
<p>There is a familiar frustration in quantitative finance. You build a model. You backtest it. The in-sample statistics look reasonable — the residuals are well-behaved, the likelihood is decent, the coverage is fine. Then something happens in the tail and the whole thing falls over. The 2008 crisis was not a ten-sigma event. It was a two-sigma event in the wrong direction at the wrong time, with correlations that had no business being as high as they were. The models said it was nearly impossible. It happened.</p>

<p>What goes wrong, and why is it so persistent?</p>

<h3>The problem with tails</h3>

<p>The practical answer is data. Extreme events are, by definition, rare. If you're estimating a 99.5th percentile loss from ten years of daily returns, you have roughly five observations in that region. Five observations. You cannot fit a reliable distribution to five data points. Any statistical procedure that claims to give you a precise VaR at the 99.5th percentile is doing something that looks like inference but mostly isn't.</p>

<p>The deeper answer is that tail risk isn't just an estimation problem — it's a model-selection problem. The parametric distributions we use (normal, t-distribution, even many copulas) have tails that decay in specific, relatively well-behaved ways. Real financial returns don't. They have fat tails, yes, but more importantly, the fat-tail structure changes over time. The tail behaviour in a calm market is not the tail behaviour in a stressed market. The whole distributional shape shifts.</p>

<p>This is the core difficulty: the events we want models for are exactly the events where our models' assumptions break down most severely.</p>

<h3>Expected Shortfall vs VaR — a smaller improvement than it looks</h3>

<p>The regulatory shift from Value-at-Risk to Expected Shortfall (ES) under Basel III was sold partly as a fix for tail insensitivity. VaR at the 99th percentile tells you where the 1% boundary is, but says nothing about what happens beyond it. ES averages the losses in the tail, which at least incorporates some information about tail shape. That's real.</p>

<p>But the estimation problem doesn't go away. If anything, ES is harder to estimate accurately than VaR. VaR is a quantile — a single point. ES is a conditional expectation over a region of the distribution that, again, you have almost no data about. The theoretical improvement is meaningful; the practical improvement is smaller than the theory suggests because you've traded a poorly estimated number for a differently poorly estimated number.</p>

<p>There's also the question of backtesting. VaR violations are observable — you either exceed the threshold or you don't. ES violations require knowing the full distribution of losses in the tail, which you observe only slowly over time. The improved theoretical coherence of ES comes with worse empirical testability.</p>

<h3>What Bayesian approaches actually help with</h3>

<p>I've been spending time on Bayesian hierarchical models for tail-risk estimation, and the honest answer is that Bayesian methods don't solve the fundamental data scarcity problem. They help with it in specific ways.</p>

<p>The main thing they give you is a principled way to encode prior beliefs and have those beliefs updated by data. In a tail estimation context, this matters because you often do have some structural beliefs — about the typical range of fat-tail behaviour in financial markets, about how volatility clustering affects extreme returns, about how cross-asset correlations behave in stress conditions. Classical methods force you to either ignore that information or incorporate it in ad-hoc ways. Bayesian methods let you put it in the prior and reason explicitly about how much the data should update it.</p>

<p>The second thing is uncertainty quantification. A classical point estimate of a 99.5th percentile loss doesn't tell you how uncertain that estimate is. A Bayesian posterior does. The posterior distribution over the loss quantile directly represents how much you don't know. In a decision-making context — say, allocating capital against a risk position — knowing the uncertainty matters as much as knowing the central estimate. The width of the posterior says something about whether you're in a regime where the model is trustworthy.</p>

<p>The third thing, and the one I find most useful, is that Bayesian frameworks naturally accommodate regime-switching and structural instability through hierarchical priors. If you believe the market can be in different volatility regimes, you can put a prior on the regime process and let the data update that too. It's not a complete solution, but it's a more honest representation of the uncertainty than pretending the data is generated by a single stable process.</p>

<h3>The decision-making side</h3>

<p>Here's what I think gets lost in purely statistical treatments of tail risk: the question of what you're supposed to do with the estimate.</p>

<p>In practice, tail risk estimates feed into capital allocation, position sizing, and limit-setting. These are decisions under uncertainty. The decision problem and the estimation problem are coupled — the utility function for being wrong in different ways matters as much as the accuracy of the central estimate. A very precise estimate of a not-quite-relevant quantity can be worse than a diffuse estimate of the right quantity.</p>

<p>The expected utility framework is the right theoretical tool here, but it requires specifying a loss function over outcomes, which quantitative analysts rarely do explicitly. The implicit loss function — in most risk models — is something like mean-squared-error on the loss distribution, which is almost certainly not what the institution actually cares about. They care about surviving tail events. Those two objective functions point in different directions.</p>

<p>I don't have a complete answer to this. I think the honest position is: tail risk is genuinely hard to model, the methods we have are imperfect in known ways, and the right response is not to pretend the imperfections don't exist but to build them into how we use the models. That means wider confidence intervals than you might like, more stress testing relative to statistical VaR, and explicit acknowledgment that the model breaks in exactly the regime where you need it most.</p>

<p>It's unsatisfying. But it's probably closer to true.</p>
    `
  },

  // ─── 2 ───────────────────────────────────────────────────────────────────
  {
    id: 'hyperbolic-geometry-ml',
    title: 'The geometry of learning',
    subtitle: 'why hyperbolic space keeps appearing in ML',
    date: '2026-05-12',
    tags: ['geometry', 'machine learning', 'embeddings', 'math'],
    readTime: '9 min',
    lede: 'euclidean space is not a neutral choice. it has a shape, and that shape has consequences.',
    body: `
<p>When I was building the Poincaré disk sketch for the tinkering section — the one where geodesics wrap around a bounded disk and straight lines curve near the boundary — I kept running into the same thought: this is how some embedding models actually behave. Not metaphorically. Literally. There are models that learn representations in hyperbolic space instead of Euclidean space, and the reason they do has something interesting to say about what kind of structure data actually has.</p>

<p>The short version: a lot of natural data has hierarchical structure, and hyperbolic space is much better at representing hierarchies than Euclidean space is.</p>

<h3>The volume problem</h3>

<p>In Euclidean space, the volume of a ball of radius <em>r</em> grows as <em>r<sup>d</sup></em>, where <em>d</em> is the dimension. Double the radius, the volume grows by 2<sup>d</sup>. This is fine for many purposes, but it creates a problem when you're trying to embed tree-structured data.</p>

<p>In a tree, the number of nodes at depth <em>k</em> from the root grows exponentially — roughly as <em>b<sup>k</sup></em> for a branching factor <em>b</em>. To embed all those nodes such that distances in the embedding respect distances in the tree, you need the available space to grow at least as fast. In Euclidean space, it doesn't — the volume grows polynomially in the radius, but the number of nodes you need to fit grows exponentially in the depth. So either the embeddings distort the tree structure, or you need very high dimensionality.</p>

<p>Hyperbolic space doesn't have this problem. In hyperbolic geometry, the volume of a ball of radius <em>r</em> grows exponentially in <em>r</em>. This matches the exponential growth of trees exactly. You can embed tree structures with very low distortion in even two-dimensional hyperbolic space — something that requires much higher-dimensional Euclidean embeddings to approximate.</p>

<h3>The Poincaré disk</h3>

<p>The Poincaré disk is one of several models of hyperbolic geometry. You take the open unit disk — the interior of a circle of radius 1 — and you define distances differently from Euclidean distance. Points near the boundary are, in hyperbolic terms, very far from the center. The boundary itself is at infinite distance. Geodesics (the analogues of straight lines) appear as circular arcs that are perpendicular to the boundary.</p>

<p>When I render the disk, the visual impression is that space seems to "compress" near the boundary. That's not quite right — in hyperbolic terms, there's the same amount of space everywhere. What you're seeing is that the Euclidean projection used to draw the disk is distorting the hyperbolic distances. The geodesics look curved because we're viewing a curved space through a flat lens.</p>

<p>This is the same reason a map of the Earth distorts areas near the poles. Any projection of a curved surface onto a flat one introduces distortions somewhere. The Poincaré disk model puts all the distortion at the boundary, which makes it visually tractable even if geometrically misleading.</p>

<h3>Poincaré embeddings</h3>

<p>Nickel and Kiela's 2017 paper introduced the idea of learning embeddings in hyperbolic space for hierarchical data — specifically, in the Poincaré disk. The idea is simple: instead of learning a mapping from entities to points in <em>R<sup>n</sup></em>, you learn a mapping to points in the Poincaré disk, with the distance metric defined by the disk's hyperbolic geometry rather than Euclidean distance.</p>

<p>The results on hierarchical datasets (WordNet hypernymy, for instance) were striking. A two-dimensional Poincaré embedding outperformed a 200-dimensional Euclidean embedding on reconstruction tasks. The geometry of the space did the heavy lifting that dimensionality had been doing before.</p>

<p>There's an intuitive way to see why this works. In the learned embeddings, entities near the root of the hierarchy end up near the center of the disk, and more specific entities end up further out. The hierarchical relationships are encoded geometrically — depth in the hierarchy corresponds to distance from the center. The exponential expansion of hyperbolic space near the boundary gives you room to spread out the specific entities without them crowding together.</p>

<h3>What this suggests more broadly</h3>

<p>The deep lesson I take from this is that the geometry of the representation space is not a neutral choice. Euclidean space has a specific shape — constant zero curvature, polynomial volume growth — and that shape has consequences for what kinds of structure you can represent efficiently. Hyperbolic space has negative curvature and exponential volume growth, which fits hierarchical structure. Other problems might naturally fit other geometries.</p>

<p>There's ongoing work on product spaces that combine Euclidean, hyperbolic, and spherical components to represent datasets with mixed structural types. The sphere is good for cyclic structure. Hyperbolic space for hierarchies. Euclidean for flat, non-hierarchical structure. The question of which geometry fits your data is a real modelling question, not an implementation detail.</p>

<p>Most ML practitioners don't think about this. The default is Euclidean, always, because the tooling is better and the intuitions are more developed. But the Poincaré disk sketch is a daily reminder for me that Euclidean space is not where all the interesting structure lives.</p>
    `
  },

  // ─── 3 ───────────────────────────────────────────────────────────────────
  {
    id: 'generative-art-probability',
    title: 'What generative art taught me about probability',
    date: '2026-04-20',
    tags: ['generative art', 'probability', 'systems', 'math'],
    readTime: '8 min',
    lede: 'the phyllotaxis sketch was the most useful thing i did for my understanding of distributions.',
    body: `
<p>I didn't expect to learn anything about probability from writing p5.js sketches. The two felt separate — the math was for the research work, the generative stuff was for a different kind of thinking, the kind that doesn't produce equations. But the more I built, the more the connection became hard to ignore.</p>

<p>The clearest example was the phyllotaxis sketch — the one that generates the sunflower-like pattern from the golden angle. The input is a single irrational number (the golden ratio), and the output is a pattern that looks designed, like someone carefully planned where each dot goes. Nobody planned it. The structure emerges from a simple rule applied iteratively. What looks like intentional design is just what happens when you exploit the properties of an irrational number.</p>

<p>That's basically what a probability distribution is: a rule that generates structure you didn't specify directly.</p>

<h3>Distributions as generative processes</h3>

<p>There's a pedagogical tradition in statistics that treats distributions as descriptions of data — you observe some numbers, you fit a distribution, the distribution summarises what you saw. This is fine, but it obscures something important about what distributions actually are.</p>

<p>A more useful framing is: a distribution is a generative process. It's a rule for producing data. A normal distribution is not primarily a bell curve you draw; it's a process that says "draw a value from this family of processes and it'll tend to cluster around a mean with this spread." The bell curve is the shape of the output, not the thing itself.</p>

<p>This framing matters when you're trying to build models that explain data. You're not looking for the distribution that best describes what you observed; you're looking for the generative process that could plausibly have produced what you observed. Those are related but different questions. The first is about summarisation. The second is about inference.</p>

<h3>The scalar field sketch and local structure</h3>

<p>The Woven Field sketch — the one with the grid of vectors that align to an underlying scalar field — helped me think more concretely about what "local structure" means in probabilistic models.</p>

<p>In that sketch, each point in the grid has a vector that points in the direction of the gradient of a hidden scalar function. The vectors form a coherent pattern — smooth regions, some turbulence near saddle points — because they're all derived from the same underlying field. If you only saw one vector, you'd learn almost nothing. If you see the pattern across many vectors, you can infer the shape of the field.</p>

<p>This is exactly what Gaussian processes do. A GP puts a prior over functions rather than parameters, and the covariance structure — the kernel — encodes assumptions about the local smoothness of the function. If you assume a squared-exponential kernel, you're saying you believe the function varies smoothly and nearby points should have correlated values. The GP posterior is the field inferred from the observations you've made.</p>

<p>When I look at the woven field sketch, I'm looking at a sample from something like a GP prior. The visual pattern is the spatial correlation structure. Most people find GP covariance kernels abstract; drawing their implications is more illuminating.</p>

<h3>The golden ratio and uniform distribution</h3>

<p>The phyllotaxis pattern comes from placing the <em>n</em>-th point at angle <em>n × 2π / φ<sup>2</sup></em> from the center, where <em>φ</em> is the golden ratio. The golden ratio is the "most irrational" number in the sense that it's the hardest to approximate with a rational number — its continued fraction expansion is all 1s, which is the slowest-converging case. This property means that the sequence of angles <em>n × 2π / φ<sup>2</sup></em> covers the circle more uniformly than any rational multiple of 2π would.</p>

<p>This is directly connected to the concept of low-discrepancy sequences in quasi-Monte Carlo methods. The goal in Monte Carlo integration is to sample from a distribution in a way that covers the space efficiently. Pseudo-random sampling does this in expectation, but for any finite sample, you get clustering and gaps. Low-discrepancy sequences, like the Halton sequence or Sobol sequences, fill the space more uniformly at any fixed sample size.</p>

<p>The sunflower is doing a version of this for the circle. The seeds are arranged so that no region of the head is over- or underrepresented. The aesthetic effect — the visual impression of balance and fullness — is the same effect that makes low-discrepancy sampling better than random sampling for numerical integration.</p>

<h3>The honest conclusion</h3>

<p>I'm not claiming that building generative art is a research method. But I do think there's something real about the way that working with visual generative systems forces you to be concrete about what you mean when you describe a probabilistic model. You can't hand-wave about "the distribution of outputs" when you have to actually write the line of code that generates the output. The mathematical abstraction collapses into something you can see, which sometimes reveals that you understood the abstraction less well than you thought.</p>

<p>The phyllotaxis sketch didn't teach me new mathematics. It made me understand the mathematics I already knew in a different way. I'm not sure that distinction matters, but it feels like it does.</p>
    `
  },

  // ─── 4 ───────────────────────────────────────────────────────────────────
  {
    id: 'latent-variables-inference',
    title: 'On the difficulty of measuring what you can\'t see',
    subtitle: 'latent variables and economic inference',
    date: '2026-04-05',
    tags: ['econometrics', 'latent variables', 'bayesian', 'inference'],
    readTime: '10 min',
    lede: 'the most economically interesting quantities are often the ones you can\'t directly observe.',
    body: `
<p>A recurring embarrassment in my early exposure to econometrics was discovering how many of the quantities I was trying to estimate didn't actually exist as observable things. GDP is a noisy aggregate of millions of transactions, many of them estimated. Inflation is a weighted average of price changes, and the weights are contested. "Consumer confidence" is an index derived from survey responses that are themselves ambiguous. The thing I was building a model for was not a thing in the data — it was a construction, built from proxies, for something that I was assuming existed in a conceptually stable way.</p>

<p>Latent variable models are one way of being more explicit about this. Instead of pretending your index is what it claims to be, you build a model that says: there is some underlying state of the world (the latent variable) that generates the observable signals you actually have access to. Inference is the process of working backwards from the signals to beliefs about the state.</p>

<h3>The simple version: factor models</h3>

<p>The most widely used latent variable framework in economics and finance is factor models. The idea is that a large number of observable variables (say, returns on many assets) are all driven by a small number of unobservable common factors, plus idiosyncratic noise. The factors are the latent variables.</p>

<p>Factor analysis, PCA, and their cousins are methods for extracting these latent factors from data. They work well when the assumption is approximately true — when there really are a small number of underlying drivers and the observable variables are noisy measurements of them. They work less well when the structure is more complex: when factors interact nonlinearly, when the number of factors changes over time, or when the "noise" isn't actually independent across variables.</p>

<p>The hidden assumption in most factor models is stationarity: the factors are stable over time, or at least their relationship to the observable variables is. This is often false in economic data, and the failure mode is severe. A factor that explains 40% of variance during normal periods may explain nothing during a crisis, and a new factor (say, "flight to safety" behaviour) may emerge that wasn't present in the training data at all.</p>

<h3>The Kalman filter as Bayesian inference</h3>

<p>A more dynamic approach to latent states is state-space modelling, with the Kalman filter as the classic inference algorithm. The setup is: there is a hidden state that evolves over time according to some transition dynamics, and at each time step you observe a noisy measurement of that state. The Kalman filter computes, at each time step, the posterior distribution over the current state given all observations so far.</p>

<p>What I find useful about this framing is that it makes explicit what you're doing when you "estimate" something like output gap or the neutral interest rate. You're not measuring a thing. You're computing a posterior distribution over a latent quantity, given a prior about its dynamics and a model relating it to observable variables. The estimate is only as good as your transition model and your measurement model.</p>

<p>When economists debate the value of the neutral interest rate and get estimates ranging from 0% to 3%, they're not all measuring the same thing with different instruments. They're computing posteriors under different model assumptions. The disagreement is about the prior and the model, not about the data. This is a philosophically different kind of disagreement from "we have different data."</p>

<h3>Identifiability</h3>

<p>The deeper problem with latent variable models is identifiability. In many model specifications, there are multiple (sometimes infinitely many) combinations of latent variable values that are equally consistent with the data. You can rotate a factor model's loadings and get equally good fit. You can rescale a latent variable and compensate in the measurement model. You can shift the mean of a latent variable and shift the intercept of the measurement equation to compensate.</p>

<p>These are not small technical problems. They mean that the latent variable you've defined doesn't have a unique meaning — the model is fitting something to data, but "something" includes many different latent structures that are observationally indistinguishable. Identification constraints (fixing certain loadings, setting variances to 1, choosing normalisation conditions) impose a particular rotation on the solution, but that rotation is a modeller's choice, not a property of the data.</p>

<p>Bayesian approaches help here because the prior on the latent variable can encode the normalisation and identification constraints you care about. But they don't resolve the fundamental problem: you're estimating a quantity that doesn't uniquely exist, and your estimate reflects your assumptions at least as much as it reflects the data.</p>

<h3>What this means for economic inference</h3>

<p>I spent a while being bothered by this and then gradually came to a more settled view, which is roughly: the fact that a quantity is latent doesn't make it meaningless. It makes it a modelling construct whose usefulness depends on whether the model captures enough of the real data-generating process to be useful for your purpose.</p>

<p>"Natural unemployment" isn't a platonic fact about the economy that we're trying to measure imprecisely. It's a modelling concept that, if defined carefully enough and instantiated in a model that fits the data well, gives you a useful reference point for thinking about labour market slack. The estimate is useful for the purpose, or it isn't. That's the real criterion.</p>

<p>This is not satisfying if you want inference to be about finding truth. But I think it's the right way to think about what macroeconomic inference actually is. You're building a model of a complex, non-stationary system, identifying latent structure in it, and using that structure to make predictions or inform decisions. The latent variables are tools, not discoveries.</p>

<p>Getting comfortable with that took me longer than I expected.</p>
    `
  },

  // ─── 5 ───────────────────────────────────────────────────────────────────
  {
    id: 'overfitting-epistemology',
    title: 'Overfitting as an epistemological problem',
    subtitle: 'not just a statistical one',
    date: '2026-03-18',
    tags: ['machine learning', 'epistemology', 'overfitting', 'inference'],
    readTime: '7 min',
    lede: 'the real problem with overfitting is not that your model fits the training data too well. it\'s that you trusted it.',
    body: `
<p>The standard framing of overfitting is statistical: your model has too many parameters relative to the data, so it fits noise in the training set rather than signal, and it generalises poorly to new data. The fix is regularisation, cross-validation, early stopping — procedures that prevent the model from memorising the training data too precisely.</p>

<p>This framing is correct and useful. But I think it undersells what overfitting is actually doing to your epistemological situation, which is: it's giving you confident wrong beliefs about the world.</p>

<h3>What a model believes</h3>

<p>A fitted model encodes beliefs about how the world works. A linear regression with specific coefficients is saying: I believe that for every unit increase in X, the expected value of Y increases by this amount, holding other things fixed. A neural network with specific weights is saying something more complex, but it's still saying something — it has a specific functional relationship baked into its weights.</p>

<p>An overfitted model has beliefs that are confidently wrong. Not just imprecise, but systematically biased toward patterns that don't generalise. The model has learned the noise in the training data as if it were signal. Its beliefs are shaped by artefacts of the particular sample it saw, not by the underlying process.</p>

<p>What makes this an epistemological problem is the confidence. An overfitted model doesn't just give wrong predictions — it gives wrong predictions with high confidence. The training error is low, so the model looks good by internal standards. The model has no signal to alert it that its beliefs are unreliable. The failure is invisible from the inside.</p>

<h3>Human reasoning and the same problem</h3>

<p>This structure — confident beliefs shaped by the particular sample you happened to observe, not the underlying distribution — is not unique to machine learning models. It's a fairly general description of a failure mode in reasoning.</p>

<p>If you read twenty articles that all argue the same point and none that argue against it, your beliefs will be shaped by that sample. The beliefs feel well-founded because you've seen a lot of evidence. But the sample isn't representative. The training distribution — what you've been exposed to — doesn't match the actual distribution of arguments and evidence in the world.</p>

<p>The regularisation insight from ML is that you should penalise complexity — prefer simpler models that capture the main patterns rather than complex models that fit every detail. In reasoning, this translates to something like preferring parsimonious explanations, being suspicious of theories that require many special cases, actively looking for disconfirming evidence. These are not new ideas. But the framing of "regularisation against overfitting" is a slightly different angle on why they matter.</p>

<h3>Cross-validation as a practice</h3>

<p>The most powerful technique against overfitting in ML is cross-validation — holding out some data from training and evaluating on it. The held-out set reveals what the training error conceals. It's a systematic attempt to find the evidence that your current beliefs don't explain.</p>

<p>In empirical research, the analogous practice is pre-registration and out-of-sample testing. You specify your hypothesis before seeing the data, or you hold out a test set and don't touch it until you've finalised your model. These practices are imperfect — researchers are creative at finding ways around them — but they force a kind of held-out evaluation that isn't available if you let your models see all the data during fitting.</p>

<p>In finance, this problem is particularly acute. You have one historical record of market prices. Every time you run a backtest, you are training on that record. Every time you adjust your strategy based on backtest results, you are fitting to it. By the time you deploy, your strategy may have been tuned to the specific noise in the historical record rather than to the underlying market structure. The live performance — the held-out test — is often sobering.</p>

<h3>The regularisation trade-off</h3>

<p>There's a genuine trade-off here that I don't want to paper over. Regularisation doesn't prevent you from learning real patterns — it prevents you from learning patterns that are too specific to the training data. The penalty on complexity is a prior belief that simpler explanations are more likely to generalise. This prior is often right, but not always.</p>

<p>Some real phenomena are complex. Some real patterns are specific. A model that is regularised too aggressively will underfit — it will miss real structure in the data that a less constrained model would capture. The right level of regularisation depends on the problem, and finding it requires the same kind of held-out evaluation you're using to avoid overfitting in the first place.</p>

<p>The epistemological version of this trade-off is between being too credulous (believing everything you observe, including noise) and being too sceptical (dismissing real evidence as noise). Neither extreme is right. The point of the overfitting analogy is not to advocate for radical scepticism. It's to suggest that the default failure mode in pattern recognition — in both machines and people — is the credulous direction, and that explicit regularisation of some kind is usually a good idea.</p>

<p>The hard part is that you can't always tell from the inside which failure mode you're in.</p>
    `
  },

  // ─── 6 ───────────────────────────────────────────────────────────────────
  {
    id: 'macro-ml-nonstationarity',
    title: 'Macro signals and model uncertainty',
    subtitle: 'how ML struggles with non-stationary economies',
    date: '2026-03-01',
    tags: ['macroeconomics', 'machine learning', 'time series', 'nonstationarity'],
    readTime: '12 min',
    lede: 'the economy changes the rules as you play. standard ML frameworks were not built for this.',
    body: `
<p>There's a persistent tension in applying machine learning to macroeconomic forecasting that doesn't get resolved no matter how good the models get. The problem isn't computational. It isn't even about data quality, though that matters too. The fundamental problem is that the economy is a non-stationary process — the rules governing how it works change over time — and most ML methods were developed under the assumption that the data-generating process is stable.</p>

<p>This isn't an abstract concern. The models trained on pre-2008 data failed in 2008 not because they were implemented badly, but because the economy underwent a structural change that the models had no framework to anticipate. The same happened in 2020. The same will happen again. The question is what, if anything, you can do about it.</p>

<h3>What nonstationarity means in practice</h3>

<p>A stationary time series has statistical properties — mean, variance, autocorrelation structure — that don't change over time. Most financial and macroeconomic variables aren't stationary in this sense. GDP has a trend. Interest rates have drifted through distinct regimes. Inflation has behaved qualitatively differently in different decades.</p>

<p>The econometric response to nonstationarity is a set of well-developed tools: differencing to remove trends, cointegration analysis for variables that share a common trend, error-correction models that let short-run dynamics adjust toward a long-run equilibrium. These tools are theoretically grounded and have decent track records.</p>

<p>The ML response to nonstationarity is less well-developed. You can use rolling windows — train only on recent data to ensure your model reflects the current regime. You can use adaptive methods that upweight recent observations. You can explicitly model structural breaks. But none of these is as theoretically principled as, say, cointegration analysis, and the empirical results in macroeconomic forecasting are mixed.</p>

<p>The deeper issue is that ML methods are generally very good at finding patterns and very bad at understanding which patterns will persist. A gradient-boosted tree trained on fifty years of US macro data will find regularities in that data, some of which are economically real and will persist, and some of which are artefacts of the specific historical episode the data represents. The model has no principled way to distinguish between them.</p>

<h3>Regime shifts and the small-data problem</h3>

<p>The most difficult version of the nonstationarity problem is regime shifts. A regime shift is a structural change in the data-generating process — not just a change in the mean of a variable, but a change in the dynamics, the causal structure, the relationships between variables.</p>

<p>The problem is that major macroeconomic regime shifts are, by definition, rare. The 2008 financial crisis was one. The 1970s inflation shock was one. COVID-19 was one. Each of these created a new distributional environment that models trained on pre-shift data were not equipped to handle.</p>

<p>With a handful of regime shifts in the observed data, you cannot train a model to recognise or anticipate them in any robust statistical sense. You can point to narrative or theoretical reasons to expect certain kinds of regime changes — leverage cycles, inflationary spirals, supply shocks — but you can't identify a statistical pattern with enough examples to fit reliably. It's a structural small-data problem even when you have decades of macro data.</p>

<h3>What López de Prado's work suggests</h3>

<p>One of the more useful frameworks I've encountered for thinking about ML in finance comes from López de Prado's work on what he calls "financial machine learning" — not just applied ML to financial data, but a rethinking of the whole pipeline to account for the specific pathologies of financial time series.</p>

<p>The key idea is that standard cross-validation is wrong for financial data because consecutive observations are correlated — you can't treat them as independent samples. Using standard k-fold CV gives you optimistically biased performance estimates because the train and test sets share information through their temporal overlap. López de Prado's solution is purged cross-validation, which explicitly removes the samples from the training set that share information with the test set.</p>

<p>This is a relatively narrow technical fix, but it points to a broader methodological issue: the standard ML toolkit assumes i.i.d. data, and financial/economic data is not i.i.d. in multiple ways. Not just correlated across time, but generated by a process that responds to itself (prices affect beliefs affect prices), with non-constant volatility, fat tails, and structural instabilities. Getting good empirical results requires accounting for all of these, not just the most obvious ones.</p>

<h3>What Bayesian approaches add here</h3>

<p>Bayesian methods offer something useful for the nonstationarity problem that frequentist ML methods don't have: a natural framework for incorporating structural knowledge alongside statistical patterns.</p>

<p>If you believe, on theoretical grounds, that the economy can be in one of several regimes — say, a low-inflation stable growth regime, a high-inflation regime, and a crisis regime — you can build that structure into a Bayesian model as a prior over regimes. The model will then use the data to update the probability of being in each regime, rather than trying to learn the regime structure purely from data.</p>

<p>This doesn't solve the small-sample problem for rare events. But it changes the character of the inference. Instead of asking "what does the historical data tell me about the current state?" you're asking "given my prior beliefs about how the economy works, what does the current data tell me about which regime we're in?" The prior encodes the structural knowledge; the data updates it. That's a more defensible epistemic position than either pure structural modelling (ignoring the data) or pure data-driven ML (ignoring the structure).</p>

<h3>The honest forecast</h3>

<p>I want to be clear about what I think is achievable here, because there's a lot of inflated rhetoric around ML in economics.</p>

<p>For medium-term macroeconomic forecasting — say, forecasting GDP growth or inflation six to twelve months out — the empirical literature doesn't show consistent large improvements from ML over reasonable benchmarks. Simple models like AR(p) or VAR with a handful of variables are hard to beat reliably, especially once you account for the tendency of more complex models to overfit. The ML models sometimes win, but not systematically enough to replace simpler approaches.</p>

<p>Where ML adds more value is in specific narrow tasks: extracting information from high-frequency data, combining forecasts across many models, identifying anomalies in large datasets, nowcasting from non-traditional data sources. These are real contributions. But the hope that deep learning will revolutionise macroeconomic forecasting the way it revolutionised image recognition is, I think, based on a misunderstanding of what makes economics hard. The difficulty isn't computational. It's that you're trying to forecast a partially self-referential, non-stationary, human-generated process from noisy, sparse, and delayed data.</p>

<p>That problem doesn't get easier just because your model has more parameters.</p>
    `
  }

];

// Export for use in app.js or data.js
if (typeof module !== 'undefined') module.exports = essayEntries;