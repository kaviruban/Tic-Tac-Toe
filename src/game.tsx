import React, { useState, useMemo, useEffect, useRef } from "react";

import "./App.css";

const CELEBRATION_DURATION_MS = 4500;
const CELEBRATION_GIF =
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGszeG14NnU0NWMycjU0Mmk5cGlxMmhya3doNDRxd2g4YmswZGpqMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mjzpnK2eBSuWs/giphy.gif";

const MIN_DIM = 3;
const MAX_DIM = 10;

type Player = "X" | "O";

type WinLine =
  | { type: "row"; index: number }
  | { type: "col"; index: number }
  | { type: "diag"; index: 0 }
  | { type: "anti"; index: 0 };

type WinnerResult =
  | { winner: Player; line: WinLine }
  | { winner: "draw"; line: null }
  | { winner: null; line: null };

function getWinner(board: string[], dimension: number): WinnerResult {
  const n = dimension;
  if (board.length !== n * n) return { winner: null, line: null };

  const get = (row: number, col: number) => board[row * n + col];

  const checkLine = (cells: string[]): Player | null => {
    const first = cells[0];
    if (!first) return null;
    if (cells.every((c) => c === first)) return first as Player;
    return null;
  };

  // Rows: same symbol across entire row
  for (let r = 0; r < n; r++) {
    const row = Array.from({ length: n }, (_, c) => get(r, c));
    const w = checkLine(row);
    if (w) return { winner: w, line: { type: "row", index: r } };
  }

  // Columns: same symbol down entire column
  for (let c = 0; c < n; c++) {
    const col = Array.from({ length: n }, (_, r) => get(r, c));
    const w = checkLine(col);
    if (w) return { winner: w, line: { type: "col", index: c } };
  }

  // Main diagonal: top-left to bottom-right (0,0) (1,1) ... (n-1,n-1)
  const mainDiag = Array.from({ length: n }, (_, i) => get(i, i));
  const w1 = checkLine(mainDiag);
  if (w1) return { winner: w1, line: { type: "diag", index: 0 } };

  // Anti diagonal: top-right to bottom-left (0,n-1) (1,n-2) ... (n-1,0)
  const antiDiag = Array.from({ length: n }, (_, i) => get(i, n - 1 - i));
  const w2 = checkLine(antiDiag);
  if (w2) return { winner: w2, line: { type: "anti", index: 0 } };

  if (board.every((c) => c !== "")) return { winner: "draw", line: null };
  return { winner: null, line: null };
}

export const Game = () => {
  const [dimension, setDimension] = useState(3);
  const [board, setBoard] = useState<string[]>(() =>
    Array(dimension * dimension).fill(""),
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");

  const winnerResult = useMemo(
    () => getWinner(board, dimension),
    [board, dimension],
  );
  const winner = winnerResult.winner;
  const winLine = winnerResult.line;

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationRef = useRef<number | undefined>(undefined);
  const shouldShowRef = useRef(false);

  useEffect(() => {
    if (celebrationRef.current) clearTimeout(celebrationRef.current);

    if (winner && winner !== "draw") {
      shouldShowRef.current = true;
      // Schedule state update asynchronously to avoid cascading renders
      queueMicrotask(() => setShowCelebration(true));
      celebrationRef.current = window.setTimeout(
        () => setShowCelebration(false),
        CELEBRATION_DURATION_MS,
      );
    } else {
      shouldShowRef.current = false;
      // Schedule state update asynchronously to avoid cascading renders
      queueMicrotask(() => setShowCelebration(false));
    }

    return () => {
      if (celebrationRef.current) clearTimeout(celebrationRef.current);
    };
  }, [winner]);

  const handleDimensionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Math.min(MAX_DIM, Math.max(MIN_DIM, Number(e.target.value)));
    setDimension(value);
    setBoard(Array(value * value).fill(""));
    setCurrentPlayer("X");
  };

  const handleSelect = (index: number) => {
    if (board[index] !== "" || winner !== null) return;
    const next = [...board];
    next[index] = currentPlayer;
    setBoard(next);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const reset = () => {
    setBoard(Array(dimension * dimension).fill(""));
    setCurrentPlayer("X");
  };

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${dimension}, 1fr)`,
      gridTemplateRows: `repeat(${dimension}, 1fr)`,
    }),
    [dimension],
  );

  return (
    <div className="game-Container">
      {/* <OnBoarding /> */}

      {winner && winner !== "draw" && showCelebration && (
        <div className="celebration-overlay" aria-live="polite">
          <div className="celebration-content">
            <img src={CELEBRATION_GIF} alt="" className="celebration-gif" />
            <p className="celebration-text">Player {winner} wins!</p>
          </div>
        </div>
      )}

      <div className="game-controls">
        <label className="dimension-label">
          Layout dimension:
          <select
            className="dimension-select"
            value={dimension}
            onChange={handleDimensionChange}
            aria-label="Select dimension of the layout"
          >
            {Array.from(
              { length: MAX_DIM - MIN_DIM + 1 },
              (_, i) => MIN_DIM + i,
            ).map((d) => (
              <option key={d} value={d}>
                {d}×{d}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="reset-button"
          onClick={reset}
          disabled={winner === null}
        >
          Restart
        </button>
      </div>

      {winner === null && (
        <p className="turn-text">Current turn: {currentPlayer}</p>
      )}
      {winner !== null && (
        <div className="result-container">
          {winner === "draw" ? (
            <p className="result-text result-draw">It's a draw!</p>
          ) : (
            <p className="result-text result-win">Player {winner} wins!</p>
          )}
        </div>
      )}

      <div
        className={`layout-Container-wrapper${winner !== null ? " game-over" : ""}`}
      >
        <div className="layout-Container" style={gridStyle}>
          {board.map((cell, index) => (
            <div
              key={index}
              className="box-Container"
              onClick={() => handleSelect(index)}
            >
              {cell}
            </div>
          ))}
        </div>
        {winner && winner !== "draw" && winLine && (
          <div className="strike-overlay" style={gridStyle} aria-hidden>
            <div
              className={`strike-line strike-line-${winLine.type}`}
              style={
                winLine.type === "row"
                  ? { gridRow: winLine.index + 1, gridColumn: "1 / -1" }
                  : winLine.type === "col"
                    ? { gridColumn: winLine.index + 1, gridRow: "1 / -1" }
                    : winLine.type === "diag" || winLine.type === "anti"
                      ? { gridColumn: "1 / -1", gridRow: "1 / -1" }
                      : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
