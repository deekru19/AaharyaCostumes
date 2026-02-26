import React from 'react';

export default function PhotoPage({ src }) {
    return (
        <div className="w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden">
            <img
                src={src}
                alt="Catalogue Page"
                className="w-full h-full object-contain pointer-events-none"
                loading="lazy"
            />
        </div>
    );
}
