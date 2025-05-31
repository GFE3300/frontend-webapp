// C:/Users/maxda/Desktop/dads/data_cards/src/Userpage/SnakesGame/SnakesBoard/SnakeGame.ts

import Snake from "./Snake";

type Cell = "snake" | "food" | null;

export interface Coordinate {
  row: number;
  col: number;
}

export class SnakeGameEngine {
  private context: CanvasRenderingContext2D;
  private boardSidesLength: number;
  private numOfRowsAndCols: number;
  private _gameBoard: Cell[][];
  private _foodCoordinate: Coordinate;
  private readonly staggerFrame: number;
  private currentFrameCount: number;

  private externalScore: number;
  private setScore: React.Dispatch<React.SetStateAction<number>>;
  private setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;

  // private internalPlayState: boolean; // Replaced by isAnimationActive
  private isAnimationActive: boolean = false; // Tracks if the loop should run
  private animationFrameId: number | null = null; // To store requestAnimationFrame ID

  snake: Snake;

  constructor(
    context: CanvasRenderingContext2D,
    boardSidesLength: number,
    externalScore: number,
    setScore: React.Dispatch<React.SetStateAction<number>>,
    setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    isPlaying: boolean // Initial play state, though animate() will soon be called
  ) {
    this.context = context;
    this.snake = new Snake();
    this._foodCoordinate = {
      row: -1,
      col: -1,
    };
    this.boardSidesLength = boardSidesLength;
    this.numOfRowsAndCols = 26;
    this._gameBoard = [];
    this.externalScore = externalScore;
    this.setScore = setScore;
    this.setIsGameOver = setIsGameOver;
    this.currentFrameCount = 0;
    this.staggerFrame = 4;

    // this.internalPlayState = isPlaying; // Not strictly needed here if animate() is called soon
  }

  get score() {
    if (this.snake.length === 0) {
      return 0;
    }
    return this.snake.length * 10 - this.snake.defaultlength * 10;
  }

  private get gameBoard(): Cell[][] {
    if (this._gameBoard.length === 0) {
      const nRows = this.numOfRowsAndCols;
      const nCols = this.numOfRowsAndCols;
      for (let i = 0; i < nRows; i++) {
        this._gameBoard.push(Array.from(Array(nCols)).fill(null));
      }
    }
    return this._gameBoard;
  }

  private set gameBoard(newGameBoard: Cell[][]) {
    this._gameBoard = newGameBoard;
  }

  private get foodCoordinate() {
    const foodCoordInSnakeCoords = (foodRow: number, foodCol: number) => {
      const match = this.snake.bodyCoordinates.find((snakeCoord) => {
        return snakeCoord.col === foodCol && snakeCoord.row === foodRow;
      });
      return match !== undefined;
    };

    if (this._foodCoordinate.row < 0 || this._foodCoordinate.col < 0) {
      let randRow = Math.floor(Math.random() * this.numOfRowsAndCols);
      let randCol = Math.floor(Math.random() * this.numOfRowsAndCols);
      while (foodCoordInSnakeCoords(randRow, randCol)) {
        randRow = Math.floor(Math.random() * this.numOfRowsAndCols);
        randCol = Math.floor(Math.random() * this.numOfRowsAndCols);
      }
      this._foodCoordinate = {
        row: randRow,
        col: randCol,
      };
    }
    return this._foodCoordinate;
  }

  private set foodCoordinate(newCoord: Coordinate) {
    const foodCoordInSnakeCoords = (foodRow: number, foodCol: number) => {
      const match = this.snake.bodyCoordinates.find((snakeCoord) => {
        return snakeCoord.col === foodCol && snakeCoord.row === foodRow;
      });
      return match !== undefined;
    };

    if (newCoord.row < 0 || newCoord.col < 0) {
      let randRow = Math.floor(Math.random() * this.numOfRowsAndCols);
      let randCol = Math.floor(Math.random() * this.numOfRowsAndCols);
      while (foodCoordInSnakeCoords(randRow, randCol)) {
        randRow = Math.floor(Math.random() * this.numOfRowsAndCols);
        randCol = Math.floor(Math.random() * this.numOfRowsAndCols);
      }
      this._foodCoordinate = {
        row: randRow,
        col: randCol,
      };
    } else {
      this._foodCoordinate = newCoord;
    }
  }

