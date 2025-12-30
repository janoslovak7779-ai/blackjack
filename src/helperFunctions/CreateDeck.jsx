const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function getCardValue(rank) {
    if (rank === "A") return {valueMin: 1, valueMax: 11};
    if (rank === "K" || rank === "Q" || rank === "J") return {valueMin: 10, valueMax: 10};
    const n = Number(rank);
    return {valueMin: n, valueMax: n};
}

export function createPlayingCard(rank, suit) {
    const {valueMin, valueMax} = getCardValue(rank);
    return {rank, suit, valueMin, valueMax};
}

export function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push(createPlayingCard(rank, suit));
        }
    }
    return deck;
}