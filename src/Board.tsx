import { Lock } from "lucide-react";
import { GameProps, RuleItem } from "./Game";
import { css, cx } from "@emotion/css";
import { Fragment } from "react/jsx-runtime";
import { useGame } from "./gameContext";
import { GameProvider } from "./gameContextProvider";
import { useState } from "react";

export function GameBoard(props: GameProps) {
  return (
    <GameProvider {...props}>
      {props.ctx.phase === "setup" ? <Setup /> : <CellDuelBoard />}
    </GameProvider>
  );
}

function Setup() {
  const { moves } = useGame();

  const [xSize, setXSize] = useState(5);
  const [ySize, setYSize] = useState(5);

  return (
    <div>
      <label className="select-none">
        <div>Board Width</div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={5}
            max={30}
            value={xSize}
            onChange={(e) => setXSize(parseInt(e.target.value))}
          />
          <span>{xSize}</span>
        </div>
      </label>
      <label className="select-none">
        <div>Board Height</div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={3}
            max={30}
            value={ySize}
            onChange={(e) => setYSize(parseInt(e.target.value))}
          />
          <span>{ySize}</span>
        </div>
      </label>

      <button
        className="px-2 py-1 border"
        onClick={() => {
          moves["startGame"]({ xSize, ySize });
        }}
      >
        Start
      </button>
    </div>
  );
}

function CellDuelBoard() {
  const { G, ctx } = useGame();

  return (
    <div className="max-h-screen space-y-2 overflow-hidden">
      <div className="grid grid-cols-2">
        <div className="">
          <div>Generation Rules</div>
          <CellRules />
        </div>
        <Scores />
      </div>
      <div className="w-80 space-y-2">
        <div
          className={cx(
            "grid gap-0.5",
            css({
              gridTemplateColumns: `repeat(${
                G.cells[0].length + 2
              }, minmax(0, 1fr))`,
            })
          )}
        >
          <div className="aspect-square border flex min-h-0 items-center justify-center transition bg-white text-gray-900">
            <Lock className="opacity-30" />
          </div>
          <div className="border border-red-300 contents">
            {G.lastRow.map((cell, index) => {
              return (
                <div
                  key={index}
                  className={cx(
                    "aspect-square flex items-center border min-h-0 justify-center transition",
                    cell === 1
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              );
            })}
          </div>
          <div className="aspect-square border flex min-h-0 items-center justify-center transition bg-gray-900 text-white">
            <Lock className="opacity-30" />
          </div>
        </div>
        <hr />
        <div
          className={cx(
            "grid gap-0.5",
            css({
              gridTemplateColumns: `repeat(${
                G.cells[0].length + 2
              }, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${G.cells.length}, minmax(0, 1fr))`,
            })
          )}
        >
          {G.cells.map((col, colIndex) => {
            return (
              <Fragment key={colIndex}>
                <div className="aspect-square min-h-0 border flex items-center justify-center transition bg-white text-gray-900">
                  <Lock className="opacity-30" />
                </div>
                {col.map((cell, rowIndex) => {
                  return (
                    <div
                      key={"" + colIndex + rowIndex}
                      className={cx(
                        "aspect-square border flex min-h-0 items-center justify-center transition",
                        cell === 1
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-900",
                        css({
                          transitionDelay:
                            ctx.activePlayers?.[ctx.currentPlayer] ===
                            "viewChanges"
                              ? `${colIndex * (1 / G.setupArgs.ySize) * 0.5}s`
                              : undefined,
                        })
                      )}
                    />
                  );
                })}
                <div className="aspect-square border min-h-0 flex items-center justify-center transition bg-gray-900 text-white">
                  <Lock className="opacity-30" />
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CellRules() {
  const { G, moves, ctx, undo } = useGame();

  return (
    <div>
      <div
        className={cx(
          "grid grid-rows-8 gap-0.5",
          G.genRuleChangesRemaining === 0 && "opacity-50"
        )}
      >
        {Object.entries(G.cellRules).map(([rule, value]) => {
          const rules = rule.split("") as [RuleItem, RuleItem, RuleItem];

          return (
            <div key={rule} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {rules.map((rule, i) => (
                  <div
                    key={"" + rule + i}
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
        <div className="flex gap-2">
          <button
            className={cx(
              "border px-2 py-1",
              G.genRuleChangesRemaining > 0 && "opacity-50"
            )}
            disabled={G.genRuleChangesRemaining > 0}
            onClick={() => undo()}
          >
            Undo
          </button>
          <button
            className={cx(
              "border px-2 py-1",
              G.genRuleChangesRemaining > 0 && "opacity-50"
            )}
            onClick={() => moves.submitRules()}
            disabled={G.genRuleChangesRemaining > 0}
          >
            Go!
          </button>
        </div>
      ) : (
        <button className="border px-2 py-1" onClick={() => moves.endTurn()}>
          End Turn
        </button>
      )}
    </div>
  );
}

function playerIdToName(playerId: string) {
  if (playerId === "0") {
    return "Black";
  } else {
    return "White";
  }
}

function Scores() {
  const { G, ctx } = useGame();

  return (
    <div className="">
      <div>Score:</div>
      {Object.entries(G.score).map(([playerID, score]) => (
        <div key={playerID} className="flex items-center gap-1">
          <div
            className={cx(
              "size-3 rounded-full",
              ctx.activePlayers?.[playerID] && "bg-black"
            )}
          ></div>
          <span>{playerIdToName(playerID)}:</span>
          <span>{score}</span>
        </div>
      ))}
    </div>
  );
}
