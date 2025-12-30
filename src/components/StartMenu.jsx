import './StartMenu.css'

export function StartMenu({ onPlay, onOpenMenu }) {
    return (
        <div className="container mt-3 text-white text-center d-flex flex-column min-vh justify-content-center">
            <h1 className="mb-4">Blackjack</h1>

            <div className="d-flex flex-column gap-3 align-items-center">
                <button type="button" className="btn fw-light px-5 wide" onClick={onPlay}>
                    Play Game
                </button>

                <button type="button" className="btn fw-light px-5 wide" onClick={onOpenMenu}>
                    Main Menu
                </button>
            </div>
        </div>
    );
}