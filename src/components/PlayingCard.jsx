import './PlayingCard.css'

function PlayingCard({ card }) {
    const isRed = card.suit === "♥" || card.suit === "♦";

    return (
        <div className="playing-card">
            <p className={isRed ? "playing-card__red" : ""}>{card.rank}</p>
            <h1 className={isRed ? "playing-card__red" : ""}>{card.suit}</h1>
        </div>
    );
}

export default PlayingCard;