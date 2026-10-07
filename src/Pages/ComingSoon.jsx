import React from 'react';

const ComingSoon = () => {
    return (
        <div 
            style={{ 
                height: '100vh',
                width: '100vw',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                padding: 0,
                overflow: 'hidden'
            }}
        >
            <h1 
                style={{ 
                    color: 'white',
                    fontFamily: "var(--font-heading)",
                    fontWeight: 'bold',
                    fontSize: 'clamp(2rem, 10vw, 8rem)',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}
            >
                COMING SOON
            </h1>
        </div>
    );
};

export default ComingSoon;
