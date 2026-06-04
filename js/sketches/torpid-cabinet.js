window.P5_SKETCHES = window.P5_SKETCHES || {};
window.P5_SKETCHES['torpid-cabinet'] = {
    code: `// TORPID CABINET
// 32 rotating squares on golden-ratio rings.
// Continuous zoom resets at φ. Shape morphs circle ↔ square.
const P = 32, K = 10, STEP = 1.618033;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill(); strokeJoin(BEVEL);
}

function draw() {
  background(8); t += 0.007;
  translate(width/2, height/2);
  let zoom  = (t*1.5) % 1.0;
  let morph = (sin(t*0.8)+1)*0.5;
  let rot0  = t*0.15;
  let baseR = min(width,height)*0.08;
  let nodes = [];

  for (let k = -2; k <= K; k++) {
    nodes[k] = [];
    let rBase = baseR * pow(STEP, k + zoom);
    for (let p = 0; p < P; p++) {
      let theta = (p/P)*TWO_PI + rot0;
      let rSq = rBase / max(max(abs(cos(theta-rot0)), abs(sin(theta-rot0))), 1e-4);
      let r = lerp(rBase, rSq, morph);
      let x = cos(theta)*r, y = sin(theta)*r;
      let w = sqrt(x*x+y*y)*0.012 - t*3;
      let a = theta + sin(w)*PI*0.65;
      let s = rBase*0.35 * map(cos(w),-1,1,0.4,1.2);
      let alpha = 255;
      let hi = baseR*pow(STEP,K-2.5), lo = baseR*pow(STEP,0.5);
      if (rBase > hi) alpha = map(rBase, hi, hi*STEP, 255, 0);
      if (rBase < lo) alpha = map(rBase, lo, lo/STEP, 255, 0);
      nodes[k][p] = { x,y,a,s, alpha:constrain(alpha,0,255), c:corners(x,y,a,s) };
    }
  }

  for (let k = -1; k < K-1; k++) for (let p = 0; p < P; p++) {
    let n = nodes[k][p]; if (n.alpha < 1) continue;
    push(); translate(n.x,n.y); rotate(n.a);
    stroke(255,n.alpha); strokeWeight(1.2);
    rectMode(CENTER); rect(0,0,n.s,n.s);
    strokeWeight(2.5); stroke(255,n.alpha*1.5); point(0,0); pop();

    let nb = nodes[k][(p+1)%P], ns = nodes[k+1][p];
    strokeWeight(0.6); stroke(255,n.alpha*0.45);
    line(n.c[1].x,n.c[1].y, nb.c[0].x,nb.c[0].y);
    line(n.c[2].x,n.c[2].y, nb.c[3].x,nb.c[3].y);
    if (ns.alpha > 0) {
      stroke(255,min(n.alpha,ns.alpha)*0.25);
      line(n.c[0].x,n.c[0].y, ns.c[3].x,ns.c[3].y);
      line(n.c[1].x,n.c[1].y, ns.c[2].x,ns.c[2].y);
    }
  }
}

function corners(cx,cy,a,s) {
  let h=s/2, ca=cos(a), sa=sin(a);
  return [
    {x:cx-h*ca+h*sa, y:cy-h*sa-h*ca}, {x:cx+h*ca+h*sa, y:cy+h*sa-h*ca},
    {x:cx+h*ca-h*sa, y:cy+h*sa+h*ca}, {x:cx-h*ca-h*sa, y:cy-h*sa+h*ca}
  ];
}`,
    run(container) {
        const inst = new p5(sk => {
            const P_N = 32, K = 10, STEP = 1.618033;
            let t = 0;

            function corners(cx, cy, a, s) {
                let h = s/2, ca = sk.cos(a), sa = sk.sin(a);
                return [
                    {x:cx-h*ca+h*sa, y:cy-h*sa-h*ca}, {x:cx+h*ca+h*sa, y:cy+h*sa-h*ca},
                    {x:cx+h*ca-h*sa, y:cy+h*sa+h*ca}, {x:cx-h*ca-h*sa, y:cy-h*sa+h*ca}
                ];
            }

            sk.setup = function() {
                sk.createCanvas(container.clientWidth || 500, container.clientHeight || 300);
                sk.noFill(); sk.strokeJoin(sk.BEVEL);
            };

            sk.draw = function() {
                sk.background(8); t += 0.007;
                sk.translate(sk.width/2, sk.height/2);
                let zoom  = (t*1.5) % 1.0;
                let morph = (sk.sin(t*0.8)+1)*0.5;
                let rot0  = t*0.15;
                let baseR = sk.min(sk.width,sk.height)*0.08;
                let nodes = [];

                for (let k = -2; k <= K; k++) {
                    nodes[k] = [];
                    let rBase = baseR * sk.pow(STEP, k + zoom);
                    for (let i = 0; i < P_N; i++) {
                        let theta = (i/P_N)*sk.TWO_PI + rot0;
                        let rSq = rBase / sk.max(sk.max(sk.abs(sk.cos(theta-rot0)), sk.abs(sk.sin(theta-rot0))), 1e-4);
                        let r = sk.lerp(rBase, rSq, morph);
                        let x = sk.cos(theta)*r, y = sk.sin(theta)*r;
                        let w = sk.sqrt(x*x+y*y)*0.012 - t*3;
                        let a = theta + sk.sin(w)*sk.PI*0.65;
                        let s = rBase*0.35 * sk.map(sk.cos(w),-1,1,0.4,1.2);
                        let alpha = 255;
                        let hi = baseR*sk.pow(STEP,K-2.5), lo = baseR*sk.pow(STEP,0.5);
                        if (rBase > hi) alpha = sk.map(rBase, hi, hi*STEP, 255, 0);
                        if (rBase < lo) alpha = sk.map(rBase, lo, lo/STEP, 255, 0);
                        nodes[k][i] = { x,y,a,s, alpha:sk.constrain(alpha,0,255), c:corners(x,y,a,s) };
                    }
                }

                for (let k = -1; k < K-1; k++) {
                    for (let i = 0; i < P_N; i++) {
                        let n = nodes[k][i]; if (n.alpha <= 0.1) continue;
                        sk.push(); sk.translate(n.x,n.y); sk.rotate(n.a);
                        sk.stroke(255,n.alpha); sk.strokeWeight(1.2);
                        sk.rectMode(sk.CENTER); sk.rect(0,0,n.s,n.s);
                        sk.strokeWeight(2.5); sk.stroke(255,n.alpha*1.5); sk.point(0,0); sk.pop();
                        let nb = nodes[k][(i+1)%P_N], ns = nodes[k+1][i];
                        sk.strokeWeight(0.6); sk.stroke(255,n.alpha*0.45);
                        sk.line(n.c[1].x,n.c[1].y,nb.c[0].x,nb.c[0].y);
                        sk.line(n.c[2].x,n.c[2].y,nb.c[3].x,nb.c[3].y);
                        if (ns.alpha > 0) {
                            sk.stroke(255,sk.min(n.alpha,ns.alpha)*0.25);
                            sk.line(n.c[0].x,n.c[0].y,ns.c[3].x,ns.c[3].y);
                            sk.line(n.c[1].x,n.c[1].y,ns.c[2].x,ns.c[2].y);
                        }
                    }
                }
            };
        }, container);
        return { stop() { inst.remove(); } };
    }
};
