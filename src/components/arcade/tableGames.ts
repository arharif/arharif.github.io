export type TableMode = 'bubble-blitz' | 'neon-stack';
const clamp = (n: number, min: number, max:number) => Math.max(min, Math.min(max,n));
export function newStack() {
  return { tower: [{x:180,width:120}], x:0, direction:1, score:0, ended:false, win:false };
}
export function stepStack(s: ReturnType<typeof newStack>, dt:number) {
  const limit = 480 - s.tower[s.tower.length-1].width;
  s.x = clamp(s.x + s.direction * (130 + s.tower.length*12) * dt,0,limit);
  if (s.x === 0 || s.x === limit) s.direction *= -1;
}
export function dropBlock(s: ReturnType<typeof newStack>) {
  if (s.ended) return;
  const last = s.tower[s.tower.length-1];
  const left = Math.max(last.x,s.x);
  const width = Math.min(last.x + last.width, s.x + last.width) - left;
  if (width <= 0) { s.ended = true; return; }
  s.score += Math.ceil(100 * width/last.width);
  s.tower.push({x:left,width});
  s.win = s.tower.length === 13;
  s.ended = s.win;
  s.direction *= -1;
  s.x = s.direction > 0 ? 0 : 480-width;
}

// Paddle, wall reflection and target removal adapted from the CC0 Canvas
// Workshop code sample. The circular layout, aiming and frame timing are X1's.
export function newBubbles() {
  return {x:240,y:218,vx:90,vy:-160,paddle:240,lives:3,score:0,ended:false,win:false,
    bubbles:Array.from({length:24}, (_,i) => ({x:53+(i%8)*52,y:35+Math.floor(i/8)*36,active:true}))};
}
export function stepBubbles(s:ReturnType<typeof newBubbles>, dt:number, direction:number) {
  if (s.ended) return;
  s.paddle = clamp(s.paddle + direction*340*dt,44,436);
  s.x += s.vx*dt; s.y += s.vy*dt;
  if ((s.x <= 6 && s.vx < 0) || (s.x >= 474 && s.vx > 0)) s.vx *= -1;
  if (s.y <= 6 && s.vy < 0) s.vy *= -1;
  const hit = s.bubbles.find(b => b.active && Math.hypot(b.x-s.x,b.y-s.y) < 19);
  if (hit) {
    hit.active = false;
    s.vy = (s.y >= hit.y ? 1 : -1)*Math.abs(s.vy);
    s.score += 50;
    s.win = s.bubbles.every(b => !b.active);
    s.ended = s.win;
  }
  if (s.vy > 0 && s.y >= 226 && s.y < 240 && Math.abs(s.x-s.paddle) <= 48) {
    s.vx = (s.x-s.paddle)*4.3;
    s.vy = -Math.sqrt(46000-s.vx*s.vx);
    s.y = 225;
  }
  if (s.y > 255) {
    s.lives--;
    s.ended = !s.lives;
    s.x = s.paddle; s.y = 209; s.vx = 90; s.vy = -160;
  }
}
