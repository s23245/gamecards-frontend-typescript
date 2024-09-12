import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '/src/components/Navbar/Navbar.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
            <div className="container-fluid">
                <a className="navbar-brand" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
                    <img src="/src/assets/images/gamecards_logo_2.png" alt="GameCards Logo" className={styles.navbarLogo} />
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <div className={`ms-auto ${styles.buttonContainer}`}>
                        <button className={`btn btn-outline-light ${styles.navButton}`} onClick={() => navigate('/duel-demo')}>Duel Demo</button>
                        <button className={`btn btn-outline-light ${styles.navButton}`} onClick={() => navigate('/account')}>Account</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
