import React, { useEffect, useRef, useState } from 'react';
import styles from './MusicPlayer.module.css';
import { useLocation } from 'react-router-dom';
import backgroundMusic from '../../../public/assets/music/background_music2.0.mp3';
import criticalMomentMusic from '../../../public/assets/music/critical_moment_music.mp3';
import {FaPause, FaPlay, FaVolumeMute, FaVolumeUp} from "react-icons/fa";

const MusicPlayer: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(1);
    const location = useLocation();

    useEffect(() => {
        if (!audioRef.current) return;

        const updateMusicSource = () => {
            if (!audioRef.current) return;

            if (location.pathname.startsWith('/duel')) {
                audioRef.current.src = criticalMomentMusic;
            } else {
                audioRef.current.src = backgroundMusic;
            }

            if (isPlaying) {
                audioRef.current.play().catch((err) => {
                    console.log('Autoplay prevented:', err);
                });
            } else {
                audioRef.current.pause();
            }
        };

        updateMusicSource();
        // Include isPlaying in the dependency array to handle play/pause state changes
    }, [location.pathname, isPlaying]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch((err) => {
                    console.log('Play prevented:', err);
                });
            }
            setIsPlaying(!isPlaying);
        }
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
            <audio ref={audioRef} loop>
                {/* ... */}
            </audio>
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