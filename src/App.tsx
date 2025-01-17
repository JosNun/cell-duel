import { Client } from "boardgame.io/react";
import { CellDuel } from "./Game";
import "./App.css";
import { GameBoard } from "./Board";

const App = Client({
  game: CellDuel,
  board: GameBoard,
});

export default App;
