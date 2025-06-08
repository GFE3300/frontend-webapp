import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION

interface PausedModalProps {
	setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PausedModal({ setIsPlaying }: PausedModalProps) {
	return (
		<div
			id="paused-modal-container"
			onClick={() => setIsPlaying((prevIsPlaying) => !prevIsPlaying)}
		>
			<div id="paused-modal">
				<h2>{sl.snakesGame.paused.title || "Paused"}</h2>
				<p className="click-dir">{sl.snakesGame.paused.continueHint || "(Click anywhere to continue)"}</p>
			</div>
		</div>
	);
}