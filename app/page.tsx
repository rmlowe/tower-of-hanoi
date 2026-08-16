"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Towers = number[][];
const PEG_NAMES = ["Origin", "Waystation", "Home"];

function makeTowers(count: number): Towers {
  return [Array.from({ length: count }, (_, index) => count - index), [], []];
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function stateKey(towers: Towers, diskCount: number) {
  const positions = Array(diskCount).fill(0);
  towers.forEach((tower, peg) => tower.forEach((disk) => (positions[disk - 1] = peg)));
  return positions.join("");
}

function shortestHint(towers: Towers, diskCount: number): [number, number] | null {
  const start = stateKey(towers, diskCount);
  const goal = "2".repeat(diskCount);
  if (start === goal) return null;
  const queue: { key: string; first?: [number, number] }[] = [{ key: start }];
  const seen = new Set([start]);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    const positions = current.key.split("").map(Number);
    const top = [Infinity, Infinity, Infinity];
    positions.forEach((peg, index) => { top[peg] = Math.min(top[peg], index + 1); });
    for (let from = 0; from < 3; from += 1) {
      if (top[from] === Infinity) continue;
      for (let to = 0; to < 3; to += 1) {
        if (from === to || top[from] > top[to]) continue;
        const next = [...positions];
        next[top[from] - 1] = to;
        const key = next.join("");
        if (seen.has(key)) continue;
        const first: [number, number] = current.first ?? [from, to];
        if (key === goal) return first;
        seen.add(key);
        queue.push({ key, first });
      }
    }
  }
  return null;
}

