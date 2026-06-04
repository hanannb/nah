window.P5_SKETCHES = window.P5_SKETCHES || {};
window.P5_SKETCHES['woven-field'] = {
    code: `// WOVEN FIELD
// Scalar field φ = sin·cos superposition drives rotation + size.
// A roaming observer creates depth via distance falloff.
const N = 22, S = 30;
let t = 0, obs;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill(); strokeWeight(1);
  obs = createVector(0, 0);
}

function draw() {
  background(9); t += 0.007;
  translate(width/2, height/2);
  obs.set(cos(t*0.43)*width*0.35, sin(t*0.55)*height*0.25);

  let grid = [];
  for (let i = -N; i <= N; i++) {
    grid[i] = [];
    for (let j = -N; j <= N; j++) {
      let cx = i*S, cy = j*S, k1 = 0.03, k2 = 0.027;
      let φ  = sin(cx*k1+t*2.1)*cos(cy*k2-t*1.4) + cos(cx*k2*0.7+t)*sin(cy*k1*0.9-t*1.2);
      let φx = sin((cx+1)*k1+t*2.1)*cos(cy*k2-t*1.4) + cos((cx+1)*k2*0.7+t)*sin(cy*k1*0.9-t*1.2) - φ;
      let φy = sin(cx*k1+t*2.1)*cos((cy+1)*k2-t*1.4) + cos(cx*k2*0.7+t)*sin((cy+1)*k1*0.9-t*1.2) - φ;
      let rot = atan2(φy,φx)*0.7;
      let sz  = constrain(S*(0.55+φ*0.12), 4, S*0.85);
      let x = cx+φx*0.8, y = cy+φy*0.8;
      let d = dist(x,y,obs.x,obs.y);
      let alpha = constrain(map(d,0,width*0.55,255,30)*map(sz,4,S*0.85,0.3,1), 0, 255);
      grid[i][j] = { x,y,rot,sz,alpha, corners:getCorners(x,y,rot,sz) };
    }
  }

  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    let c = grid[i][j]; if (c.alpha < 1) continue;
    push(); translate(c.x,c.y); rotate(c.rot);
    stroke(255,c.alpha); strokeWeight(1); rectMode(CENTER); rect(0,0,c.sz,c.sz);
    strokeWeight(2); point(0,0); pop();
    if (i<N) { let r=grid[i+1][j]; if(r&&r.alpha>0) {
      stroke(255,min(c.alpha,r.alpha)*0.32); strokeWeight(0.6);
      line(c.corners[1].x,c.corners[1].y, r.corners[0].x,r.corners[0].y);
      line(c.corners[2].x,c.corners[2].y, r.corners[3].x,r.corners[3].y);
    }}
    if (j<N) { let d=grid[i][j+1]; if(d&&d.alpha>0) {
      stroke(255,min(c.alpha,d.alpha)*0.32); strokeWeight(0.6);
      line(c.corners[3].x,c.corners[3].y, d.corners[0].x,d.corners[0].y);
      line(c.corners[2].x,c.corners[2].y, d.corners[1].x,d.corners[1].y);
    }}
  }
}

function getCorners(cx,cy,a,s) {
  let h=s/2, ca=cos(a), sa=sin(a);
  return [
    {x:cx-h*ca+h*sa, y:cy-h*sa-h*ca}, {x:cx+h*ca+h*sa, y:cy+h*sa-h*ca},
    {x:cx+h*ca-h*sa, y:cy+h*sa+h*ca}, {x:cx-h*ca-h*sa, y:cy-h*sa+h*ca}
  ];
}`,
    run(container) {
        const inst = new p5(sk => {
            const N = 22, S = 30;
            let t = 0, obs;

            function getCorners(cx, cy, a, s) {
                let h = s/2, ca = sk.cos(a), sa = sk.sin(a);
                return [
                    {x:cx-h*ca+h*sa, y:cy-h*sa-h*ca}, {x:cx+h*ca+h*sa, y:cy+h*sa-h*ca},
                    {x:cx+h*ca-h*sa, y:cy+h*sa+h*ca}, {x:cx-h*ca-h*sa, y:cy-h*sa+h*ca}
                ];
            }

            sk.setup = function() {
                sk.createCanvas(container.clientWidth || 500, container.clientHeight || 280);
                sk.noFill(); sk.strokeWeight(1);
                obs = sk.createVector(0, 0);
            };

            sk.draw = function() {
                sk.background(9); t += 0.007;
                sk.translate(sk.width/2, sk.height/2);
                obs.set(sk.cos(t*0.43)*sk.width*0.35, sk.sin(t*0.55)*sk.height*0.25);

                let grid = [];
                for (let i = -N; i <= N; i++) {
                    grid[i] = [];
                    for (let j = -N; j <= N; j++) {
                        let cx = i*S, cy = j*S, k1 = 0.03, k2 = 0.027;
                        let phi  = sk.sin(cx*k1+t*2.1)*sk.cos(cy*k2-t*1.4) + sk.cos(cx*k2*0.7+t)*sk.sin(cy*k1*0.9-t*1.2);
                        let phix = sk.sin((cx+1)*k1+t*2.1)*sk.cos(cy*k2-t*1.4) + sk.cos((cx+1)*k2*0.7+t)*sk.sin(cy*k1*0.9-t*1.2) - phi;
                        let phiy = sk.sin(cx*k1+t*2.1)*sk.cos((cy+1)*k2-t*1.4) + sk.cos(cx*k2*0.7+t)*sk.sin((cy+1)*k1*0.9-t*1.2) - phi;
                        let rot = sk.atan2(phiy, phix)*0.7;
                        let sz  = sk.constrain(S*(0.55+phi*0.12), 4, S*0.85);
                        let x = cx+phix*0.8, y = cy+phiy*0.8;
                        let d = sk.dist(x, y, obs.x, obs.y);
                        let alpha = sk.constrain(sk.map(d,0,sk.width*0.55,255,30)*sk.map(sz,4,S*0.85,0.3,1), 0, 255);
                        grid[i][j] = { x,y,rot,sz,alpha, corners:getCorners(x,y,rot,sz) };
                    }
                }

                for (let i = -N; i <= N; i++) {
                    for (let j = -N; j <= N; j++) {
                        let c = grid[i][j]; if (c.alpha < 1) continue;
                        sk.push(); sk.translate(c.x,c.y); sk.rotate(c.rot);
                        sk.stroke(255,c.alpha); sk.strokeWeight(1);
                        sk.rectMode(sk.CENTER); sk.rect(0,0,c.sz,c.sz);
                        sk.strokeWeight(2); sk.point(0,0); sk.pop();
                        if (i < N) {
                            let r = grid[i+1][j];
                            if (r && r.alpha > 0) {
                                sk.stroke(255, sk.min(c.alpha,r.alpha)*0.32); sk.strokeWeight(0.6);
                                sk.line(c.corners[1].x,c.corners[1].y, r.corners[0].x,r.corners[0].y);
                                sk.line(c.corners[2].x,c.corners[2].y, r.corners[3].x,r.corners[3].y);
                            }
                        }
                        if (j < N) {
                            let dn = grid[i][j+1];
                            if (dn && dn.alpha > 0) {
                                sk.stroke(255, sk.min(c.alpha,dn.alpha)*0.32); sk.strokeWeight(0.6);
                                sk.line(c.corners[3].x,c.corners[3].y, dn.corners[0].x,dn.corners[0].y);
                                sk.line(c.corners[2].x,c.corners[2].y, dn.corners[1].x,dn.corners[1].y);
                            }
                        }
                    }
                }
            };
        }, container);
        return { stop() { inst.remove(); } };
    }
};
