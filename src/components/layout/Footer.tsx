import React from "react";
import { Github, ArrowUpRight, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#f7f7f7] text-[#262626] mt-24 border-t border-[#e6e6e6]">
      {/* BMW M-Tricolor Stripe Accent Divider */}
      <div className="m-stripe-divider" />

      <div className="max-w-[1440px] mx-auto py-16 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-[14px]">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[#1c69d4] bg-[#ffffff] grid grid-cols-2 grid-rows-2 overflow-hidden">
                <div className="bg-[#1c69d4]" />
                <div className="bg-[#ffffff]" />
                <div className="bg-[#ffffff]" />
                <div className="bg-[#1c69d4]" />
              </div>
              <span className="font-bold text-[#262626] text-[16px] tracking-tight">
                SZRoute Corporate
              </span>
            </div>
            <p className="text-[#3c3c3c] font-light text-[14px] leading-relaxed">
              Enterprise AI Gateway & Multi-Provider Router for the <strong className="font-bold text-[#262626]">Oh My Pi (omp)</strong> coding harness. Engineered for wafer-scale inference and zero-latency failover.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com/sauravsz/SZRoute"
                target="_blank"
                rel="noreferrer"
                className="btn-text-link text-[12px]"
              >
                GITHUB REPOSITORY <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 1: Models & Combos */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-[1.5px] text-[#262626]">
              Combos & Models
            </h4>
            <ul className="space-y-2 text-[#3c3c3c] font-light text-[14px]">
              <li><span className="hover:text-[#1c69d4] cursor-pointer">free-auto (Groq + Cerebras)</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">code-expert (Claude 3.7 + R1)</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">fast-reasoning (LPU 2000 tps)</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">balanced-pro (Gemini 2.5 Pro)</span></li>
            </ul>
          </div>

          {/* Column 2: Architecture */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-[1.5px] text-[#262626]">
              Architecture
            </h4>
            <ul className="space-y-2 text-[#3c3c3c] font-light text-[14px]">
              <li><span className="hover:text-[#1c69d4] cursor-pointer">Vercel Serverless & Edge</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">RTK + Caveman Compression</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">Model Context Protocol (MCP)</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">OAuth 2.0 PKCE & Device Auth</span></li>
            </ul>
          </div>

          {/* Column 3: Integrations */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-[1.5px] text-[#262626]">
              Integrations
            </h4>
            <ul className="space-y-2 text-[#3c3c3c] font-light text-[14px]">
              <li><span className="hover:text-[#1c69d4] cursor-pointer">Oh My Pi (omp) Coding Agent</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">Cursor IDE</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">Cline & Roo Code</span></li>
              <li><span className="hover:text-[#1c69d4] cursor-pointer">Codex & Antigravity</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-[#e6e6e6] flex flex-col sm:flex-row items-center justify-between text-[#6b6b6b] text-[13px] font-light gap-4">
          <div>
            © {new Date().getFullYear()} SZRoute. Engineered for European precision and autonomous agent workflows.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[#262626] font-bold text-[12px] uppercase tracking-[1px]">
              BMW Type Automotive Dialect
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
