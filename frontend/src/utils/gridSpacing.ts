import { useState, useEffect } from 'react';

export const getStudioSpacing = (): number => {
  if (typeof window === 'undefined') return 175.0;
  const studioCanvas = document.querySelector('#studio canvas') as HTMLCanvasElement | null;
  if (studioCanvas && studioCanvas.clientHeight > 100) {
    return studioCanvas.clientHeight / 4.0;
  }
  return (window.innerWidth >= 640 ? 700.0 : 600.0) / 4.0;
};

export const useGridSpacing = (): number => {
  const [spacing, setSpacing] = useState<number>(() => getStudioSpacing());

  useEffect(() => {
    const update = () => {
      setSpacing(getStudioSpacing());
    };
    update();
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    const studio = document.getElementById('studio');
    if (studio) observer.observe(studio);

    return () => {
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);

  return spacing;
};

