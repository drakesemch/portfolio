import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react';

export const Route = createFileRoute('/games/tic-tac-toe')({
  component: RouteComponent,
});

function RouteComponent() {
  const defaultState = Array.from({ length: 3 }).map(() => Array.from({ length: 3 }).map(() => "-"));
  const [turn, setTurn] = useState("x");
  const [board, setBoard] = useState(defaultState);

  // Util copied from AP CSP CPT written by me (May 2026)!
  const SIZE = 3;
  function isWin(): boolean {
    // across (filled row) win
    outer: for (let r = 0; r < SIZE; r++) {
      let start = board[r]![0];

      if (start == "-") continue outer;

      for (let c = 1; c < SIZE; c++) {
        if (start != board[r]![c]) continue outer;
      }

      return true;
    }

    // downward (filled col) win
    outer: for (let c = 0; c < SIZE; c++) {
      let start = board[0]![c];

      if (start == "-") continue outer;

      for (let r = 1; r < SIZE; r++) {
        if (start != board[r]![c]) continue outer;
      }

      return true;
    }

    // cross (top left diag) win
    outer: {
      let start = board[0]![0];

      if (start == "-") break outer;

      for (let i = 1; i < SIZE; i++) {
        1;
        if (start != board[i]![i]) break outer;
      }

      return true;
    }

    // cross (bottom left diag) win
    outer: {
      let start = board[SIZE - 1]![0];

      if (start == "-") break outer;

      for (let i = 1; i < SIZE; i++) {
        if (start != board[SIZE - 1 - i]![i]) break outer;
      }

      return true;
    }

    return false;
  }
  // END SEGMENT

  const status = useMemo(() => {
    if (isWin()) {
      return `${turn == "x" ? "o" : "x"} won!`;
    }
    if (board.every((r) => r.every((c) => c !== "-"))) {
      return `It is a tie!`;
    }
    return `It is player ${turn}'s turn!`;
  }, [turn]);

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <h1 className="h1 text-center">
        Tic-Tac-Toe
      </h1>
      <div className="flex items-center gap-2 mb-6">
        <p className="text-muted-foreground">{status}</p>
        <Button variant="link" className="p-0! h-auto cursor-pointer" onClick={() => {
          setBoard(defaultState);
          setTurn("x");
        }}>
          Reset
        </Button>
      </div>
      <div className="grid place-items-center">
        <div className="size-96 flex flex-col">
          {board.map((r, ri) => (
            <div className={cn("flex flex-1", ri != 0 && "border-t-4 border-primary/30!")}>
              {r.map((c, ci) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-none flex-1 w-full h-full grid place-items-center text-5xl hover:bg-secondary/30! font-mono transition-none cursor-pointer",
                    ci != 0 && "border-l-4 border-primary/30!",
                    c == "-" && "text-muted-foreground",
                    c == "x" && "text-red-500!",
                    c == "o" && "text-blue-500!"
                  )}
                  onClick={() => {
                    if (c !== "-") return;
                    setBoard((b) => b.map((nr, nri) => nr.map((nc, nci) => nri === ri && nci === ci ? turn : nc)));
                    setTurn(turn === "x" ? "o" : "x");
                  }}
                  disabled={isWin() || c !== "-"}
                >{c}</Button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
