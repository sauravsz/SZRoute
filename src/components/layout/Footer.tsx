import React from "react";
import { Github, ArrowUpRight, Heart, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[var(--bg-card)] border-t border-[var(--separator)] mt-20 py-12 px-6 lg:px-12 text-[14px]">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="font-bold text-[16px] tracking-tight text-[var(--label-primary)]">
              SZRoute
            </span>
          </div>
          <p className="text-[var(--label-secondary)] text-[13px] leading-relaxed">
            Free AI Gateway & Multi-Provider Router engineered for the <strong className="text-[var(--label-primary)]">Oh My Pi (omp)</strong> coding harness. Connect to 160+ providers with RTK token compression.
          </p>
          <div className="pt-1">
            <a
              href="https://github.com/sauravsz/SZRoute"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--system-blue)] hover:underline"
            >
              <Github className="w-4 h-4" /> GitHub Repository <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Column 1: Models & Combos */}
        <div className="space-y-2.5">
          <h4 className="text-[13px] font-bold text-[var(--label-primary)] uppercase tracking-wider">
            Combos & Models
          </h4>
          <ul className="space-y-1.5 text-[var(--label-secondary)] text-[13px]">
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">free-auto (Groq + Cerebras)</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">code-expert (Claude 3.7 + R1)</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">fast-reasoning (LPU 2000 tps)</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">balanced-pro (Gemini 2.5 Pro)</li>
          </ul>
        </div>

        {/* Column 2: Architecture */}
        <div className="space-y-2.5">
          <h4 className="text-[13px] font-bold text-[var(--label-primary)] uppercase tracking-wider">
            Architecture
          </h4>
          <ul className="space-y-1.5 text-[var(--label-secondary)] text-[13px]">
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">Vercel Serverless & Edge</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">RTK + Caveman Compression</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">Model Context Protocol (MCP)</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">OAuth 2.0 PKCE & Device Auth</li>
          </ul>
        </div>

        {/* Column 3: Integrations */}
        <div className="space-y-2.5">
          <h4 className="text-[13px] font-bold text-[var(--label-primary)] uppercase tracking-wider">
            Integrations
          </h4>
          <ul className="space-y-1.5 text-[var(--label-secondary)] text-[13px]">
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">Oh My Pi (omp) Coding Agent</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">Cursor IDE</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">Cline & Roo Code</li>
            <li className="hover:text-[var(--system-blue)] cursor-pointer transition-colors">Codex & Antigravity</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto mt-10 pt-6 border-t border-[var(--separator)] flex flex-col sm:flex-row items-center justify-between text-[var(--label-secondary)] text-[12px] gap-4">
        <div>
          © {new Date().getFullYear()} SZRoute. Apple HIG & SwiftUI animated design system.
        </div>
        <div className="flex items-center gap-1.5">
          Designed for <span className="font-semibold text-[var(--system-blue)]">Oh My Pi (omp)</span> coding harness
        </div>
      </div>
    </footer>
  );
}
