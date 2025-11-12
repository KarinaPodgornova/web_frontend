// pages/HomePage.tsx
import { type FC, useState, useEffect } from "react";
import Header from '../components/Header/Header';
import './HomePage.css'; 

import banner1 from '../assets/banner_new.jpg';
import banner2 from '../assets/DefaultImage.jpg';

export const HomePage: FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Массив фонов для карусели
  const backgroundSlides = [
    { type: 'image', value: banner1 },
    { type: 'image', value: banner2 },
    
   // { type: 'gradient', value: 'linear-gradient(135deg, #000000 0%, #1854CD 100%)' },
    //{ type: 'gradient', value: 'linear-gradient(135deg, #1854CD 0%, #000000 100%)' },
  ];

  // Функции для навигации
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % backgroundSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => prev === 0 ? backgroundSlides.length - 1 : prev - 1);
  };

  // Автопереключение слайдов
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundSlides.length]);

  const currentSlideData = backgroundSlides[currentSlide];

  return (
    <>
      <Header />
  
      <div className="home-banner">
        <div 
          className={`banner-slide ${currentSlideData.type}`}
          style={{
            backgroundImage: currentSlideData.type === 'image' ? `url(${currentSlideData.value})` : 'none',
            background: currentSlideData.type === 'gradient' ? currentSlideData.value : 'none',
          }}
        >
          <div className="banner-content">
          <h1 >Необходимая сила тока</h1>
            <p >
              Добро пожаловать в каталог устройств для BMW! Здесь вы сможете определить необходимую силу тока для устройств автомобиля.
            </p>
          </div>
        </div>
        
         {/* Незаметные стрелки навигации */}
         <button className="carousel-arrow carousel-arrow-prev" onClick={prevSlide}>
          ‹
        </button>
        <button className="carousel-arrow carousel-arrow-next" onClick={nextSlide}>
          ›
        </button>
      </div>
    </>
  );
};