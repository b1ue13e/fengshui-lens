"use client";

import Link from "next/link";
import { Camera, Github, Twitter, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { label: "空间诊断", href: "/analyze" },
    { label: "示例报告", href: "/report" },
    { label: "定价方案", href: "#" },
  ],
  about: [
    { label: "关于我们", href: "#" },
    { label: "方法论", href: "#" },
    { label: "常见问题", href: "#" },
  ],
  legal: [
    { label: "隐私政策", href: "#" },
    { label: "使用条款", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200/60">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-subtle">
                <Camera className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-stone-900 leading-none">
                  FengShui Lens
                </span>
                <span className="text-[10px] font-medium text-stone-500 tracking-wide mt-0.5">
                  空间气场诊断器
                </span>
              </div>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-sm font-light">
              基于空间心理学与现代环境分析的空间布局诊断工具。
              不是算命，而是科学的空间优化建议。
            </p>
            <div className="flex items-center gap-2 mt-6">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Mail, href: "#", label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-4">
                  产品
                </h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone-500 hover:text-stone-900 transition-colors font-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-4">
                  关于
                </h3>
                <ul className="space-y-3">
                  {footerLinks.about.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone-500 hover:text-stone-900 transition-colors font-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-4">
                  法律
                </h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone-500 hover:text-stone-900 transition-colors font-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-400 font-light">
              © {new Date().getFullYear()} FengShui Lens. All rights reserved.
            </p>
            <p className="text-xs text-stone-400 font-light">
              Designed for better living spaces
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
