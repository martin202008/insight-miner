"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    let contentX = 0;
    let contentY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    };

    const animate = () => {
      // Glow follows mouse with spring physics
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;

      // Content subtle parallax
      contentX += (mouseX - contentX) * 0.05;
      contentY += (mouseY - contentY) * 0.05;

      if (glowRef.current) {
        glowRef.current.style.background = `
          radial-gradient(600px circle at ${50 + glowX * 50}% ${50 + glowY * 50}%,
            hsla(119, 99%, 46%, 0.15),
            transparent 50%
          )
        `;
        glowRef.current.style.transform = `translate(${glowX * 20}px, ${glowY * 20}px)`;
      }

      if (contentRef.current) {
        contentRef.current.style.transform = `translate(${contentX * 10}px, ${contentY * 8}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    const section = sectionRef.current;
    section?.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      section?.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden">
      {/* Mouse-following glow effect */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none z-[2] transition-transform duration-100 ease-out"
      />

      {/* Spline 3D Background - receives mouse events for cursor-following effect */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />

      {/* Content container */}
      <div
        ref={contentRef}
        className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-12 pt-32"
        style={{ transition: "transform 0.1s ease-out" }}
      >
        {/* Heading */}
        <h1
          className={`font-heading italic text-[clamp(4rem,10vw,8rem)] font-bold leading-[0.95] tracking-tight text-foreground mb-6 ${isLoaded ? "opacity-0 animate-fade-up" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          订正星
        </h1>

        {/* Tagline */}
        <p
          className={`font-sora font-light text-[clamp(1.25rem,3vw,2rem)] text-primary mb-8 md:mb-10 ${isLoaded ? "opacity-0 animate-fade-up" : "opacity-0"}`}
          style={{ animationDelay: "0.35s" }}
        >
          · 让 AI 帮你打工
        </p>

        {/* Subheading */}
        <p
          className={`font-sora text-[clamp(1rem,2vw,1.375rem)] font-light text-foreground/60 leading-relaxed mb-6 ${isLoaded ? "opacity-0 animate-fade-up" : "opacity-0"}`}
          style={{ animationDelay: "0.5s" }}
        >
          探索 AI 工具的无限可能
        </p>

        {/* Description */}
        <p
          className={`font-sora text-[clamp(0.875rem,1.2vw,1rem)] font-light text-muted-foreground leading-relaxed max-w-xl mb-8 ${isLoaded ? "opacity-0 animate-fade-up" : "opacity-0"}`}
          style={{ animationDelay: "0.65s" }}
        >
          从内容创作到视觉生产，订正星 AI 工具矩阵为创作者和中小企业提供高效、可控、具备工业级品质的 AI 工作流。
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-wrap gap-4 font-sora font-semibold pointer-events-auto ${isLoaded ? "opacity-0 animate-fade-up" : "opacity-0"}`}
          style={{ animationDelay: "0.8s" }}
        >
          <a
            href="/marketing"
            className="bg-primary text-primary-foreground px-8 py-3.5 text-sm rounded-sm cursor-pointer hover:brightness-110 transition-all active:scale-[0.97] tracking-wide"
          >
            开始探索
          </a>
          <button className="bg-white/10 backdrop-blur-sm text-foreground border border-white/20 px-8 py-3.5 text-sm rounded-sm cursor-pointer hover:bg-white/20 transition-all active:scale-[0.97] tracking-wide">
            观看演示
          </button>
        </div>

        {/* Trust line */}
        <p
          className={`font-sora text-muted-foreground/50 text-xs font-light mt-10 ${isLoaded ? "opacity-0 animate-fade-up" : "opacity-0"}`}
          style={{ animationDelay: "0.95s" }}
        >
          4 款 AI 产品已上线 · 全程 AI 驱动开发
        </p>
      </div>
    </section>
  );
}
