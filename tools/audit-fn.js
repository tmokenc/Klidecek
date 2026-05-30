// Injected into the page. Defines window.__auditBlock(blockEl) -> issues[].
function relLum(rgb){
  const f = c => { c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
  return 0.2126*f(rgb[0])+0.7152*f(rgb[1])+0.0722*f(rgb[2]);
}
function parseRGB(s){
  if(!s) return null;
  const m = s.match(/rgba?\(([^)]+)\)/); if(!m) return null;
  const p = m[1].split(',').map(x=>parseFloat(x));
  if(p.length>=4 && p[3]===0) return null;
  return [p[0],p[1],p[2], p[3]===undefined?1:p[3]];
}
function contrast(a,b){ const L1=relLum(a),L2=relLum(b); const hi=Math.max(L1,L2),lo=Math.min(L1,L2); return (hi+0.05)/(lo+0.05); }
function effBg(el){
  let n = el;
  while(n && n!==document.documentElement){
    const c = getComputedStyle(n).backgroundColor; const rgb = parseRGB(c);
    if(rgb) return rgb; n = n.parentElement;
  }
  return [20,22,30,1];
}
function shapeBehind(el, cx, cy){
  const stack = document.elementsFromPoint(cx, cy);
  for(const e of stack){
    if(e===el) continue;
    const t = e.tagName.toLowerCase();
    if(['text','tspan'].includes(t)) continue;
    if(['rect','circle','ellipse','path','polygon','polyline'].includes(t)){
      const f = parseRGB(getComputedStyle(e).fill);
      if(f) return f;
    }
    if(!(e instanceof SVGElement)){
      const bg = parseRGB(getComputedStyle(e).backgroundColor);
      if(bg) return bg;
    }
  }
  return null;
}
window.__auditBlock = function(block){
  const issues = [];
  const cardBg = effBg(block);
  // 1) text contrast vs the shape actually behind it
  for(const el of block.querySelectorAll('text, tspan')){
    const txt = (el.textContent||'').trim();
    if(!txt) continue;
    if(el.children && el.children.length && el.tagName.toLowerCase()==='text') continue; // wrapper text containing tspans
    const r = el.getBoundingClientRect();
    if(r.width<1 || r.height<1) continue;
    const cs = getComputedStyle(el);
    let fill = parseRGB(cs.fill);
    if(!fill || parseFloat(cs.fillOpacity)===0) continue;
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const bg = shapeBehind(el, cx, cy) || cardBg;
    const cr = contrast(fill, bg);
    if(cr < 1.9){
      issues.push({kind:'low-contrast-text', text:txt.slice(0,36), fill:cs.fill, bg:'rgb('+bg.slice(0,3).map(Math.round).join(',')+')', contrast:+cr.toFixed(2)});
    }
  }
  // 2) glaring pure-white / pure-black fills
  for(const el of block.querySelectorAll('rect, circle, ellipse, path, polygon')){
    const cs = getComputedStyle(el);
    const fill = parseRGB(cs.fill);
    if(!fill) continue;
    if(parseFloat(cs.fillOpacity)===0) continue;
    const r = el.getBoundingClientRect();
    const area = r.width*r.height;
    if(area < 250) continue;
    const pureWhite = fill[0]>248 && fill[1]>248 && fill[2]>248;
    const pureBlack = fill[0]<8 && fill[1]<8 && fill[2]<8;
    if(pureWhite || pureBlack){
      issues.push({kind: pureWhite?'white-fill':'black-fill', tag:el.tagName.toLowerCase(), fill:cs.fill, areaPx:Math.round(area)});
    }
  }
  // 3) SVG content past viewBox (clipping)
  for(const svg of block.querySelectorAll('svg')){
    const vb = svg.getAttribute('viewBox');
    if(!vb) continue;
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    const [vx,vy,vw,vh] = parts;
    if(!vw || vw<16) continue;
    let bbox; try{ bbox = svg.getBBox(); }catch(e){ continue; }
    if(bbox.width===0 && bbox.height===0){ issues.push({kind:'empty-svg', viewBox:vb}); continue; }
    const eps = 1.5;
    const sides = [];
    if((bbox.x+bbox.width)-(vx+vw)>eps) sides.push('right+'+((bbox.x+bbox.width)-(vx+vw)).toFixed(0));
    if((bbox.y+bbox.height)-(vy+vh)>eps) sides.push('bottom+'+((bbox.y+bbox.height)-(vy+vh)).toFixed(0));
    if(vx-bbox.x>eps) sides.push('left+'+(vx-bbox.x).toFixed(0));
    if(vy-bbox.y>eps) sides.push('top+'+(vy-bbox.y).toFixed(0));
    if(sides.length) issues.push({kind:'svg-overflow', viewBox:vb, sides, bbox:[bbox.x,bbox.y,bbox.width,bbox.height].map(n=>+n.toFixed(0))});
  }
  // 4) DOM horizontal overflow inside the block
  if(block.scrollWidth - block.clientWidth > 3){
    issues.push({kind:'dom-hscroll', scrollW:block.scrollWidth, clientW:block.clientWidth});
  }
  return issues;
};
