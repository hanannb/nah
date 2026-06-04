window.P5_SKETCHES = window.P5_SKETCHES || {};
window.P5_SKETCHES['vortex-dipole'] = {
    code: `// VORTEX DIPOLE LATTICE
// Two counter-rotating vortices (Γ = ±1) orbit each other.
// Grid nodes rotate by induced velocity: strength·atan2(Δy,Δx)/dist.
const N = 20, S = 28;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill(); strokeWeight(1);
}

function draw() {
  background(8); t += 0.01;
  translate(width/2, height/2);
  let orbR = width*0.15;
  let v1x=cos(t*0.7)*orbR, v1y=sin(t*0.7)*orbR;
  let v2x=-v1x, v2y=-v1y;
  let strength = 18;

  let grid = [];
  for (let i = -N; i <= N; i++) {
    grid[i] = [];
    for (let j = -N; j <= N; j++) {
      let x=i*S, y=j*S, angle=0;
      let d1=dist(x,y,v1x,v1y); if (d1>1) angle += strength*atan2(y-v1y,x-v1x)/d1;
      let d2=dist(x,y,v2x,v2y); if (d2>1) angle -= strength*atan2(y-v2y,x-v2x)/d2;
      let sz=S*0.6;
      let dP=(dist(x,y,v1x,v1y)+dist(x,y,v2x,v2y))*0.5;
      let alpha=constrain(map(dP,width*0.1,width*0.5,255,20), 0, 255);
      grid[i][j] = { x,y,a:angle,sz,alpha, corners:getCorners(x,y,angle,sz) };
    }
  }

  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    let c=grid[i][j]; if (c.alpha<1) continue;
    push(); translate(c.x,c.y); rotate(c.a);
    stroke(255,c.alpha); rectMode(CENTER); rect(0,0,c.sz,c.sz);
    strokeWeight(2); point(0,0); pop();
    if (i<N) { let r=grid[i+1][j]; if(r&&r.alpha>0) {
      stroke(255,min(c.alpha,r.alpha)*0.3); strokeWeight(0.6);
      line(c.corners[1].x,c.corners[1].y, r.corners[0].x,r.corners[0].y);
      line(c.corners[2].x,c.corners[2].y, r.corners[3].x,r.corners[3].y);
    }}
    if (j<N) { let d=grid[i][j+1]; if(d&&d.alpha>0) {
      stroke(255,min(c.alpha,d.alpha)*0.3); strokeWeight(0.6);
      line(c.corners[3].x,c.corners[3].y, d.corners[0].x,d.corners[0].y);
      line(c.corners[2].x,c.corners[2].y, d.corners[1].x,d.corners[1].y);
    }}
  }
}

function getCorners(cx,cy,a,s) {
  let h=s/2, ca=cos(a), sa=sin(a);
  return [
    {x:cx-h*ca+h*sa,y:cy-h*sa-h*ca},{x:cx+h*ca+h*sa,y:cy+h*sa-h*ca},
    {x:cx+h*ca-h*sa,y:cy+h*sa+h*ca},{x:cx-h*ca-h*sa,y:cy-h*sa+h*ca}
  ];
}`,
    run(container) {
        const inst = new p5(sk => {
            const N = 20, S = 28;
            let t = 0;

            function getCorners(cx, cy, a, s) {
                let h = s/2, ca = sk.cos(a), sa = sk.sin(a);
                return [
                    {x:cx-h*ca+h*sa,y:cy-h*sa-h*ca},{x:cx+h*ca+h*sa,y:cy+h*sa-h*ca},
                    {x:cx+h*ca-h*sa,y:cy+h*sa+h*ca},{x:cx-h*ca-h*sa,y:cy-h*sa+h*ca}
                ];
            }

            sk.setup = function() {
                sk.createCanvas(container.clientWidth || 500, container.clientHeight || 280);
                sk.noFill(); sk.strokeWeight(1);
            };

            sk.draw = function() {
                sk.background(8); t += 0.01;
                sk.translate(sk.width/2, sk.height/2);
                let orbR = sk.width*0.15;
                let v1x = sk.cos(t*0.7)*orbR, v1y = sk.sin(t*0.7)*orbR;
                let v2x = -v1x, v2y = -v1y;
                let strength = 18;

                let grid = [];
                for (let i = -N; i <= N; i++) {
                    grid[i] = [];
                    for (let j = -N; j <= N; j++) {
                        let x = i*S, y = j*S, angle = 0;
                        let d1 = sk.dist(x,y,v1x,v1y); if (d1>1) angle += strength*sk.atan2(y-v1y,x-v1x)/d1;
                        let d2 = sk.dist(x,y,v2x,v2y); if (d2>1) angle -= strength*sk.atan2(y-v2y,x-v2x)/d2;
                        let sz = S*0.6;
                        let dP = (sk.dist(x,y,v1x,v1y)+sk.dist(x,y,v2x,v2y))*0.5;
                        let alpha = sk.constrain(sk.map(dP, sk.width*0.1, sk.width*0.5, 255, 20), 0, 255);
                        grid[i][j] = { x,y,a:angle,sz,alpha, corners:getCorners(x,y,angle,sz) };
                    }
                }

                for (let i = -N; i <= N; i++) {
                    for (let j = -N; j <= N; j++) {
                        let c = grid[i][j]; if (c.alpha < 1) continue;
                        sk.push(); sk.translate(c.x,c.y); sk.rotate(c.a);
                        sk.stroke(255,c.alpha); sk.rectMode(sk.CENTER); sk.rect(0,0,c.sz,c.sz);
                        sk.strokeWeight(2); sk.point(0,0); sk.pop();
                        if (i < N) {
                            let r = grid[i+1][j];
                            if (r && r.alpha > 0) {
                                sk.stroke(255, sk.min(c.alpha,r.alpha)*0.3); sk.strokeWeight(0.6);
                                sk.line(c.corners[1].x,c.corners[1].y,r.corners[0].x,r.corners[0].y);
                                sk.line(c.corners[2].x,c.corners[2].y,r.corners[3].x,r.corners[3].y);
                            }
                        }
                        if (j < N) {
                            let dn = grid[i][j+1];
                            if (dn && dn.alpha > 0) {
                                sk.stroke(255, sk.min(c.alpha,dn.alpha)*0.3); sk.strokeWeight(0.6);
                                sk.line(c.corners[3].x,c.corners[3].y,dn.corners[0].x,dn.corners[0].y);
                                sk.line(c.corners[2].x,c.corners[2].y,dn.corners[1].x,dn.corners[1].y);
                            }
                        }
                    }
                }
            };
        }, container);
        return { stop() { inst.remove(); } };
    }
};
