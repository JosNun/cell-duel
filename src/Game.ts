import { Ctx, Game } from "boardgame.io";
import { RandomAPI } from "boardgame.io/dist/types/src/plugins/random/random";
import type { BoardProps } from "boardgame.io/react";

type CellState = 1 | 0;

type RowState = CellState[];

type BoardState = RowState[];

export type RuleItem = "1" | "0";

export type RuleString = `${RuleItem}${RuleItem}${RuleItem}`;

type CellRules = {
  [key in RuleString]: CellState;
};

export const cellRules: CellRules = {
  "000": 0,
  "001": 1,
  "010": 0,
  "011": 1,
  "100": 1,
  "101": 0,
  "110": 1,
  "111": 0,
};

function getBlankRow(length: number): RowState {
  return new Array(length).fill(null).map(() => 0) as RowState;
}

interface SetupArgs {
  xSize: number;
  ySize: number;
}

interface GameState {
  setupArgs: SetupArgs;

  cellRules: CellRules;
  cells: BoardState;
  lastRow: RowState;
  score: Record<string, number>;
  genRuleChangesRemaining: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GameProps extends BoardProps<GameState> {}

function initGameState(
  ctx: Ctx,
  random: RandomAPI,
  G: Omit<
    GameState,
    "cellRules" | "cells" | "lastRow" | "score" | "genRuleChangesRemaining"
  > &
    Partial<GameState>,
  setupArgs: SetupArgs = {
    xSize: 5,
    ySize: 5,
  }
): void {
  const lastRow = Array(setupArgs.xSize)
    .fill(null)
    .map(() => Math.round(random.Number())) as RowState;

  G.cellRules = {
    "000": Math.round(random.Number()) as CellState,
    "001": Math.round(random.Number()) as CellState,
    "010": Math.round(random.Number()) as CellState,
    "011": Math.round(random.Number()) as CellState,
    "100": Math.round(random.Number()) as CellState,
    "101": Math.round(random.Number()) as CellState,
    "110": Math.round(random.Number()) as CellState,
    "111": Math.round(random.Number()) as CellState,
  };

  G.cells = Array(setupArgs.ySize).fill(
    getBlankRow(setupArgs.xSize)
  ) as BoardState;

  G.lastRow = lastRow;

  G.score = ctx.playOrder.reduce((acc, playerID) => {
    acc[playerID] = 0;
    return acc;
  }, {} as Record<string, number>);

  G.genRuleChangesRemaining = 0;
}

export const CellDuel: Game<GameState> = {
  setup: ({ random, ctx }) => {
    const initialState = {
      setupArgs: {
        xSize: 5,
        ySize: 5,
      },
    } satisfies Partial<GameState>;

    initGameState(ctx, random, initialState);

    return initialState as GameState;
  },

  moves: {},

  phases: {
    setup: {
      turn: {
        activePlayers: { currentPlayer: "all" },
      },
      moves: {
        startGame: ({ ctx, random, G, events }, setupArgs: SetupArgs) => {
          initGameState(ctx, random, G, setupArgs);
          events.endPhase();
        },
      },
      start: true,
      next: "play",
    },
    play: {},
  },
  turn: {
    activePlayers: { currentPlayer: "updateRules" },
    onBegin: ({ G }) => {
      G.genRuleChangesRemaining = 1;
    },
    onEnd({ G }) {
      G.lastRow = [...G.cells[G.cells.length - 1]];
      G.cells = G.cells.map((row) => [...row].fill(0));
    },
    stages: {
      updateRules: {
        next: "viewChanges",
        moves: {
          clickCell: ({ G }, rule: RuleString) => {
            if (G.genRuleChangesRemaining > 0) {
              G.cellRules[rule] = G.cellRules[rule] === 1 ? 0 : 1;
              G.genRuleChangesRemaining -= 1;
            }
          },
          submitRules: ({ G, events }) => {
            G.cells = computeRows(G.cellRules, G.cells, G.lastRow);
            events.endStage();
          },
        },
      },
      viewChanges: {
        moves: {
          endTurn: ({ events, G, playerID, ctx }) => {
            G.score[playerID] += G.cells.flat().reduce((acc, cell) => {
              if (playerID === ctx.playOrder[0]) {
                return acc + cell;
              } else {
                return acc + (1 - cell);
              }
            }, 0 as number);

            events.endTurn();
          },
        },
      },
    },
  },

  endIf: () => {},
};

function computeRows(
  cellRules: CellRules,
  cells: BoardState,
  lastRow: RowState
): BoardState {
  const newRows: BoardState = Array(cells.length).fill(
    getBlankRow(cells[0].length)
  ) as BoardState;
  for (let i = 0; i < cells.length; i++) {
    const prevRow = i === 0 ? lastRow : newRows[i - 1];

    const newRow = cells[i].map((_cell, j) => {
      const left = prevRow[j - 1] ?? 0;
      const center = prevRow[j];
      const right = prevRow[j + 1] ?? 1;

      return cellRules[`${left}${center}${right}`];
    }) as RowState;

    newRows[i] = newRow;
  }

  return newRows as BoardState;
}
