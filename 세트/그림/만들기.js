const { chromium } = require('playwright');
const OUT = '/home/user/math-hub/세트/그림/';
const K = '#1f2430', BLUE = '#2f5bff', FILL = 'rgba(47,91,255,.14)', RED = '#e0453a';
function fig(o) {
  // o: {cx,cy,r,d,ta,tc,ticksOM,ticksChord,radii,shade,s(scale)}
  const {cx, cy, r, d} = o, out = [];
  const P = (x, y) => x.toFixed(1) + ',' + y.toFixed(1);
  const chord = (t, n1, n2, nm) => {
    const a = t * Math.PI / 180, ux = Math.cos(a), uy = -Math.sin(a);       // O→M 방향
    const M = [cx + d * ux, cy + d * uy], h = Math.sqrt(r * r - d * d), vx = -uy, vy = ux;
    const A = [M[0] + h * vx, M[1] + h * vy], B = [M[0] - h * vx, M[1] - h * vy];
    return { M, A, B, ux, uy, vx, vy, n1, n2, nm };
  };
  const c1 = chord(o.ta, 'A', 'B', 'M'), c2 = chord(o.tc, 'C', 'D', 'N');
  const lbl = (pt, dx, dy, t, sz) => `<text x="${pt[0] + dx}" y="${pt[1] + dy}" font-size="${sz || 30}" font-style="italic" font-family="Liberation Serif,serif" fill="${K}" text-anchor="middle" dominant-baseline="central">${t}</text>`;
  if (o.shade) [c1, c2].forEach(c => out.push(`<polygon points="${P(cx, cy)} ${P(c.A[0], c.A[1])} ${P(c.M[0], c.M[1])}" fill="${FILL}"/>`));
  out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${K}" stroke-width="3"/>`);
  [c1, c2].forEach(c => {
    out.push(`<line x1="${c.A[0]}" y1="${c.A[1]}" x2="${c.B[0]}" y2="${c.B[1]}" stroke="${K}" stroke-width="3"/>`);
    out.push(`<line x1="${cx}" y1="${cy}" x2="${c.M[0]}" y2="${c.M[1]}" stroke="${BLUE}" stroke-width="3"/>`);
    const s = 16, p1 = [c.M[0] + s * c.vx, c.M[1] + s * c.vy], p3 = [c.M[0] - s * c.ux, c.M[1] - s * c.uy], p2 = [p1[0] - s * c.ux, p1[1] - s * c.uy];
    out.push(`<polyline points="${P(...p1)} ${P(...p2)} ${P(...p3)}" fill="none" stroke="${BLUE}" stroke-width="2"/>`);
    if (o.radii) out.push(`<line x1="${cx}" y1="${cy}" x2="${c.A[0]}" y2="${c.A[1]}" stroke="${K}" stroke-width="2.5" stroke-dasharray="${o.radiiDash ? '8 6' : ''}"/>`);
    const tick = (X, Y, n, dx, dy) => { for (let k = 0; k < n; k++) { const off = (k - (n - 1) / 2) * 8, mx = X + off * dx, my = Y + off * dy; out.push(`<line x1="${mx - 11 * dy}" y1="${my + 11 * dx}" x2="${mx + 11 * dy}" y2="${my - 11 * dx}" stroke="${RED}" stroke-width="3"/>`); } };
    if (o.ticksOM) tick((cx + c.M[0]) / 2, (cy + c.M[1]) / 2, 1, c.ux, c.uy);
    if (o.ticksChord) [c.A, c.B].forEach(E => tick((E[0] + c.M[0]) / 2, (E[1] + c.M[1]) / 2, 2, c.vx, c.vy));
    const out_ = (E) => { const dx = E[0] - cx, dy = E[1] - cy, L = Math.hypot(dx, dy); return [dx / L * 24, dy / L * 24]; };
    out.push(lbl(c.A, ...out_(c.A), c.n1)); out.push(lbl(c.B, ...out_(c.B), c.n2));
    out.push(lbl(c.M, c.ux * 26 + c.vx * 4, c.uy * 26 + c.vy * 4, c.nm));
  });
  out.push(`<circle cx="${cx}" cy="${cy}" r="5" fill="${K}"/>`, lbl([cx, cy], 0, -24, 'O'));
  return out.join('');
}
const base = { cx: 250, cy: 250, r: 200, d: 120, ta: 150, tc: 290 };
const svgFig = (o, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${fig(Object.assign({}, base, o))}</svg>`;
const pages = {
  '1-성질1-그림.png': `<div class="fig">${svgFig({ ticksOM: 1 }, 500, 500)}<div class="pad"></div></div>`,
  '2-성질1-증명.png': `<div class="fig">${svgFig({ ticksOM: 1, radii: 1, shade: 1 }, 500, 500)}<div class="pad"></div></div>`,
  '3-성질2-증명.png': `<div class="fig">${svgFig({ ticksChord: 1, radii: 1, shade: 1 }, 500, 500)}<div class="pad"></div></div>`,
  '4-결론박스-성질1.png': `<div class="box"><div class="tt">📦 성질 ①</div><div class="row"><div class="tx"><b>원의 중심에서 같은 거리에 있는<br>두 현의 길이는 같다.</b><div class="eq">OM = ON &nbsp;⟹&nbsp; AB = CD</div><div class="why">근거: RHS 합동 → AM = CN → AB = 2AM = 2CN = CD</div></div>${svgFig({ ticksOM: 1 }, 500, 500).replace('width="500" height="500"', 'width="250" height="250"')}</div></div>`,
  '5-결론박스-정리.png': `<div class="box"><div class="tt">📦 정리 — 한 원에서</div><div class="row"><div class="tx"><div class="it"><span>①</span> 중심에서 같은 거리에 있는 두 현의<br>길이는 같다.<div class="eq s">OM = ON &nbsp;⟹&nbsp; AB = CD</div></div><div class="it"><span>②</span> 길이가 같은 두 현은 중심에서<br>같은 거리에 있다.<div class="eq s">AB = CD &nbsp;⟹&nbsp; OM = ON</div></div></div>${svgFig({}, 500, 500).replace('width="500" height="500"', 'width="250" height="250"')}</div></div>`,
};
const css = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500;700;900&display=block" rel="stylesheet"><style>
body{margin:0;background:#fff;font-family:"Noto Sans KR",sans-serif;color:${K}}
.fig{display:flex;width:900px;height:520px;align-items:center;padding-left:30px;background:#fff}.fig svg{margin-top:10px}.pad{flex:1}
.box{width:900px;box-sizing:border-box;margin:0;padding:26px 34px;border:5px solid ${BLUE};border-radius:22px;background:#f4f6ff}
.tt{display:inline-block;background:${BLUE};color:#fff;font-weight:900;font-size:28px;padding:4px 18px;border-radius:12px;margin-bottom:14px}
.row{display:flex;align-items:center;gap:20px}.tx{flex:1;font-size:29px;line-height:1.5}
.eq{margin-top:12px;font-size:34px;font-weight:900;color:${BLUE};font-family:"Liberation Serif","Noto Sans KR",serif;font-style:italic}.eq.s{font-size:28px;margin-top:4px}
.why{margin-top:12px;font-size:22px;color:#4a5266}.it{margin-bottom:14px;font-weight:700}.it span{color:${BLUE};margin-right:6px}
</style>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2, viewport: { width: 960, height: 700 } });
  for (const [f, h] of Object.entries(pages)) {
    await p.setContent(css + h, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    await (await p.$('body > div')).screenshot({ path: OUT + f });
  }
  await b.close();
})();
