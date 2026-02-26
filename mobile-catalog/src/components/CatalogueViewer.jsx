import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import catalogData from '../catalog_data.json';
import TextPage from './TextPage';
import PhotoPage from './PhotoPage';

export default function CatalogueViewer() {
    return (
        <div className="w-full h-[100dvh] flex items-center justify-center bg-zinc-950 overflow-hidden relative">
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-rose-950/20 via-zinc-950 to-indigo-950/20 blur-3xl opacity-50" />

            <Swiper
                effect={'cards'}
                grabCursor={true}
                modules={[EffectCards, Pagination]}
                pagination={{ clickable: true }}
                className="w-[90%] max-w-md h-[80%] rounded-2xl shadow-2xl relative z-10"
            >
                {catalogData.map((page, index) => (
                    <SwiperSlide key={page.id} className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/50 shadow-xl">
                        {page.type === 'text' ? (
                            <TextPage content={page.content} isFirst={index === 0} />
                        ) : (
                            <PhotoPage src={page.src.replace('catalog_assets/', '/assets/')} />
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
