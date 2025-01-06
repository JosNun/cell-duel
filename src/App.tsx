import { Client } from "boardgame.io/react";
import { TicTacToe } from "./Game";
import "./App.css";
import { TicTacToeBoard } from "./Board";

const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
});

export default App;
