"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { name: "首页", href: "/" },
  { name: "AI工具", href: "#products", hasSubmenu: true },
  { name: "技巧", href: "#tips", hasSubmenu: true },
  { name: "关于", href: "/about" },
];

const productSubmenu = [
  { name: "洞察挖掘器", href: "/analyze", desc: "AI 驱动的竞品调研工具" },
  { name: "视频智剪", href: "/clipper", desc: "AI 自动提取视频高光" },
  { name: "AI 配音", href: "/tts", desc: "文字转配音" },
  { name: "小红书生成", href: "/xiaohongshu", desc: "AI 创作小红书内容" },
  { name: "报告生成", href: "/report", desc: "AI 生成专业分析报告" },
  { name: "数字营销", href: "/marketing", desc: "一键探索全链路数字营销" },
];

const tipsSubmenu = [
  { name: "提示词模板", href: "/prompts", desc: "精选提示词模板库" },
  { name: "使用教程", href: "#tutorials", desc: "各工具使用教程" },
];

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setMobileSubmenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSubmenuOpen(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 sm:px-6 lg:px-16 py-3 sm:py-4"
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Mobile: Logo left, menu button right; Desktop: centered */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between md:justify-center gap-8 lg:gap-16">
          {/* Logo with brand name */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="订正星" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span
              className="text-lg sm:text-2xl font-extrabold tracking-wider"
              style={{
                fontFamily: "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
                background: "linear-gradient(135deg, #ffffff 0%, #a3ffb4 50%, #ffffff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 30px rgba(163, 255, 180, 0.3)",
              }}
            >
              订正星
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              {link.hasSubmenu ? (
                <>
                  <button className="flex items-center gap-1 text-white/80 hover:text-white transition-colors py-2">
                    <span>{link.name}</span>
                    <svg
                      className="w-3 h-3 transition-transform group-hover:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                    style={{
                      background: "rgba(20, 20, 20, 0.98)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div className="py-2">
                      {(link.name === "AI工具" ? productSubmenu : tipsSubmenu).map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="flex flex-col px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-white/90 font-medium text-sm">{item.name}</span>
                          <span className="text-white/40 text-xs mt-0.5">{item.desc}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <a
                  href={link.href}
                  className="text-white/80 hover:text-white transition-colors py-2"
                >
                  {link.name}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ top: "56px" }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div
            className="relative w-full py-4 px-4 space-y-1"
            style={{
              background: "rgba(15, 15, 15, 0.98)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.hasSubmenu ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMobileSubmenuOpen(!mobileSubmenuOpen);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                    >
                      <span>{link.name}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${mobileSubmenuOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileSubmenuOpen && (
                      <div className="pl-4 space-y-1 mt-1">
                        {(link.name === "AI工具" ? productSubmenu : tipsSubmenu).map((item) => (
                          <button
                            key={item.name}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileSubmenuOpen(false);
                              router.push(item.href);
                            }}
                            className="w-full text-left block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                          >
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-xs text-white/40 mt-0.5">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors rounded-lg w-full text-left"
                  >
                    {link.name}
                  </button>
                )}
              </div>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10">
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-center rounded-lg font-medium"
                style={{
                  background: "rgba(119, 99%, 46%, 0.2)",
                  border: "1px solid rgba(119, 99%, 46%, 0.4)",
                  color: "hsl(119, 99%, 60%)",
                }}
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}