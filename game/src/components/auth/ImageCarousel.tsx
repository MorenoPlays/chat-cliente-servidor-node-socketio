import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import gamingHero1 from "../../assets/gaming-hero-1.jpg";
import gamingHero2 from "../../assets/gaming-hero-2.jpg";
import gamingHero3 from "../../assets/gaming-hero-3.jpg";

const slides = [
  {
    image: gamingHero1,
    title: "Mergulhe na Experiência Definitiva de Jogos",
    subtitle: "Junte-se a nós e domine a arte de superar através dos jogos",
  },
  {
    image: gamingHero2,
    title: "Batalhas Épicas Esperam por Você",
    subtitle: "Forje seu destino em arenas multiplayer lendárias",
  },
  {
    image: gamingHero3,
    title: "Libere Seu Poder Interior",
    subtitle: "Descubra habilidades mágicas e torne-se uma lenda dos jogos",
  },
];

const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, goToSlide]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1020]/20 via-transparent to-accent/20 z-10" />

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-all duration-500 ease-out",
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          )}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] via-[#0D102040] to-transparent" />
        </div>
      ))}

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
        <div
          className={cn(
            "transition-all duration-500",
            isAnimating
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          )}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white/70 mb-3 drop-shadow-lg">
            {slides[currentSlide].title}
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-md">
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* carrossel indicadores */}
        <div className="flex gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-8 bg-primary shadow-glow"
                  : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              )}
              aria-label={`vai para o slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
