"use client";

import { useEffect, useRef, useState } from "react";

type LoopingVideoBannerProps = {
  src: string;
  className?: string;
};

export function LoopingVideoBanner({ src, className }: LoopingVideoBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loopingRef = useRef(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = async () => {
      if (!video.duration || loopingRef.current) return;

      // Fade shortly before the end, then restart from 0 to make loop transition softer.
      if (video.currentTime >= video.duration - 0.35) {
        loopingRef.current = true;
        setIsFading(true);

        await new Promise((resolve) => setTimeout(resolve, 220));
        video.currentTime = 0;
        await video.play().catch(() => undefined);

        setIsFading(false);
        setTimeout(() => {
          loopingRef.current = false;
        }, 260);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={`${className ?? ""} transition-opacity duration-300 ${isFading ? "opacity-0" : "opacity-100"}`}
      autoPlay
      muted
      playsInline
      preload="metadata"
    />
  );
}
