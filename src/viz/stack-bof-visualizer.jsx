// stack-bof-visualizer — Stack frame layout + buffer overflow animation.
// Type input length; see write past buffer → RIP overwrite → shellcode jump.
import { useState } from "react";

const BUF_SIZE = 16;
const CANARY_SIZE = 8;
const SAVED_EBP = 8;
const SAVED_RIP = 8;

export default function StackBofVisualizer() {
  const [inputLen, setInputLen] = useState(8);
  const [canary, setCanary] = useState(false);
  const [aslr, setAslr] = useState(false);
  const [nx, setNx] = useState(false);

  // Layout (low → high addresses): buffer, [canary], saved EBP, saved RIP
  const totalWrite = inputLen;
  const bufWritten = Math.min(totalWrite, BUF_SIZE);
  const overflow = Math.max(0, totalWrite - BUF_SIZE);
  let canaryWritten = 0;
  let ebpWritten = 0;
  let ripWritten = 0;
  let rem = overflow;
  if (canary) {
    canaryWritten = Math.min(rem, CANARY_SIZE);
    rem -= canaryWritten;
  }
  ebpWritten = Math.min(rem, SAVED_EBP);
  rem -= ebpWritten;
  ripWritten = Math.min(rem, SAVED_RIP);

  const canaryBroken = canary && canaryWritten > 0;
  const ripOverwritten = ripWritten >= SAVED_RIP;

  let outcome, outcomeColor;
  if (totalWrite <= BUF_SIZE) {
    outcome = "no overflow — bezpečné";
    outcomeColor = "oklch(0.7 0.15 145)";
  } else if (canaryBroken) {
    outcome = "stack canary detect → __stack_chk_fail → abort";
    outcomeColor = "oklch(0.75 0.12 60)";
  } else if (!ripOverwritten) {
    outcome = "overflow do EBP — frame pointer corruption, ale RIP nezasažen";
    outcomeColor = "oklch(0.75 0.12 60)";
  } else if (nx && aslr) {
    outcome = "RIP overwrite → NX blokuje shellcode na stacku; ASLR brání ROP gadget guessingu";
    outcomeColor = "oklch(0.75 0.12 60)";
  } else if (nx) {
    outcome = "RIP overwrite → NX blokuje shellcode; nutný ROP chain (gadgets v libc)";
    outcomeColor = "oklch(0.7 0.15 30)";
  } else if (aslr) {
    outcome = "RIP overwrite → musíš leakovat adresu (ASLR bypass)";
    outcomeColor = "oklch(0.7 0.15 30)";
  } else {
    outcome = "RIP přepsán → jump na shellcode → shell ⚠";
    outcomeColor = "oklch(0.65 0.18 22)";
  }

  const W = 580, H = 250;

  // Slot rendering left → right (low addr → high addr)
  const slots = [
    { label: "char buf[16]", size: BUF_SIZE, written: bufWritten, color: "oklch(0.65 0.16 245)" },
    ...(canary ? [{ label: "canary", size: CANARY_SIZE, written: canaryWritten, color: "oklch(0.75 0.12 60)" }] : []),
    { label: "saved EBP", size: SAVED_EBP, written: ebpWritten, color: "oklch(0.7 0.15 30)" },
    { label: "saved RIP", size: SAVED_RIP, written: ripWritten, color: "oklch(0.6 0.2 25)" },
  ];
  const totalSize = slots.reduce((s, x) => s + x.size, 0);
  const pxPerByte = (W - 60) / totalSize;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap", fontSize: 11, alignItems: "center" }}>
        <div>
          input length = {inputLen} B
          <input type="range" min="1" max="48" value={inputLen} onChange={e => setInputLen(+e.target.value)}
            style={{ width: 220, marginLeft: 6, verticalAlign: "middle" }} />
        </div>
        <label><input type="checkbox" checked={canary} onChange={e => setCanary(e.target.checked)} /> stack canary</label>
        <label><input type="checkbox" checked={nx} onChange={e => setNx(e.target.checked)} /> NX / DEP</label>
        <label><input type="checkbox" checked={aslr} onChange={e => setAslr(e.target.checked)} /> ASLR</label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={30} y={25} fontSize="10" fill="var(--text-muted)">low addr →</text>
        <text x={W - 30} y={25} textAnchor="end" fontSize="10" fill="var(--text-muted)">high addr (stack grows down)</text>
        <text x={W / 2} y={25} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">stack frame</text>

        {(() => {
          let x = 30;
          return slots.map((s, i) => {
            const w = s.size * pxPerByte;
            const writtenW = s.written * pxPerByte;
            const rect = (
              <g key={i}>
                <rect x={x} y={40} width={w} height={50} fill="var(--bg-inset)" stroke="var(--line)" />
                <rect x={x} y={40} width={writtenW} height={50} fill={s.color} opacity="0.75" />
                <text x={x + w / 2} y={62} textAnchor="middle" fontSize="9.5" fill="var(--text)">{s.label}</text>
                <text x={x + w / 2} y={75} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{s.size} B</text>
                <text x={x + w / 2} y={86} textAnchor="middle" fontSize="9" fill="var(--text-faint)">
                  {s.written > 0 ? `${s.written}/${s.size}` : ""}
                </text>
              </g>
            );
            x += w;
            return rect;
          });
        })()}

        {/* Address arrow indicating where bytes go */}
        <text x={30} y={115} fontSize="10" fill="var(--accent)">strcpy(buf, input) →</text>
        <line x1={30 + Math.min(inputLen, 48) * pxPerByte} y1="110" x2={30 + Math.min(inputLen, 48) * pxPerByte} y2="95"
          stroke="var(--accent)" strokeWidth="2" markerEnd="url(#bof-up)" />
        <defs>
          <marker id="bof-up" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto">
            <path d="M0,6 L3,0 L6,6 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* outcome */}
        <rect x={20} y={160} width={W - 40} height={70} rx="4" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={W / 2} y={185} textAnchor="middle" fontSize="12" fontWeight="700" fill={outcomeColor}>{outcome}</text>
        <text x={30} y={205} fontSize="9.5" fill="var(--text-muted)" fontFamily="ui-monospace, monospace">
          bytes psané: {inputLen} | buf=16 {canary && "| canary=8 "}| EBP=8 | RIP=8
        </text>
        <text x={30} y={220} fontSize="9.5" fill="var(--text-faint)">
          {totalWrite > BUF_SIZE && !ripOverwritten ? "→ částečný overflow, ale RIP intact" :
           ripOverwritten ? "→ útočník kontroluje return address" :
           "→ vše do bufferu fits"}
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Mitigations: <b>canary</b> detect overwrite před returnem; <b>NX</b> blokuje shellcode execution na stacku;
        <b> ASLR</b> randomizuje adresy → útočník neví, kam skočit. Modern exploit: ROP gadgets + info leak bypass všech 3.
      </div>
    </div>
  );
}
