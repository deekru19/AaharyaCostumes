import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function TextPage({ content, isFirst }) {
    // Simple heuristic to split paragraphs by newlines
    const paragraphs = content.split('\n').filter((p) => p.trim() !== '');

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-900 text-center relative overflow-y-auto">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 w-full">
                {isFirst && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-300 tracking-tight leading-tight mb-2">
                            Aaharya
                        </h1>
                        <h2 className="text-lg text-zinc-400 tracking-widest uppercase text-sm">Costumes & Dance Needs</h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-rose-500 to-orange-500 mx-auto mt-4 rounded-full" />
                    </div>
                )}

                <div className="space-y-6 text-zinc-300">
                    {!isFirst && paragraphs.length > 0 && (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                            <span className="text-rose-400 text-lg font-serif">❧</span>
                        </div>
                    )}
                    {paragraphs.map((text, i) => (
                        <p key={i} className={`text-base leading-relaxed ${isFirst && i === 0 ? 'text-zinc-100 text-lg font-medium' : ''}`}>
                            {text}
                        </p>
                    ))}
                </div>

                {isFirst && (
                    <div className="mt-16 flex items-center justify-center gap-2 text-zinc-500 animate-pulse">
                        <span className="text-sm font-medium">Swipe to browse</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                )}
            </div>
        </div>
    );
}
