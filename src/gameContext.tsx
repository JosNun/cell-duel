import { createContext, useContext } from "react";
import { GameProps } from "./Game";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface GameContextValue extends GameProps {}

function notImplemented(): never {
  throw new Error("useGame must be used within a GameContextProvider");
}

export const GameContext = createContext<GameContextValue>({
  _redo: [],
  _stateID: 0,
  _undo: [],
  chatMessages: [],
  ctx: {} as never,
  G: {} as never,
  events: {} as never,
  isActive: false,
  isConnected: false,
  isMultiplayer: false,
  log: [],
  matchID: "",
  moves: {},
  playerID: null,
  plugins: {},
  redo: notImplemented,
  reset: notImplemented,
  undo: notImplemented,
  sendChatMessage: notImplemented,
});

export function useGame() {
  return useContext(GameContext);
}
