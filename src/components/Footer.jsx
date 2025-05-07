import React from 'react';

export default function Footer() {
    return (
        <footer className="mt-6 pb-4 text-center text-gray-500 text-xs">
            <p>מעקב נקודות זכות © {new Date().getFullYear()}</p>
        </footer>
    );
} 