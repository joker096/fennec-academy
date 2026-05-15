import React from 'react';

export const BottleCap = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 2 L60 12 L72 8 L78 20 L92 24 L88 38 L98 50 L88 62 L92 76 L78 80 L72 92 L60 88 L50 98 L40 88 L28 92 L22 80 L8 76 L12 62 L2 50 L12 38 L8 24 L22 20 L28 8 L40 12 Z" fill="#b73a3a" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r="34" fill="#cc4444" stroke="#000" strokeWidth="2"/>
    <path d="M30 40 Q50 30 70 40" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M35 60 Q50 70 65 60" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <text x="50" y="56" fontFamily="Impact, sans-serif" fontSize="20" fill="white" textAnchor="middle" letterSpacing="1">NUKA</text>
  </svg>
);

export const VaultDoor = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#f4cb38" stroke="#000" strokeWidth="4"/>
    <path d="M50 2 L50 12 M98 50 L88 50 M50 98 L50 88 M2 50 L12 50 M16 16 L24 24 M84 16 L76 24 M84 84 L76 76 M16 84 L24 76" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="50" cy="50" r="38" fill="#003b71" stroke="#000" strokeWidth="4"/>
    <circle cx="50" cy="50" r="28" fill="#002244" stroke="#000" strokeWidth="2"/>
    <text x="50" y="62" fontFamily="Impact, sans-serif" fontSize="36" fill="#f4cb38" textAnchor="middle" letterSpacing="2">76</text>
    <path d="M50 12 L50 88" stroke="#000" strokeWidth="2" opacity="0.5"/>
  </svg>
);

export const Stimpak = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="42" y="10" width="16" height="20" fill="#ccc" stroke="#000" strokeWidth="4"/>
    <rect x="46" y="2" width="8" height="8" fill="#999" stroke="#000" strokeWidth="4"/>
    <path d="M30 30 h40 v40 h-40 z" fill="#b73a3a" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M40 50 h20 M50 40 v20" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
    <path d="M50 70 L50 95" stroke="#ccc" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="50" cy="95" r="3" fill="#000"/>
  </svg>
);
