import { Client } from "boardgame.io/react";
import { TicTacToe } from "./Game";
import "./App.css";
import { GameBoard } from "./Board";

const App = Client({
  game: TicTacToe,
  board: GameBoard,
});

export default App;
