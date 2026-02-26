import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import './App.css';

const IMAGE_SOURCES = Array.from(
  { length: 12 },
  (_, index) => `/catalog_assets/${index + 1}.webp`,
);
const CARD_ASPECT_RATIO = 2 / 3;
const COVER_THRESHOLD = CARD_ASPECT_RATIO - 0.05;

function App() {
  const [firstImageReady, setFirstImageReady] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState(
    () => IMAGE_SOURCES.map(() => false),
  );
  const [fitModes, setFitModes] = useState(
    () => IMAGE_SOURCES.map(() => 'contain'),
  );

  const totalCount = IMAGE_SOURCES.length;

  const markSlideLoaded = (index) => {
    setLoadedSlides((previous) => {
      if (previous[index]) {
        return previous;
      }
      const next = [...previous];
      next[index] = true;
      return next;
    });
  };

  const markFitMode = (index, width, height) => {
    if (!width || !height) {
      return;
    }
    const ratio = width / height;
    const nextMode = ratio < COVER_THRESHOLD ? 'cover' : 'contain';
    setFitModes((previous) => {
      if (previous[index] === nextMode) {
        return previous;
      }
      const next = [...previous];
      next[index] = nextMode;
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;
    const heroImage = new Image();
    heroImage.src = IMAGE_SOURCES[0];
    heroImage.decoding = 'sync';
    heroImage.fetchPriority = 'high';

    const onReady = () => {
      if (!isMounted) {
        return;
      }
      setFirstImageReady(true);
      markSlideLoaded(0);
      markFitMode(0, heroImage.naturalWidth, heroImage.naturalHeight);
    };

    if (heroImage.complete) {
      onReady();
      return () => {
        isMounted = false;
      };
    }

    heroImage.onload = onReady;
    heroImage.onerror = onReady;

    return () => {
      isMounted = false;
      heroImage.onload = null;
      heroImage.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!firstImageReady) {
      return;
    }

    let isMounted = true;

    IMAGE_SOURCES.slice(1).forEach((src, index) => {
      const image = new Image();
      image.decoding = 'async';
      image.fetchPriority = 'low';

      image.onload = () => {
        if (!isMounted) {
          return;
        }
        markSlideLoaded(index + 1);
        markFitMode(index + 1, image.naturalWidth, image.naturalHeight);
      };
      image.onerror = () => {
        if (!isMounted) {
          return;
        }
      };

      image.src = src;
    });

    return () => {
      isMounted = false;
    };
  }, [firstImageReady, totalCount]);

  if (!firstImageReady) {
    return (
      <main className="catalog-shell">
        <section className="loading-screen" aria-live="polite">
          <p className="loading-title">Aaharya Catalogue</p>
          <div className="loading-ring" />
          <p className="loading-label">Loading cover page...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="catalog-shell">
      <div className="ambient-glow ambient-glow-top" />
      <div className="ambient-glow ambient-glow-bottom" />

      <header className="catalog-header">
        <p className="brand-title">Aaharya Costumes</p>
      </header>

      <Swiper
        modules={[EffectCards, Pagination]}
        className="catalog-swiper"
        effect="cards"
        grabCursor={true}
        cardsEffect={{
          slideShadows: true,
          perSlideOffset: 12,
          perSlideRotate: 3,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
      >
        {IMAGE_SOURCES.map((src, index) => (
          <SwiperSlide key={src} className="catalog-slide">
            <article className="slide-card">
              <div className="card-shell">
                <div className="card-media">
                  <img
                    src={src}
                    alt={`Aaharya catalogue page ${index + 1}`}
                    className={`catalog-image fit-${fitModes[index]} ${loadedSlides[index] ? 'is-loaded' : ''}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    decoding={index === 0 ? 'sync' : 'async'}
                    onLoad={(event) => {
                      markSlideLoaded(index);
                      markFitMode(
                        index,
                        event.currentTarget.naturalWidth,
                        event.currentTarget.naturalHeight,
                      );
                    }}
                  />
                </div>
              </div>
              <div className="page-badge">{index + 1} / {totalCount}</div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </main>
  );
}

export default App;
