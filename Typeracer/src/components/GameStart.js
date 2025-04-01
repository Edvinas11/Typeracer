import React, { useContext, useState } from 'react';
import '../../wwwroot/css/GameStart.css';
import CustomAlert from './CustomAlert';
import { UsernameContext } from '../UsernameContext';
import { useGame } from "./GameContext";
import bcrypt from 'bcryptjs';

const LOCAL_STORAGE_KEY = 'typingGameProfiles';

function GameStart({ onStart }) {
    const { gamemode, setGamemode } = useGame();
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const { setUsername } = useContext(UsernameContext);
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [currentUser, setCurrentUser] = useState(
        localStorage.getItem('typingGameCurrentUser') || null
    );

    const gamemodeOptions = [
        { value: "0", label: "Standartinis" },
        { value: "1", label: "Trumpas" },
        { value: "2", label: "Sunkus" },
    ];

    const handleAuth = async () => {
        if (!inputUsername.trim()) {
            setAlertMessage('Vartotojo vardas būtinas!');
            setShowAlert(true);
            return;
        }

        const profiles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};

        if (isLoginMode) {
            if (!profiles[inputUsername]) {
                setAlertMessage('Vartotojas nerastas!');
                setShowAlert(true);
                return;
            }

            const isMatch = await bcrypt.compare(inputPassword, profiles[inputUsername].password);
            if (!isMatch) {
                setAlertMessage('Neteisingas slaptažodis!');
                setShowAlert(true);
                return;
            }
        } else {
            if (!inputPassword.trim()) {
                setAlertMessage('Slaptažodis būtinas registracijai!');
                setShowAlert(true);
                return;
            }

            if (profiles[inputUsername]) {
                setAlertMessage('Vartotojas jau egzistuoja!');
                setShowAlert(true);
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(inputPassword, salt);
            profiles[inputUsername] = { password: hashedPassword };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profiles));
        }

        // Only set user info, don't start game
        setUsername(inputUsername);
        setCurrentUser(inputUsername);
        localStorage.setItem('typingGameCurrentUser', inputUsername);
        
        // Play sound without starting game
        const audio = new Audio('/sounds/click.mp3');
        audio.play();
    };

    const handleGuestLogin = () => {
        const guestName = inputUsername.trim() || 'Svečias';
        setUsername(guestName);
        setCurrentUser(guestName);
        
        // Play sound without starting game
        const audio = new Audio('/sounds/click.mp3');
        audio.play();
    };

    const handleStartGame = () => {
        const audio = new Audio('/sounds/click.mp3');
        audio.play();
        audio.onended = onStart;
    };

    const handleLogout = () => {
        localStorage.removeItem('typingGameCurrentUser');
        setCurrentUser(null);
        setInputUsername('');
        setInputPassword('');
    };

    const handleGamemodeChange = (value) => {
        setGamemode(value);
        setDropdownOpen(false);
    };

    return (
        <div className="game-start-body">
            {/* Title always visible */}
            <div className="title-container">
                <p className="game-start-title">RAŠYMO LENKTYNĖS</p>
            </div>

            {/* User status */}
            {currentUser ? (
                <>
                    <div className="profile-info">
                        <p>Prisijungta kaip: <strong style={{color: 'Coral'}}>{currentUser}</strong></p>
                        <button className="logout-button" onClick={handleLogout}>
                            Atsijungti
                        </button>
                    </div>
                    
                    {/* Game mode selection - now visible when logged in */}
                    <div className="dropdown-container">
                        <label htmlFor="gamemode">Pasirinkite žaidimo tipą:&nbsp;</label>
                        <div className="custom-dropdown">
                            <div
                                className="selected-option"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                {gamemodeOptions.find(option => option.value === gamemode)?.label || "Pasirinkti"}
                            </div>
                            {dropdownOpen && (
                                <ul className="dropdown-options">
                                    {gamemodeOptions.map(option => (
                                        <li
                                            key={option.value}
                                            onClick={() => handleGamemodeChange(option.value)}
                                            className={option.value === gamemode ? "selected" : ""}
                                        >
                                            {option.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    
                    {/* Start game button */}
                    <div className="button-container">
                        <button className="start-game-button" onClick={handleStartGame}>
                            Pradėti žaidimą
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Username field */}
                    <div className="input-container">
                        <input
                            className="input-box"
                            type="text"
                            placeholder="Įveskite savo vartotojo vardą"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            size={29}
                        />
                    </div>

                    {/* Password field */}
                    <div className="input-container">
                        <input
                            className="input-box"
                            type="password"
                            placeholder={isLoginMode ? 'Įveskite slaptažodį' : 'Sukurkite slaptažodį'}
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                            size={29}
                        />
                    </div>

                    {/* Toggle between login/register */}
                    <div className="auth-toggle">
                        <button
                            className="toggle-mode-button"
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setInputPassword('');
                            }}
                        >
                            {isLoginMode ? 'Neturite paskyros? Registruokitės' : 'Jau turite paskyrą? Prisijunkite'}
                        </button>
                    </div>

                    {/* Auth buttons */}
                    <div className="button-container">
                        <button
                            className="start-game-button"
                            onClick={handleAuth}
                        >
                            {isLoginMode ? 'Prisijungti' : 'Registruotis'}
                        </button>
                        <button
                            className="guest-button"
                            onClick={handleGuestLogin}
                        >
                            Žaisti kaip svečias
                        </button>
                    </div>
                </>
            )}

            {/* Alert messages */}
            {showAlert && (
                <CustomAlert
                    message={alertMessage}
                    borderColor="red"
                    onClose={() => setShowAlert(false)}
                />
            )}
        </div>
    );
}

export default GameStart;