import React, { useEffect, useRef, useState } from 'react';
import styles from './MusicPlayer.module.css';
import { useLocation } from 'react-router-dom';
import { FaPause, FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

const MusicPlayer: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const location = useLocation();

    useEffect(() => {
        if (!audioRef.current) return;

        // Point to public folder assets using a root-relative path:
        const inDuel = location.pathname.startsWith('/duel');
        audioRef.current.src = inDuel
            ? '/assets/music/critical_moment_music.mp3'
            : '/assets/music/background_music2.0.mp3';

        if (isPlaying) {
            audioRef.current.play().catch((err) => {
                console.log('Autoplay prevented:', err);
            });
        } else {
            audioRef.current.pause();
        }
    }, [location.pathname, isPlaying]);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch((err) => {
                console.log('Play prevented:', err);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const handleMuteUnmute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolume(newVolume);
        }
    };

    return (
        <div className={styles.musicPlayer}>
            {/* No src needed if we're setting it dynamically in useEffect */}
            <audio ref={audioRef} loop />

            <div className={styles.controls}>
                <button onClick={handlePlayPause} className={styles.controlButton}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button onClick={handleMuteUnmute} className={styles.controlButton}>
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className={styles.volumeSlider}
                />
            </div>
        </div>
    );
};

export default MusicPlayer;