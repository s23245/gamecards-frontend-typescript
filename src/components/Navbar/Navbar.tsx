import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '/src/components/Navbar/Navbar.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
            <div className="container-fluid">
                <a className="navbar-brand" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
                    <img
                        src="/assets/images/gamecards_logo_2_copy.png"
                        alt="GameCards Logo"
                        className={styles.navbarLogo}
                    />
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a
                                className={`nav-link ${styles.navLink}`}
                                onClick={() => navigate('/duel-demo')}
                                style={{ cursor: 'pointer' }}
                            >
                                Duel Demo
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link ${styles.navLink}`}
                                onClick={() => navigate('/account')}
                                style={{ cursor: 'pointer' }}
                            >
                                Account
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;