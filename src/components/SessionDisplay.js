// components/SessionDisplay.js
import React from 'react';

const SessionDisplay = () => {
    const wallID = sessionStorage.getItem("public_key");

    return (
        <div className="session-display">
            {wallID && <p>Wallet ID: {wallID}</p>}
        </div>
    );
};

export default SessionDisplay;
