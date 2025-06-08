import { HIGH_SCORE_KEY } from "./SnakesGame";
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION

interface GameOverModal {
	finalScore: number;
	setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
	setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
	setJustStarted: React.Dispatch<React.SetStateAction<boolean>>;
	setScore: React.Dispatch<React.SetStateAction<number>>;
}

export default function GameOverModal({
	finalScore,
	setIsGameOver,
	setIsPlaying,
	setJustStarted,
	setScore,
}: GameOverModal) {
	const handleGameReset = () => {
		// restart the game
		setIsGameOver(false);
		setIsPlaying(true);
		setJustStarted(true);
		setScore(0);
	};

	const currentHighScore = Number(localStorage.getItem(HIGH_SCORE_KEY));
	const highScoreBeaten = finalScore > currentHighScore;
	if (highScoreBeaten) {
		localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
	}

	return (
		<div id="game-over-modal-container" onClick={handleGameReset}>
			<div id="game-over-modal">
				<h2>{sl.snakesGame.gameOver.title || "Game Over"}</h2>
				<p className="final-score">
					{sl.snakesGame.gameOver.finalScoreLabel || "Your Final Score: "}<span>{finalScore}</span>
				</p>
				{highScoreBeaten && finalScore > 0 && (
					<p className="congratulate">{sl.snakesGame.gameOver.highScoreBeaten || "🏆 You beat the high score! 🏆"}</p>
				)}
				<p className="click-dir">{sl.snakesGame.gameOver.continueHint || "(Click anywhere to continue)"}</p>
			</div>
		</div>
	);
}