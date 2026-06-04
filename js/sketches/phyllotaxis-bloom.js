window.P5_SKETCHES = window.P5_SKETCHES || {};
window.P5_SKETCHES['phyllotaxis-bloom'] = {
    code: `// PHYLLOTAXIS BLOOM
// 945 golden-angle seeds with Fibonacci veins (n±8, n±13),
// petal ellipses at the periphery, and breathing wave torsion.
const N = 945, PHI = 1.6180339887;
const GA = (2*Math.PI)/(PHI*PHI);  // golden angle ≈ 137.5°
const SPREAD = 8.5;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(255); strokeWeight(1);
}

function draw() {
  background(2); t += 0.0135;
  translate(width/2, height/2);
  scale(0.55);
  let maxR = SPREAD*sqrt(N-1);
  let pts = [];

  for (let i = 0; i < N; i++) {
    let theta = i*GA + t*0.3;
    let r = SPREAD*sqrt(i) + sin(theta*5)*4;
    let x = cos(theta)*r, y = sin(theta)*r;
    let wave    = sin(r*0.055 - t*10)*1.15;
    let torsion = sin(r*0.12  + t*2.4)*0.75;
    let angle   = theta + HALF_PI + torsion;
    let sz      = map(wave,-1.15,1.15,3,14);
    let alpha   = constrain(map(r,0,maxR*2.92,255,8)*map(wave,-1.15,1.15,0.45,1.4), 5, 255);
    pts.push({ i,x,y,angle,theta,sz,alpha });
  }

  // Fibonacci veins
  for (let f of [8,13]) for (let i=0; i+f<N; i++) {
    let a=pts[i], b=pts[i+f];
    if (a.alpha<5||b.alpha<5) continue;
    stroke(255,min(a.alpha,b.alpha)*0.45); strokeWeight(0.5);
    line(a.x,a.y,b.x,b.y);
  }

  rectMode(CENTER);
  for (let p of pts) {
    if (p.i > N*0.55) {
      push(); translate(p.x,p.y); rotate(p.theta);
      let pLen = map(p.i,N*0.55,N,10,130) + sin(t*4+p.theta*3)*12;
      noFill(); stroke(255,p.alpha*0.45); strokeWeight(0.8);
      ellipse(pLen/2+p.sz, 0, pLen, p.sz*1.8); pop();
    }
    push(); translate(p.x,p.y); rotate(p.angle);
    fill(2,p.alpha*0.9); stroke(255,p.alpha); strokeWeight(0.8);
    rect(0,0,p.sz,p.sz);
    strokeWeight(1.5); stroke(255,p.alpha*0.8); point(0,0); pop();
  }
}`,
    run(container) {
        const inst = new p5(sk => {
            const N = 945, PHI = 1.6180339887;
            const GA = (2*Math.PI)/(PHI*PHI);
            const SPREAD = 8.5;
            let t = 0;

            sk.setup = function() {
                sk.createCanvas(container.clientWidth || 500, container.clientHeight || 280);
                sk.stroke(255); sk.strokeWeight(1);
            };

            sk.draw = function() {
                sk.background(2); t += 0.0135;
                sk.translate(sk.width/2, sk.height/2);
                sk.scale(0.55);
                let maxR = SPREAD*sk.sqrt(N-1);
                let pts = [];

                for (let i = 0; i < N; i++) {
                    let theta = i*GA + t*0.3;
                    let r = SPREAD*sk.sqrt(i) + sk.sin(theta*5)*4;
                    let x = sk.cos(theta)*r, y = sk.sin(theta)*r;
                    let wave    = sk.sin(r*0.055 - t*10)*1.15;
                    let torsion = sk.sin(r*0.12  + t*2.4)*0.75;
                    let angle   = theta + sk.HALF_PI + torsion;
                    let sz      = sk.map(wave,-1.15,1.15,3,14);
                    let alpha   = sk.constrain(sk.map(r,0,maxR*2.92,255,8)*sk.map(wave,-1.15,1.15,0.45,1.4), 5, 255);
                    pts.push({ i,x,y,angle,theta,sz,alpha });
                }

                for (let f of [8,13]) {
                    for (let i = 0; i+f < N; i++) {
                        let a = pts[i], b = pts[i+f];
                        if (a.alpha < 5 || b.alpha < 5) continue;
                        sk.stroke(255, sk.min(a.alpha,b.alpha)*0.45); sk.strokeWeight(0.5);
                        sk.line(a.x,a.y,b.x,b.y);
                    }
                }

                sk.rectMode(sk.CENTER);
                for (let p of pts) {
                    if (p.i > N*0.55) {
                        sk.push(); sk.translate(p.x,p.y); sk.rotate(p.theta);
                        let pLen = sk.map(p.i,N*0.55,N,10,130) + sk.sin(t*4+p.theta*3)*12;
                        sk.noFill(); sk.stroke(255,p.alpha*0.45); sk.strokeWeight(0.8);
                        sk.ellipse(pLen/2+p.sz, 0, pLen, p.sz*1.8); sk.pop();
                    }
                    sk.push(); sk.translate(p.x,p.y); sk.rotate(p.angle);
                    sk.fill(2,p.alpha*0.9); sk.stroke(255,p.alpha); sk.strokeWeight(0.8);
                    sk.rect(0,0,p.sz,p.sz);
                    sk.strokeWeight(1.5); sk.stroke(255,p.alpha*0.8); sk.point(0,0); sk.pop();
                }
            };
        }, container);
        return { stop() { inst.remove(); } };
    }
};
