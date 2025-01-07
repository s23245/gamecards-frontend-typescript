import React, { useEffect, useState } from 'react';
import { getHelloMessage } from '../services/HelloService';

const HelloPage: React.FC = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        (async () => {
            const data = await getHelloMessage();
            setMessage(data);
        })();
    }, []);

    return (
        <div style={{ textAlign: 'center' }}>
            <h2>Hello Page</h2>
            <p>Backend says: {message}</p>
        </div>
    );
};

export default HelloPage;