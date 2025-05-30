// C:/Users/maxda/Desktop/dads/data_cards/src/Userpage/SnakesGame/SnakesBoard/SnakeBoard.tsx
import { useRef, useEffect, useState, useCallback } from "react";
import { SnakeGameEngine } from "./SnakeGame";

import "./SnakesBoardStyles.css";

interface SnakeGameBoard {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  externalScore: number; // Still received as a prop, but won't re-init engine on change
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
}

const SWIPE_THRESHOLD = 30;

export default function SnakeBoard({
  isPlaying,
  setIsPlaying,
  externalScore, // Prop is still here
  setScore,
  setIsGameOver,
}: SnakeGameBoard) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snakes = useRef<SnakeGameEngine | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const [canvasSidesLength, setCanvasSidesLength] = useState(0);

  useEffect(() => {
    const calculateOptimalCanvasSize = () => {
      // ... (calculation logic remains the same)
      const screenMinDim = Math.min(window.innerWidth, window.innerHeight);
      const verticalPaddingAndElements = window.innerHeight * 0.25;
      const horizontalPadding = window.innerWidth * 0.1;
      let dynamicSize = Math.min(
        window.innerWidth - horizontalPadding,
        window.innerHeight - verticalPaddingAndElements
      );
      const MAX_CANVAS_SIZE = 500;
      const MIN_CANVAS_SIZE = 260;
      dynamicSize = Math.max(MIN_CANVAS_SIZE, Math.min(dynamicSize, MAX_CANVAS_SIZE));
      setCanvasSidesLength(dynamicSize);
    };
    calculateOptimalCanvasSize();
  }, []);

  // Initialize canvas and game engine
  useEffect(() => {
    if (!canvasRef.current || canvasSidesLength === 0) {
      return; 
    }

    if (snakes.current) {
        snakes.current.stopAnimation();
        // Potentially clean up old listeners if they were attached directly by the engine
        // For now, assuming window.onkeydown is the main one handled by this effect's cleanup
        snakes.current = null; 
    }

    canvasRef.current.width = canvasSidesLength;
    canvasRef.current.height = canvasSidesLength;
    const ctx = canvasRef.current.getContext("2d");

    if (ctx) {
      snakes.current = new SnakeGameEngine(
        ctx,
        canvasSidesLength,
        externalScore, // Pass initial externalScore (usually 0)
        setScore,
        setIsGameOver,
        isPlaying 
      );
      
      if (isPlaying && snakes.current) {
        snakes.current.animate(true); 
      }

      window.onkeydown = (e) => {
        if (!snakes.current) return;
        // ... (keydown logic remains the same)
        switch (e.key) {
          case "w": case "ArrowUp": snakes.current.snake.changeMovement("to top"); e.preventDefault(); break;
          case "s": case "ArrowDown": snakes.current.snake.changeMovement("to bottom"); e.preventDefault(); break;
          case "d": case "ArrowRight": snakes.current.snake.changeMovement("to right"); e.preventDefault(); break;
          case "a": case "ArrowLeft": snakes.current.snake.changeMovement("to left"); e.preventDefault(); break;
          case "Escape": setIsPlaying((prev) => !prev); break;
          default: break;
        }
      };
    }

    return () => {
      if (snakes.current) {
        snakes.current.stopAnimation();
      }
      window.onkeydown = null;
    };
  // REMOVED externalScore from dependencies.
  // setScore and setIsGameOver are stable.
  // canvasSidesLength only changes once.
  }, [canvasSidesLength, setScore, setIsGameOver]); // isPlaying is also removed, constructor handles initial, next effect handles changes.


  // Effect for handling play/pause state changes AFTER engine is initialized
  useEffect(() => {
    if (snakes.current) {
      snakes.current.animate(isPlaying);
    }
  }, [isPlaying]);


  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement> | TouchEvent) => {
    // ... (touch logic remains the same)
    const nativeTouchEvent = event as TouchEvent;
    if (nativeTouchEvent.touches.length === 1) {
      touchStartXRef.current = nativeTouchEvent.touches[0].clientX;
      touchStartYRef.current = nativeTouchEvent.touches[0].clientY;
    }
  }, []); 

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLCanvasElement> | TouchEvent) => {
    // ... (touch logic remains the same)
    const nativeTouchEvent = event as TouchEvent; 

    if (touchStartXRef.current === null || touchStartYRef.current === null || !snakes.current) {
      return;
    }
    if (nativeTouchEvent.changedTouches.length === 1) {
        const touchEndX = nativeTouchEvent.changedTouches[0].clientX;
        const touchEndY = nativeTouchEvent.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartXRef.current;
        const deltaY = touchEndY - touchStartYRef.current;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                snakes.current.snake.changeMovement(deltaX > 0 ? "to right" : "to left");
            } else {
                snakes.current.snake.changeMovement(deltaY > 0 ? "to bottom" : "to top");
            }
        }
        touchStartXRef.current = null;
        touchStartYRef.current = null;
    }
  }, []); 

  useEffect(() => {
    const canvasElement = canvasRef.current;
    // Define options outside to keep the same reference for add/remove
    const eventOptions: AddEventListenerOptions = { passive: false };
    if (canvasElement) {
      canvasElement.addEventListener('touchstart', handleTouchStart as EventListener, eventOptions);
      canvasElement.addEventListener('touchend', handleTouchEnd as EventListener, eventOptions);
      return () => {
        canvasElement.removeEventListener('touchstart', handleTouchStart as EventListener, eventOptions);
        canvasElement.removeEventListener('touchend', handleTouchEnd as EventListener, eventOptions);
      };
    }
  }, [handleTouchStart, handleTouchEnd]);

  return (
    <div style={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        minHeight: 0,
      }}>
      <canvas
        id="game-canvas"
        ref={canvasRef}
      ></canvas>
    </div>
  );
}