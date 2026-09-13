import React from "react";
import { Zap, Github, BookOpen, ShieldCheck, Terminal, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#07080a] border-t border-[#242728] mt-24 py-16 px-4 sm:px-6">
      <div className="max-w-[1360px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-[13px]">
        {/* Brand Column */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#121212] border border-[#242728] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#ff6161]" />
            </div>
            <span className="font-semibold text-white tracking-tight text-[14px]">
              SZRoute
            </span>
          </div>
          <p className="text-[#9c9c9d] text-[13px] leading-relaxed max-w-sm">
            The Free AI Gateway & Multi-Provider Router. Connect Claude Code, Cursor, Cline & Codex to 160+ providers with RTK token compression and automatic failover.
          </p>
          <div className="flex items-center gap-3 pt-2 text-[#9c9c9d]">
            <a
              href="https://github.com/sauravsz/SZRoute"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <span>•</span>
            <span className="text-[#6a6b6c]">Vercel Edge Ready</span>
          </div>
        </div>

        {/* Column 1: Integrations */}
        <div className="space-y-2.5">
          <h4 className="font-medium text-white text-[13px]">Integrations</h4>
          <ul className="space-y-2 text-[#9c9c9d]">
            <li className="hover:text-white cursor-pointer transition-colors">Claude Code</li>
            <li className="hover:text-white cursor-pointer transition-colors">Cursor IDE</li>
            <li className="hover:text-white cursor-pointer transition-colors">Cline & Roo Code</li>
            <li className="hover:text-white cursor-pointer transition-colors">Codex & Antigravity</li>
            <li className="hover:text-white cursor-pointer transition-colors">LiteLLM & OpenAI SDK</li>
          </ul>
        </div>

        {/* Column 2: Free Tiers */}
        <div className="space-y-2.5">
          <h4 className="font-medium text-white text-[13px]">Top Free Tiers</h4>
          <ul className="space-y-2 text-[#9c9c9d]">
            <li className="hover:text-white cursor-pointer transition-colors">Groq LPU (150M tokens/mo)</li>
            <li className="hover:text-white cursor-pointer transition-colors">Cerebras (2,000+ tok/s)</li>
            <li className="hover:text-white cursor-pointer transition-colors">Google Gemini Studio</li>
            <li className="hover:text-white cursor-pointer transition-colors">OpenRouter :free Tiers</li>
            <li className="hover:text-white cursor-pointer transition-colors">Cloudflare Workers AI</li>
          </ul>
        </div>

        {/* Column 3: Features */}
        <div className="space-y-2.5">
          <h4 className="font-medium text-white text-[13px]">Features</h4>
          <ul className="space-y-2 text-[#9c9c9d]">
            <li className="hover:text-white cursor-pointer transition-colors">RTK + Caveman Compression</li>
            <li className="hover:text-white cursor-pointer transition-colors">Smart Auto-Failover</li>
            <li className="hover:text-white cursor-pointer transition-colors">Multi-Model Combos</li>
            <li className="hover:text-white cursor-pointer transition-colors">Streaming SSE Edge Proxy</li>
            <li className="hover:text-white cursor-pointer transition-colors">Real-time Traffic Inspector</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto mt-12 pt-6 border-t border-[#242728] flex flex-col sm:flex-row items-center justify-between text-[#6a6b6c] text-[12px] gap-4">
        <div>
          © {new Date().getFullYear()} SZRoute. MIT Licensed. Open-source developer tools.
        </div>
        <div className="flex items-center gap-1 text-[#9c9c9d]">
          Designed with <Heart className="w-3.5 h-3.5 text-[#ff6161] mx-0.5 fill-[#ff6161]" /> for autonomous AI workflows
        </div>
      </div>
    </footer>
  );
}
