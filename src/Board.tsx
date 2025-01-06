import { GameProps, RuleItem } from "./Game";
import { css, cx } from "@emotion/css";

export function TicTacToeBoard({ G, moves, ctx }: GameProps) {
  return (
    <div className="max-h-screen space-y-2 overflow-hidden">
      <CellRules G={G} moves={moves} ctx={ctx} />
      <div className="grid grid-cols-5 gap-1 w-80">
        {G.lastRow.map((cell, index) => (
          <div
            key={index}
            className={cx(
              "aspect-square border border-red-300 flex items-center justify-center transition",
              cell === 1 ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            )}
          />
        ))}
      </div>
      <div className="grid aspect-square grid-cols-5 gap-1 grid-rows-5 w-80">
        {G.cells.map((col, colIndex) =>
          col.map((cell, rowIndex) => {
            return (
              <div
                key={colIndex + rowIndex}
                className={cx(
                  "aspect-square border flex items-center justify-center transition",
                  cell === 1
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-900",
                  css({
                    transitionDelay:
                      ctx.activePlayers?.[ctx.currentPlayer] === "viewChanges"
                        ? `${colIndex * 0.3}s`
                        : undefined,
                  })
                )}
              />
            );
          })
        )}
      </div>

      <Scores G={G} />
    </div>
  );
}

function CellRules({ G, moves, ctx }: Pick<GameProps, "G" | "moves" | "ctx">) {
  return (
    <div>
      <div className="grid grid-cols-8 gap-1">
        {Object.entries(G.cellRules).map(([rule, value]) => {
          const rules = rule.split("") as [RuleItem, RuleItem, RuleItem];

          return (
            <div key={rule} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {rules.map((rule, i) => (
                  <div
                    key={rule + i}
                    className={cx(
                      "size-4 border",
                      rule === "1" ? "bg-gray-900" : "bg-white",
                      i === 1 && "border-red-300"
                    )}
                  />
                ))}
              </div>
              <span>=</span>
              <div
                onClick={() => moves.clickCell(rule as RuleItem)}
                className={cx(
                  "size-4 border cursor-pointer",
                  value === 1 ? "bg-gray-900" : "bg-white"
                )}
              />
            </div>
          );
        })}
      </div>
      {ctx.activePlayers?.[ctx.currentPlayer] === "updateRules" ? (
        <button
          className="border px-2 py-1"
          onClick={() => moves.submitRules()}
        >
          Go!
        </button>
      ) : (
        <button className="border px-2 py-1" onClick={() => moves.endTurn()}>
          End Turn!
        </button>
      )}
    </div>
  );
}

function Scores({ G }: Pick<GameProps, "G">) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {Object.entries(G.score).map(([playerID, score]) => (
        <div key={playerID} className="flex items-center gap-1">
          <span>Player {playerID}:</span>
          <span>{score}</span>
        </div>
      ))}
    </div>
  );
}