  private generateGrid() {
    const cellWidth = this.boardSidesLength / this.numOfRowsAndCols;
    const cellHeight = this.boardSidesLength / this.numOfRowsAndCols;
    this.gameBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        switch (cell) {
          case "snake":
            this.context.fillStyle = "#A2C579";
            break;
          case "food":
            this.context.fillStyle = "salmon";
            break;
          case null:
            this.context.fillStyle = "white";
            break;
        }
        this.context.fillRect(
          colIndex * cellWidth,
          rowIndex * cellHeight,
          cellWidth,
          cellHeight
        );
      });
    });
  }

  private setFoodOnBoard() {
    if (this.snake.justAte) {
      this.foodCoordinate = {
        row: -1,
        col: -1,
      };
    }
    this.gameBoard[this.foodCoordinate.row][this.foodCoordinate.col] = "food";
  }

  private setSnakeOnBoard() {
    const newBoard = this.gameBoard.map((row) => row.fill(null));
    this.snake.bodyCoordinates.forEach((snakeCoord) => {
      // Ensure snake coordinates are within bounds before trying to access gameBoard
      if (
        snakeCoord.row >= 0 && snakeCoord.row < this.numOfRowsAndCols &&
        snakeCoord.col >= 0 && snakeCoord.col < this.numOfRowsAndCols
      ) {
        newBoard[snakeCoord.row][snakeCoord.col] = "snake";
      } else {
        // This case should ideally not happen if game over logic is correct
        // but it's a safeguard for rendering.
        console.warn("[SnakeGameEngine] Snake segment out of bounds during render:", snakeCoord);
      }
    });
    this.gameBoard = newBoard;
  }

  private renderBoard() {
    this.setSnakeOnBoard();
    this.setFoodOnBoard();
    this.generateGrid();
  }

  private snakeIsOutOfBounds() {
    const snakeHead = this.snake.headCoordinate;
    const boundingArea = {
      min: 0,
      max: this.numOfRowsAndCols - 1,
    };
    const rowOutOfBounds =
      snakeHead.row > boundingArea.max || snakeHead.row < boundingArea.min;
    const columnOutOfBounds =
      snakeHead.col > boundingArea.max || snakeHead.col < boundingArea.min;

    if (rowOutOfBounds || columnOutOfBounds) {
      console.log("[SnakeGameEngine] SNAKE OUT OF BOUNDS:", {
        head: { ...snakeHead },
        bounds: boundingArea,
        numRowsCols: this.numOfRowsAndCols,
        rowOutOfBounds,
        columnOutOfBounds,
      });
    }
    return rowOutOfBounds || columnOutOfBounds;
  }

  private snakeHitsBody() {
    const snakeBody = this.snake.bodyCoordinates.slice(
      0,
      this.snake.length - 1
    );
    const snakeHead = this.snake.headCoordinate;
    const match = snakeBody.find((bodyCoord) => {
      const matchingRow = bodyCoord.row === snakeHead.row;
      const matchingCol = bodyCoord.col === snakeHead.col;
      return matchingRow && matchingCol;
    });

    if (match !== undefined) {
      console.log("[SnakeGameEngine] SNAKE HITS BODY:", {
        head: { ...snakeHead },
        collidedWith: { ...match },
        body: JSON.parse(JSON.stringify(this.snake.bodyCoordinates)),
      });
    }
    return match !== undefined;
  }

  private isGameOver() {
    const hitsBody = this.snakeHitsBody();
    const isOutOfBounds = this.snakeIsOutOfBounds();
    const gameOverResult = hitsBody || isOutOfBounds;
    if (gameOverResult) {
      console.log("[SnakeGameEngine] isGameOver() determined: TRUE", { hitsBody, isOutOfBounds });
    }
    return gameOverResult;
  }

  // Renamed original animate to gameLoop, and made it private
  private gameLoop() {
    if (!this.isAnimationActive) { // If animation was stopped, exit loop
      return;
    }

    if (this.currentFrameCount < this.staggerFrame) {
      this.currentFrameCount++;
    } else {
      this.currentFrameCount = 0;

      if (this.externalScore !== this.score) {
        this.setScore(this.score);
      }

      if (this.isGameOver()) {
        console.log("[SnakeGameEngine] Game Over condition met in gameLoop(). Setting isGameOver to true.");
        this.setIsGameOver(true);
        this.isAnimationActive = false; // Stop this loop
        return;
      }

      this.context.clearRect(
        0,
        0,
        this.boardSidesLength,
        this.boardSidesLength
      );
      this.renderBoard();
      this.snake.move(this.foodCoordinate);
    }

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
  
  // Public method to start the animation loop if not already active
  public startAnimation() {
    if (!this.isAnimationActive) {
        this.isAnimationActive = true;
        // Reset frame count for smooth start/resume
        this.currentFrameCount = 0; 
        this.gameLoop(); // Start the internal loop
    }
  }

  // Public method to explicitly stop the animation loop
  public stopAnimation() {
    this.isAnimationActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // This is the method called by SnakeBoard's useEffect based on isPlaying prop
  public animate(isPlaying: boolean) {
    if (isPlaying) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }
}