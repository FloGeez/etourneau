/* The brand's shapes for the murmuration (720 × 640 frame, see @flogeez/murmuration's sampleShape): the starling and the
   basket, and the steps of florian-etourneau.dev's story (work, editor, maxds, cv, rennes), shared by the site and the guidelines. */
import { roundRect, solid, hollow, stroke } from '@flogeez/murmuration';

const W = 720, H = 640;
/* ——— The brand's shapes ——— */
const STARLING_BODY = 'M140 48 C132 34 108 32 98 46 C88 60 86 80 84 100 C82 130 70 160 52 192 L68 194 C80 176 92 164 102 156 C130 146 150 120 146 88 C145 78 143 70 140 66 Z';
const STARLING_BEAK = 'M138 49 L172 59 L139 65 Z';
export const shapes = {
  // The starling of the logo, the eye left open
  starling: (g) => {
    solid(g); g.save(); g.translate(W / 2, H / 2); g.scale(3.4, 3.4); g.translate(-112, -115);
    g.fill(new Path2D(STARLING_BODY)); g.fill(new Path2D(STARLING_BEAK));
    hollow(g); g.beginPath(); g.arc(125, 54, 8, 0, 6.2832); g.fill();
    g.restore(); solid(g);
  },
  // At work: the chip (the AI icon) with code inside — code, augmented by AI
  work: (g) => {
    solid(g); g.strokeStyle = '#000';
    roundRect(g, 190, 150, 340, 340, 44); g.fill();
    [250, 360, 470].forEach((p) => { roundRect(g, p - 16, 70, 32, 90, 12); g.fill(); roundRect(g, p - 16, 480, 32, 90, 12); g.fill(); roundRect(g, 110, p - 16 + 0, 90, 32, 12); g.fill(); roundRect(g, 520, p - 16, 90, 32, 12); g.fill(); });
    hollow(g); g.lineWidth = 34; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(315, 250); g.lineTo(255, 320); g.lineTo(315, 390); g.moveTo(405, 250); g.lineTo(465, 320); g.lineTo(405, 390); g.stroke();
    solid(g);
  },
  // Angular Tiptap Editor: its logo — the sketched pencil and the A T E keys (writes text: sample after the fonts load)
  editor: (g) => {
    const font = `800 128px "Bricolage Grotesque", "Arial Black", system-ui, sans-serif`;
    solid(g);
    g.beginPath(); g.moveTo(100, 200); g.lineTo(178, 200); g.lineTo(98, 440); g.quadraticCurveTo(93, 452, 80, 452); g.lineTo(28, 452); g.quadraticCurveTo(14, 452, 19, 438); g.closePath(); g.fill();
    hollow(g); g.beginPath(); g.arc(178, 200, 22, 0, 6.2832); g.fill(); g.beginPath(); g.arc(184, 232, 16, 0, 6.2832); g.fill();
    solid(g);
    // outlined keys, solid letters: easier to read with few birds
    const keys = [[190, 'A'], [365, 'T'], [540, 'E']];
    g.strokeStyle = '#000'; g.lineWidth = 16;
    keys.forEach(([x]) => { roundRect(g, x + 8, 244, 148, 156, 32); g.stroke(); });
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    keys.forEach(([x, l]) => g.fillText(l, x + 82, 324));
  },
  // AI tooling at MaxDS: its symbol (the square, the three dots, the D)
  maxds: (g) => {
    const k = 440 / 520, X = (x) => 140 + (x - 1480) * k, Y = (y) => 100 + y * k, L = (v) => v * k;
    solid(g); roundRect(g, X(1480), Y(0), L(520), L(497), L(26)); g.fill();
    hollow(g);
    [[1585, 105], [1538, 216], [1585, 327]].forEach(([x, y]) => { g.beginPath(); g.rect(X(x), Y(y), L(66), L(66)); g.fill(); });
    g.beginPath(); g.moveTo(X(1693), Y(60)); g.lineTo(X(1727), Y(60)); g.arc(X(1727), Y(249), L(189), -Math.PI / 2, Math.PI / 2); g.lineTo(X(1693), Y(438)); g.lineTo(X(1693), Y(372)); g.lineTo(X(1727), Y(372));
    g.arc(X(1727), Y(249), L(123), Math.PI / 2, -Math.PI / 2, true); g.lineTo(X(1693), Y(126)); g.closePath(); g.fill();
    solid(g);
  },
  // Rennes: the map pin, and inside it the time it is there (see rennes.key below)
  rennes: (g, time = new Date()) => {
    const [h, m] = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(time).filter((p) => p.type !== 'literal').map((p) => +p.value);
    const cx = 360, cy = 250;
    solid(g); g.beginPath();
    g.moveTo(cx, 600); g.bezierCurveTo(cx - 80, 500, cx - 210, 380, cx - 210, 250); g.bezierCurveTo(cx - 210, 120, cx - 115, 40, cx, 40); g.bezierCurveTo(cx + 115, 40, cx + 210, 120, cx + 210, 250); g.bezierCurveTo(cx + 210, 380, cx + 80, 500, cx, 600); g.fill();
    hollow(g); g.beginPath(); g.arc(cx, cy, 128, 0, 6.2832); g.fill();
    solid(g); g.strokeStyle = '#000';
    const am = (m / 60) * 6.2832 - 1.5708, ah = ((h % 12) / 12 + m / 720) * 6.2832 - 1.5708;
    stroke(g, cx, cy, cx + Math.cos(am) * 100, cy + Math.sin(am) * 100, 30);
    stroke(g, cx, cy, cx + Math.cos(ah) * 66, cy + Math.sin(ah) * 66, 36);
    [0, 1, 2, 3].forEach((i) => { const a = i * 1.5708; stroke(g, cx + Math.cos(a) * 108, cy + Math.sin(a) * 108, cx + Math.cos(a) * 118, cy + Math.sin(a) * 118, 22); });
  },
  // MaxDS CV: the timeline of a MaxDS CV — three diamonds on a dashed thread, each with its title and a shorter line
  cv: (g) => {
    solid(g);
    [150, 320, 490].forEach((y) => {
      g.beginPath(); g.moveTo(196, y - 64); g.lineTo(260, y); g.lineTo(196, y + 64); g.lineTo(132, y); g.closePath(); g.fill();
      roundRect(g, 300, y - 44, 290, 42, 21); g.fill(); roundRect(g, 300, y + 12, 180, 34, 17); g.fill();
    });
    [226, 396].forEach((y) => { roundRect(g, 189, y, 14, 18, 7); g.fill(); });
  },
  // The hoop and the ball
  basket: (g) => {
    solid(g); g.strokeStyle = '#000';
    roundRect(g, 110, 40, 380, 250, 18); g.fill();
    hollow(g); roundRect(g, 140, 70, 320, 190, 8); g.fill();
    solid(g); g.lineWidth = 24; g.lineJoin = 'round'; g.beginPath(); g.rect(245, 155, 110, 85); g.stroke();
    g.lineWidth = 20; g.beginPath(); g.ellipse(300, 290, 100, 18, 0, 0, 6.2832); g.stroke();
    [[210, 300, 240, 450], [390, 300, 360, 450], [270, 308, 284, 450], [330, 308, 316, 450]].forEach(([a, b, c, d]) => stroke(g, a, b, c, d, 18));
    stroke(g, 232, 400, 368, 400, 18);
    const bx = 560, by = 450, r = 116;
    g.beginPath(); g.arc(bx, by, r, 0, 6.2832); g.fill();
    hollow(g); g.lineWidth = 22; g.lineCap = 'round';
    g.beginPath(); g.moveTo(bx - r, by); g.lineTo(bx + r, by); g.moveTo(bx, by - r); g.lineTo(bx, by + r);
    g.moveTo(bx - 80, by - 84); g.quadraticCurveTo(bx - 26, by, bx - 80, by + 84); g.moveTo(bx + 80, by - 84); g.quadraticCurveTo(bx + 26, by, bx + 80, by + 84); g.stroke();
    solid(g);
  },
};
// A shape that changes carries its own cache key: Rennes changes every minute (the time in Rennes)
shapes.rennes.key = () => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }).format(new Date());
