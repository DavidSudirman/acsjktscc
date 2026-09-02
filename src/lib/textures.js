import * as THREE from "three";

const cache = new Map();
const memo = (key, make) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};

function canvas(size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")];
}

/** Fine technical grid — the ground plane of the whole world. */
export const gridTexture = () =>
  memo("grid", () => {
    const S = 512;
    const [c, ctx] = canvas(S);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const p = (i / 8) * S;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, S);
      ctx.moveTo(0, p);
      ctx.lineTo(S, p);
      ctx.stroke();
    }
    // Heavier every 4th line, so the grid reads at two scales.
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, S, S);

    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  });

/** Soft round falloff — particles, cloud puffs, light motes. */
export const softSprite = () =>
  memo("soft", () => {
    const S = 128;
    const [c, ctx] = canvas(S);
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  });

/** Value noise — breaks up flat metal so it reads as machined, not CG. */
export const noiseTexture = () =>
  memo("noise", () => {
    const S = 256;
    const [c, ctx] = canvas(S);
    const img = ctx.createImageData(S, S);
    for (let i = 0; i < S * S; i++) {
      const v = 130 + Math.random() * 80;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });

/** Horizontal scan lines — used on the Web/AI panels. */
export const scanTexture = () =>
  memo("scan", () => {
    const S = 128;
    const [c, ctx] = canvas(S);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let y = 0; y < S; y += 4) ctx.fillRect(0, y, S, 1);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });

/** Build them all up front so loading progress means something. */
export function warmTextures() {
  gridTexture();
  softSprite();
  noiseTexture();
  scanTexture();
}
