import { ReactNode } from "react";
import { GameProps } from "./Game";
import { GameContext } from "./gameContext";

interface GameProviderProps extends GameProps {
  children: ReactNode;
}

export function GameProvider({ children, ...props }: GameProviderProps) {
  return <GameContext.Provider value={props}>{children}</GameContext.Provider>;
}
