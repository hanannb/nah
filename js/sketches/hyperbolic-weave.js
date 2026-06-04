window.P5_SKETCHES = window.P5_SKETCHES || {};
window.P5_SKETCHES['hyperbolic-weave'] = {
    code: `// HYPERBOLIC WEAVE
// Rings follow Poincaré disk metric: rₖ = tan(k·Δ).
// Möbius translation adds continuous motion through curved space.
const RINGS = 18, NODES = 32;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill(); strokeWeight(1);
}

function draw() {
  background(10); t += 0.01;
  translate(width/2, height/2);
  let maxR = min(width,height)*0.49;

  let tx = cos(t*0.53)*0.45, ty = sin(t*0.47)*0.45;
  let tn = sqrt(tx*tx+ty*ty);
  if (tn > 0.99) { tx *= 0.99/tn; ty *= 0.99/tn; }

  for (let k = 0; k < RINGS; k++) {
    let rP = tan(k*0.25+0.1);
    let rS = rP*maxR;
    let sz = constrain(maxR*0.08*pow(1-rP,1.2), 2, maxR*0.12);
    let alpha = constrain(map(rP,0.85,1,255,0), 0, 255);

    for (let p = 0; p < NODES; p++) {
      let theta = (p/NODES)*TWO_PI + t*0.15;
      let zx = cos(theta)*rP, zy = sin(theta)*rP;
      let den = 1+2*(zx*tx+zy*ty)+(tx*tx+ty*ty)*(zx*zx+zy*zy);
      let ux = (zx*(1+tx*tx+ty*ty)+tx*(1-zx*zx-zy*zy))/den;
      let uy = (zy*(1+tx*tx+ty*ty)+ty*(1-zx*zx-zy*zy))/den;
      let nx=ux*maxR, ny=uy*maxR;
      if (dist(nx,ny,0,0) > maxR-1) continue;

      let ang = theta+HALF_PI;
      let h=sz/2, ca=cos(ang), sa=sin(ang);
      let c = [
        {x:nx-h*ca+h*sa,y:ny-h*sa-h*ca},{x:nx+h*ca+h*sa,y:ny+h*sa-h*ca},
        {x:nx+h*ca-h*sa,y:ny+h*sa+h*ca},{x:nx-h*ca-h*sa,y:ny-h*sa+h*ca}
      ];

      push(); translate(nx,ny); rotate(ang);
      stroke(255,alpha); rectMode(CENTER); rect(0,0,sz,sz);
      strokeWeight(2); point(0,0); pop();

      if (k < RINGS-1) {
        let rP2 = tan((k+1)*0.25+0.1), rS2 = rP2*maxR;
        let sz2 = maxR*0.08*pow(1-rP2,1.2);
        let th2 = (p/NODES)*TWO_PI+t*0.15;
        let zx2=cos(th2)*rP2, zy2=sin(th2)*rP2;
        let den2=1+2*(zx2*tx+zy2*ty)+(tx*tx+ty*ty)*(zx2*zx2+zy2*zy2);
        let ux2=(zx2*(1+tx*tx+ty*ty)+tx*(1-zx2*zx2-zy2*zy2))/den2;
        let uy2=(zy2*(1+tx*tx+ty*ty)+ty*(1-zx2*zx2-zy2*zy2))/den2;
        let nx2=ux2*maxR, ny2=uy2*maxR;
        if (dist(nx2,ny2,0,0) <= maxR) {
          let h2=sz2/2, ca2=cos(th2+HALF_PI), sa2=sin(th2+HALF_PI);
          let c2 = [
            {x:nx2-h2*ca2+h2*sa2,y:ny2-h2*sa2-h2*ca2},{x:nx2+h2*ca2+h2*sa2,y:ny2+h2*sa2-h2*ca2},
            {x:nx2+h2*ca2-h2*sa2,y:ny2+h2*sa2+h2*ca2},{x:nx2-h2*ca2-h2*sa2,y:ny2-h2*sa2+h2*ca2}
          ];
          stroke(255,min(alpha,255)*0.25); strokeWeight(0.5);
          line(c[0].x,c[0].y,c2[3].x,c2[3].y);
          line(c[1].x,c[1].y,c2[2].x,c2[2].y);
        }
      }
    }
  }
}`,
    run(container) {
        const inst = new p5(sk => {
            const RINGS = 18, NODES = 32;
            let t = 0;

            sk.setup = function() {
                sk.createCanvas(container.clientWidth || 500, container.clientHeight || 280);
                sk.noFill(); sk.strokeWeight(1);
            };

            sk.draw = function() {
                sk.background(10); t += 0.01;
                sk.translate(sk.width/2, sk.height/2);
                let maxR = sk.min(sk.width, sk.height)*0.49;

                let tx = sk.cos(t*0.53)*0.45, ty = sk.sin(t*0.47)*0.45;
                let tn = sk.sqrt(tx*tx+ty*ty);
                if (tn > 0.99) { tx *= 0.99/tn; ty *= 0.99/tn; }

                for (let k = 0; k < RINGS; k++) {
                    let rP = sk.tan(k*0.25+0.1);
                    let sz = sk.constrain(maxR*0.08*sk.pow(1-rP,1.2), 2, maxR*0.12);
                    let alpha = sk.constrain(sk.map(rP,0.85,1,255,0), 0, 255);

                    for (let p = 0; p < NODES; p++) {
                        let theta = (p/NODES)*sk.TWO_PI + t*0.15;
                        let zx = sk.cos(theta)*rP, zy = sk.sin(theta)*rP;
                        let den = 1+2*(zx*tx+zy*ty)+(tx*tx+ty*ty)*(zx*zx+zy*zy);
                        let ux = (zx*(1+tx*tx+ty*ty)+tx*(1-zx*zx-zy*zy))/den;
                        let uy = (zy*(1+tx*tx+ty*ty)+ty*(1-zx*zx-zy*zy))/den;
                        let nx = ux*maxR, ny = uy*maxR;
                        if (sk.dist(nx,ny,0,0) > maxR-1) continue;

                        let ang = theta + sk.HALF_PI;
                        let h = sz/2, ca = sk.cos(ang), sa = sk.sin(ang);
                        let c = [
                            {x:nx-h*ca+h*sa,y:ny-h*sa-h*ca},{x:nx+h*ca+h*sa,y:ny+h*sa-h*ca},
                            {x:nx+h*ca-h*sa,y:ny+h*sa+h*ca},{x:nx-h*ca-h*sa,y:ny-h*sa+h*ca}
                        ];

                        sk.push(); sk.translate(nx,ny); sk.rotate(ang);
                        sk.stroke(255,alpha); sk.rectMode(sk.CENTER); sk.rect(0,0,sz,sz);
                        sk.strokeWeight(2); sk.point(0,0); sk.pop();

                        if (k < RINGS-1) {
                            let rP2 = sk.tan((k+1)*0.25+0.1);
                            let sz2 = maxR*0.08*sk.pow(1-rP2,1.2);
                            let th2 = (p/NODES)*sk.TWO_PI + t*0.15;
                            let zx2 = sk.cos(th2)*rP2, zy2 = sk.sin(th2)*rP2;
                            let den2 = 1+2*(zx2*tx+zy2*ty)+(tx*tx+ty*ty)*(zx2*zx2+zy2*zy2);
                            let ux2 = (zx2*(1+tx*tx+ty*ty)+tx*(1-zx2*zx2-zy2*zy2))/den2;
                            let uy2 = (zy2*(1+tx*tx+ty*ty)+ty*(1-zx2*zx2-zy2*zy2))/den2;
                            let nx2 = ux2*maxR, ny2 = uy2*maxR;
                            if (sk.dist(nx2,ny2,0,0) <= maxR) {
                                let h2 = sz2/2, ca2 = sk.cos(th2+sk.HALF_PI), sa2 = sk.sin(th2+sk.HALF_PI);
                                let c2 = [
                                    {x:nx2-h2*ca2+h2*sa2,y:ny2-h2*sa2-h2*ca2},{x:nx2+h2*ca2+h2*sa2,y:ny2+h2*sa2-h2*ca2},
                                    {x:nx2+h2*ca2-h2*sa2,y:ny2+h2*sa2+h2*ca2},{x:nx2-h2*ca2-h2*sa2,y:ny2-h2*sa2+h2*ca2}
                                ];
                                sk.stroke(255, sk.min(alpha,255)*0.25); sk.strokeWeight(0.5);
                                sk.line(c[0].x,c[0].y,c2[3].x,c2[3].y);
                                sk.line(c[1].x,c[1].y,c2[2].x,c2[2].y);
                            }
                        }
                    }
                }
            };
        }, container);
        return { stop() { inst.remove(); } };
    }
};