export default function Home() {
  const [diskCount, setDiskCount] = useState(4);
  const [towers, setTowers] = useState<Towers>(() => makeTowers(4));
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<Towers[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("Move the tower from Origin to Home.");
  const [focusPeg, setFocusPeg] = useState(0);

  const optimalMoves = 2 ** diskCount - 1;
  const won = towers[2].length === diskCount;

  useEffect(() => {
    if (!started || won) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, won]);

  useEffect(() => {
    if (won) {
      setSelectedPeg(null);
      setMessage(moves === optimalMoves ? "Perfect. Every move was essential." : "Tower complete. Nicely reasoned.");
    }
  }, [won, moves, optimalMoves]);

  const reset = useCallback((count = diskCount) => {
    setTowers(makeTowers(count));
    setSelectedPeg(null);
    setMoves(0);
    setHistory([]);
    setSeconds(0);
    setStarted(false);
    setMessage("Move the tower from Origin to Home.");
    setFocusPeg(0);
  }, [diskCount]);

  const choosePeg = useCallback((peg: number) => {
    if (won) return;
    if (selectedPeg === null) {
      if (towers[peg].length === 0) {
        setMessage("That tower is empty. Choose one with a disk.");
        return;
      }
      setSelectedPeg(peg);
      setMessage(`Disk ${towers[peg][towers[peg].length - 1]} is ready to move.`);
      return;
    }
    if (selectedPeg === peg) {
      setSelectedPeg(null);
      setMessage("Move cancelled. Choose a tower.");
      return;
    }
    const source = towers[selectedPeg];
    const target = towers[peg];
    const disk = source[source.length - 1];
    const targetTop = target[target.length - 1];
    if (targetTop !== undefined && targetTop < disk) {
      setMessage("A larger disk can’t sit on a smaller one.");
      return;
    }
    setHistory((items) => [...items, towers.map((tower) => [...tower])]);
    setTowers((current) => {
      const next = current.map((tower) => [...tower]);
      next[selectedPeg].pop();
      next[peg].push(disk);
      return next;
    });
    setMoves((value) => value + 1);
    setStarted(true);
    setSelectedPeg(null);
    setFocusPeg(peg);
    setMessage(`Disk ${disk} moved to ${PEG_NAMES[peg]}.`);
  }, [selectedPeg, towers, won]);

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setTowers(previous);
    setHistory((items) => items.slice(0, -1));
    setMoves((value) => Math.max(0, value - 1));
    setSelectedPeg(null);
    setMessage("Last move undone.");
  };

  const showHint = () => {
    const hint = shortestHint(towers, diskCount);
    if (!hint) return;
    setSelectedPeg(hint[0]);
    setFocusPeg(hint[1]);
    setMessage(`Try ${PEG_NAMES[hint[0]]} → ${PEG_NAMES[hint[1]]}.`);
  };

  const onBoardKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      setFocusPeg((value) => (value + direction + 3) % 3);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choosePeg(focusPeg);
    }
  };

  const statusLabel = useMemo(() => {
    if (won) return "Solved";
    if (selectedPeg !== null) return "Choose a destination";
    return moves === 0 ? "Ready" : "In progress";
  }, [won, selectedPeg, moves]);

  return (
    <main className="game-shell">
      <header className="topbar">
        <a className="brand" href="#game" aria-label="Tower of Hanoi home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>TOWER / 01</span>
        </a>
        <span className={`status-pill ${won ? "complete" : ""}`}><i /> {statusLabel}</span>
      </header>

      <section className="hero" id="game">
        <div className="hero-copy">
          <p className="eyebrow">A study in recursion</p>
          <h1>Tower<br />of Hanoi</h1>
          <p className="intro">Move every disk to <strong>Home</strong>. One disk at a time. Never place a larger disk on a smaller one.</p>
        </div>
        <aside className="stats" aria-label="Game statistics">
          <div><span>Moves</span><strong>{String(moves).padStart(2, "0")}</strong></div>
          <div><span>Best possible</span><strong>{optimalMoves}</strong></div>
          <div><span>Time</span><strong>{formatTime(seconds)}</strong></div>
        </aside>
      </section>

      <section className={`board-card ${won ? "is-won" : ""}`}>
        <div className="board-toolbar">
          <div className="level-picker" aria-label="Number of disks">
            <span>Disks</span>
            {[3, 4, 5, 6, 7].map((count) => (
              <button key={count} className={diskCount === count ? "active" : ""} onClick={() => { setDiskCount(count); reset(count); }} aria-pressed={diskCount === count}>{count}</button>
            ))}
          </div>
          <div className="actions">
            <button onClick={showHint} disabled={won}>Hint</button>
            <button onClick={undo} disabled={history.length === 0}>Undo</button>
            <button className="reset" onClick={() => reset()}>Reset</button>
          </div>
        </div>

        <div className="board" role="group" aria-label="Tower of Hanoi board. Use left and right arrows to choose a tower, then Enter to select it." tabIndex={0} onKeyDown={onBoardKeyDown}>
          {towers.map((tower, pegIndex) => (
            <button className={`peg-zone ${selectedPeg === pegIndex ? "selected" : ""} ${focusPeg === pegIndex ? "focused" : ""}`} key={pegIndex} onClick={() => choosePeg(pegIndex)} onFocus={() => setFocusPeg(pegIndex)} aria-label={`${PEG_NAMES[pegIndex]} tower, ${tower.length} disks${selectedPeg === pegIndex ? ", selected" : ""}`}>
              <span className="peg-number">0{pegIndex + 1}</span>
              <span className="peg" aria-hidden="true" />
              <span className="disk-stack" aria-hidden="true">
                {tower.map((disk, level) => (
                  <span className={`disk disk-${disk}`} key={disk} style={{ width: `${34 + (disk / diskCount) * 58}%`, bottom: `${level * 31}px`, zIndex: level + 2 }}><i>{disk}</i></span>
                ))}
              </span>
              <span className="base" aria-hidden="true" />
              <span className="peg-label">{PEG_NAMES[pegIndex]}</span>
            </button>
          ))}
          {won && (
            <div className="win-panel" role="status">
              <span className="win-kicker">Puzzle complete</span>
              <strong>{moves} moves · {formatTime(seconds)}</strong>
              <button onClick={() => reset()}>Play again</button>
            </div>
          )}
        </div>

        <div className="message-bar" aria-live="polite">
          <span className="message-icon">↳</span><span>{message}</span>
          <span className="keyboard-note">← → choose &nbsp; · &nbsp; Enter move</span>
        </div>
      </section>

      <footer><span>The ancient puzzle, made in London.</span><span>Goal · All disks on Home</span></footer>
    </main>
  );
}
