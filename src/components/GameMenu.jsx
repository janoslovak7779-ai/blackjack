// src/components/GameMenu.jsx
import {useState, useEffect, useMemo} from 'react';
import { X, Menu, Trophy, Settings, BookOpen, BarChart3, Lock } from 'lucide-react';

const CAMPAIGN_ORDER_KEY = 'blackJack:campaignOrder:v1';

export function GameMenu({isOpen, onClose, allLevelsBeaten, currentIndex, scenarioList}) {
    const [activeTab, setActiveTab] = useState('levels');
    const [stats, setStats] = useState({
        totalGamesPlayed: 0,
        totalWins: 0,
        totalTimeSpent: 0,
        bestStreak: 0,
        levels: {}
    });

    useEffect(() => {
        const saved = localStorage.getItem('blackJack:stats:v1');
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setStats(JSON.parse(saved));
            } catch { /* empty */ }
        }
    }, [isOpen]);

    const campaignScenarioList = useMemo(() => {
        // Build a stable render list using the cached campaign order (ids).
        try {
            const raw = localStorage.getItem(CAMPAIGN_ORDER_KEY);
            const parsed = raw ? JSON.parse(raw) : null;

            const isValid =
                Array.isArray(parsed) &&
                parsed.length > 0 &&
                parsed.every((id) => typeof id === 'string' || typeof id === 'number');

            if (!isValid) return scenarioList;

            const byId = new Map((scenarioList ?? []).map((s) => [String(s?.id), s]));
            const ordered = parsed
                .map((id) => byId.get(String(id)))
                .filter(Boolean);

            // If mismatch (data changed), fall back to provided list.
            return ordered.length === (scenarioList?.length ?? 0) ? ordered : scenarioList;
        } catch {
            return scenarioList;
        }
    }, [scenarioList]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    const formatElapsedMs = (ms) => {
        if (!Number.isFinite(ms) || ms < 0) return '—';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    const resetProgress = () => {
        if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            localStorage.removeItem('blackJack:run:v1');
            localStorage.removeItem('blackJack:stats:v1');
            localStorage.removeItem('blackJack:campaignOrder:v1');
            localStorage.removeItem('blackJack:firstRunModalSeen:v1');

            window.location.reload();
        }
    };

    if (!isOpen) return null;

    const renderList = campaignScenarioList ?? [];

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4"
            style={{ zIndex: 1060, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="game-menu__panel position-relative w-100 rounded-4 shadow-lg border border-warning border-opacity-25"
                style={{ maxWidth: '56rem', backgroundColor: '#1a1d23' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-secondary">
                    <div className="d-flex align-items-center gap-3">
                        <Menu className="text-warning" size={24} />
                        <h2 className="h4 mb-0 text-white fw-bold">Black Jack Menu</h2>
                    </div>
                    <button onClick={onClose} className="btn btn-link text-light p-2" type="button">
                        <X size={24} />
                    </button>
                </div>

                <div className="d-flex gap-1 px-4 pt-3 border-bottom border-secondary border-opacity-50 options">
                    {[
                        { id: 'levels', icon: Trophy, label: 'Levels' },
                        { id: 'stats', icon: BarChart3, label: 'Statistics' },
                        { id: 'rules', icon: BookOpen, label: 'Rules' },
                        { id: 'settings', icon: Settings, label: 'Settings' }
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-top ${
                                    activeTab === tab.id
                                        ? 'bg-dark text-warning border-bottom border-warning border-2'
                                        : 'text-secondary bg-transparent'
                                }`}
                                type="button"
                            >
                                <Icon size={16} />
                                <span className="fw-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="game-menu__content p-4 overflow-auto text-center" style={{ maxHeight: '60vh' }}>
                    {activeTab === 'levels' && (
                        <div>
                            <div className="text-center mb-4">
                                <h3 className="h5 text-white fw-bold mb-2">Level Progress</h3>
                                <p className="text-secondary mb-0">
                                    {allLevelsBeaten ? 'All levels completed! Freeplay mode active.' : `Level ${currentIndex + 1} of ${renderList.length}`}
                                </p>
                            </div>

                            <div className="row g-3">
                                {Array.from({ length: renderList.length }).map((_, idx) => {
                                    const isCompleted = allLevelsBeaten || idx < currentIndex;
                                    const isCurrent = !allLevelsBeaten && idx === currentIndex;
                                    const title = renderList?.[idx]?.title ?? `Level ${idx + 1}`;

                                    const scenarioId = renderList?.[idx]?.id;
                                    const levelKey = scenarioId == null ? String(idx) : String(scenarioId);
                                    const levelStats = (stats?.levels && stats.levels[levelKey]) ? stats.levels[levelKey] : null;

                                    const wins = levelStats?.wins ?? 0;
                                    const bestTimeMs = levelStats?.bestTimeMs ?? null;

                                    return (
                                        <div key={levelKey} className="col-12 col-md-6">
                                            <div
                                                className={`p-3 rounded-3 border border-2 ${
                                                    isCurrent
                                                        ? 'bg-warning bg-opacity-10 border-warning'
                                                        : isCompleted
                                                            ? 'bg-success bg-opacity-10 border-success border-opacity-50'
                                                            : 'bg-dark bg-opacity-50 border-secondary'
                                                }`}
                                            >
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="fs-5 fw-bold text-white">Level {idx + 1} - {title}</span>
                                                            {isCompleted ? (
                                                                <Trophy className="text-success" size={16} />
                                                            ) : (!isCurrent && !isCompleted) ? (
                                                                <Lock className="text-secondary" size={16} />
                                                            ) : null}
                                                        </div>

                                                        <p className="small text-secondary mb-2 text-start">
                                                            {isCurrent ? 'Current Level' : isCompleted ? 'Completed' : 'Locked'}
                                                        </p>

                                                        <div className="d-flex flex-wrap gap-2">
                                                              <span className="badge text-bg-secondary">
                                                                Wins: {wins}
                                                              </span>
                                                            <span className="badge text-bg-secondary">
                                                                Best time: {bestTimeMs == null ? '—' : formatElapsedMs(bestTimeMs)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                        style={{
                                                            width: '3rem',
                                                            height: '3rem',
                                                            backgroundColor: isCurrent ? '#ffc107' : isCompleted ? '#198754' : '#495057',
                                                            color: isCurrent ? '#000' : '#fff',
                                                        }}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div>
                            <h3 className="h5 text-white text-center fw-bold mb-4">Your Statistics</h3>

                            <div className="row g-3 mb-4">
                                <div className="col-12 col-md-6">
                                    <div className="p-4 rounded-3 border" style={{ background: 'linear-gradient(135deg, rgba(13,110,253,0.1), rgba(13,110,253,0.05))', borderColor: 'rgba(13,110,253,0.2)' }}>
                                        <p className="text-secondary small mb-1">Total Games</p>
                                        <p className="display-4 fw-bold text-white mb-0">{stats.totalGamesPlayed}</p>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="p-4 rounded-3 border" style={{ background: 'linear-gradient(135deg, rgba(25,135,84,0.1), rgba(25,135,84,0.05))', borderColor: 'rgba(25,135,84,0.2)' }}>
                                        <p className="text-secondary small mb-1">Total Wins</p>
                                        <p className="display-4 fw-bold text-white mb-0">{stats.totalWins}</p>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="p-4 rounded-3 border" style={{ background: 'linear-gradient(135deg, rgba(111,66,193,0.1), rgba(111,66,193,0.05))', borderColor: 'rgba(111,66,193,0.2)' }}>
                                        <p className="text-secondary small mb-1">Time Played</p>
                                        <p className="display-4 fw-bold text-white mb-0">{formatTime(stats.totalTimeSpent)}</p>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="p-4 rounded-3 border" style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,193,7,0.05))', borderColor: 'rgba(255,193,7,0.2)' }}>
                                        <p className="text-secondary small mb-1">Best Streak</p>
                                        <p className="display-4 fw-bold text-white mb-0">{stats.bestStreak}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-3 border border-secondary bg-dark bg-opacity-50">
                                <p className="text-secondary small mb-2">Win Rate</p>
                                <div className="progress" style={{ height: '1rem' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        style={{ width: `${stats.totalGamesPlayed > 0 ? (stats.totalWins / stats.totalGamesPlayed * 100) : 0}%` }}
                                    />
                                </div>
                                <p className="text-white fs-4 fw-bold mt-2 mb-0">
                                    {stats.totalGamesPlayed > 0 ? ((stats.totalWins / stats.totalGamesPlayed * 100).toFixed(1)) : 0}%
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <div className="text-light">
                            <h3 className="h5 text-white fw-bold mb-4">How to Play</h3>

                            <div className="d-flex flex-column gap-3">
                                <div className="p-3 rounded-3 border border-secondary bg-dark bg-opacity-50">
                                    <h4 className="h6 fw-bold text-white mb-2">Objective</h4>
                                    <p className="mb-0">Beat the dealer by getting as close to 21 as possible without going over. Reach the target bankroll to complete each level.</p>
                                </div>

                                <div className="p-3 rounded-3 border border-secondary bg-dark bg-opacity-50">
                                    <h4 className="h6 fw-bold text-white mb-2">Card Values</h4>
                                    <ul className="mb-0">
                                        <li>Number cards (2-10): Face value</li>
                                        <li>Face cards (J, Q, K): Worth 10</li>
                                        <li>Ace: Worth 1 or 11 (whichever is better)</li>
                                    </ul>
                                </div>

                                <div className="p-3 rounded-3 border border-secondary bg-dark bg-opacity-50">
                                    <h4 className="h6 fw-bold text-white mb-2">Gameplay</h4>
                                    <ul className="mb-0">
                                        <li><strong>Place Bet:</strong> Drag chips to the betting zone</li>
                                        <li><strong>Deal:</strong> You and dealer receive cards</li>
                                        <li><strong>Hit:</strong> Take another card</li>
                                        <li><strong>Stand:</strong> Keep your current hand</li>
                                        <li><strong>Dealer:</strong> Must hit on 16 or less, stand on 17+</li>
                                    </ul>
                                </div>

                                <div className="p-3 rounded-3 border border-secondary bg-dark bg-opacity-50">
                                    <h4 className="h6 fw-bold text-white mb-2">Winning</h4>
                                    <ul className="mb-0">
                                        <li>Win: Get paid 2x your bet</li>
                                        <li>Push (tie): Get your bet back</li>
                                        <li>Bust or lose: Lose your bet</li>
                                        <li>Blackjack (21 on first two cards): Automatic win!</li>
                                    </ul>
                                </div>

                                <div className="p-3 rounded-3 border border-warning border-opacity-25" style={{ backgroundColor: 'rgba(255,193,7,0.1)' }}>
                                    <h4 className="h6 fw-bold text-warning mb-2">Special Features</h4>
                                    <ul className="mb-0">
                                        <li>Difficulty increases with each level</li>
                                        <li>Levels have time limits</li>
                                        <li>Use "ALL IN" to bet your entire bankroll</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div>
                            <div className="d-flex flex-column gap-3">
                                <h3 className="h5 text-white fw-bold mb-4">Settings</h3>

                                <div className="p-3 rounded-3 border border-secondary bg-dark bg-opacity-50">
                                    <h4 className="h6 fw-bold text-white mb-3">Main Menu</h4>
                                    <p className="text-secondary small mb-3">
                                        Leave the current game and return to the main menu. Your progress is saved automatically.
                                    </p>
                                    <button
                                        onClick={() => {window.location.reload()}}
                                        className="btn btn-danger w-100 fw-bold"
                                        type="button"
                                    >
                                        Return to Main Menu
                                    </button>
                                </div>

                                <div className="p-3 rounded-3 border border-secondary bg-dark bg-opacity-50">
                                    <h4 className="h6 fw-bold text-white mb-3">Game Data</h4>
                                    <p className="text-secondary small mb-3">
                                        You can reset everything to start fresh.
                                    </p>
                                    <button
                                        onClick={resetProgress}
                                        className="btn btn-danger w-100 fw-bold"
                                        type="button"
                                    >
                                        Reset All Progress
                                    </button>
                                </div>

                                <div className="p-3 rounded-3 border border-secondary bg-dark bg-opacity-50">
                                    <h4 className="h6 fw-bold text-white mb-3">About</h4>
                                    <p className="text-secondary small mb-0">
                                        Blackjack v1.0<br />
                                        Master the art of blackjack through progressive levels.<br />
                                        Good luck!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-top border-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-warning w-100 fw-bold"
                        type="button"
                    >
                        Return to Game
                    </button>
                </div>
            </div>
        </div>
    );
}

export function MenuButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            type="button"
            className="bj-header__meta bj-header__meta-btn d-inline-flex align-items-center justify-content-center gap-2"
            aria-label="Open menu"
        >
            <Menu size={16} className="bj-header__meta-btn__icon" />
            <span className="bj-header__meta-btn__text m-0 text-center">Menu</span>
        </button>
    );
}