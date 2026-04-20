"use client";

import { useId, type PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface ElectricBorderCardProps extends PropsWithChildren {
  className?: string;
  contentClassName?: string;
}

export default function ElectricBorderCard({
  children,
  className,
  contentClassName,
}: ElectricBorderCardProps) {
  const filterId = useId().replace(/:/g, "");

  return (
    <div className={cn("electric-border-card card-container", className)}>
      <svg
        aria-hidden="true"
        className="electric-border-card__svg svg-container"
        focusable="false"
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              result="noise1"
              seed="1"
            />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate
                attributeName="dy"
                values="700;0"
                dur="6s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              result="noise2"
              seed="1"
            />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate
                attributeName="dy"
                values="0;-700"
                dur="6s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              result="noise3"
              seed="2"
            />
            <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
              <animate
                attributeName="dx"
                values="490;0"
                dur="6s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              result="noise4"
              seed="2"
            />
            <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
              <animate
                attributeName="dx"
                values="0;-490"
                dur="6s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend
              in="part1"
              in2="part2"
              mode="color-dodge"
              result="combinedNoise"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="combinedNoise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      <div className="inner-container">
        <div
          className="border-outer"
          style={{ filter: `url(#${filterId})` }}
        >
          <div className="main-card" />
        </div>
        <div className="glow-layer-1" />
        <div className="glow-layer-2" />
      </div>

      <div className="overlay-1" />
      <div className="overlay-2" />
      <div className="background-glow" />

      <div
        className={cn(
          "content-container electric-border-card__content",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
