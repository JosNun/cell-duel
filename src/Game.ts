import { Game } from "boardgame.io";
import type { BoardProps } from "boardgame.io/react";

type CellState = 1 | 0;

type RowState = [CellState, CellState, CellState, CellState, CellState];

type BoardState = [RowState, RowState, RowState, RowState, RowState];

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

const blankRowState = [0, 0, 0, 0, 0] as RowState;

interface GameState {
  cellRules: CellRules;
  cells: BoardState;
  lastRow: RowState;
  score: Record<string, number>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GameProps extends BoardProps<GameState> {}

export const TicTacToe: Game<GameState> = {
  setup: ({ random, ctx }) => {
    const lastRow = Array(5)
      .fill(null)
      .map(() => Math.round(random.Number())) as RowState;

    return {
      cellRules: {
        "000": Math.round(random.Number()) as CellState,
        "001": Math.round(random.Number()) as CellState,
        "010": Math.round(random.Number()) as CellState,
        "011": Math.round(random.Number()) as CellState,
        "100": Math.round(random.Number()) as CellState,
        "101": Math.round(random.Number()) as CellState,
        "110": Math.round(random.Number()) as CellState,
        "111": Math.round(random.Number()) as CellState,
      } as CellRules,
      cells: Array(5).fill(Array(5).fill(0)) as BoardState,
      lastRow,
      score: ctx.playOrder.reduce((acc, playerID) => {
        acc[playerID] = 0;
        return acc;
      }, {} as Record<string, number>),
    };
  },

  moves: {},

  turn: {
    activePlayers: { currentPlayer: "updateRules" },
    onEnd({ G }) {
      G.lastRow = G.cells[G.cells.length - 1];
      G.cells = Array(5).fill(blankRowState) as BoardState;
    },
    stages: {
      updateRules: {
        next: "viewChanges",
        moves: {
          clickCell: ({ G }, rule: RuleString) => {
            G.cellRules[rule] = G.cellRules[rule] === 1 ? 0 : 1;
          },
          submitRules: ({ G, events }) => {
            G.cells = computeRows(G.cellRules, G.cells, G.lastRow);
            events.endStage();
          },
        },
      },
      viewChanges: {
        moves: {
          endTurn: ({ events, G, playerID }) => {
            G.score[playerID] += G.cells
              .flat()
              .reduce((acc, cell) => acc + cell, 0 as number);

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
  const newRows: BoardState = [
    blankRowState,
    blankRowState,
    blankRowState,
    blankRowState,
    blankRowState,
  ];

  for (let i = 0; i < cells.length; i++) {
    const prevRow = i === 0 ? lastRow : newRows[i - 1];

    const newRow = cells[i].map((_cell, j) => {
      const left = prevRow[j - 1] ?? 0;
      const center = prevRow[j];
      const right = prevRow[j + 1] ?? 0;

      return cellRules[`${left}${center}${right}`];
    }) as RowState;

    newRows[i] = newRow;
  }

  return newRows as BoardState;
}
