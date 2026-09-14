import React from "react";
import { Zap, Github, Terminal, ArrowUpRight, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#0e0f0c] text-[#e8ebe6] mt-24 py-16 px-4 sm:px-6">
      <div className="max-w-[1360px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-[14px]">
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#9fe870] flex items-center justify-center font-black text-[#0e0f0c] text-sm">
              SZ
            </div>
            <span className="font-black text-white tracking-tight text-[18px]">
              SZRoute<span className="text-[#9fe870]">.</span>
            </span>
          </div>
          <p className="text-[#868685] text-[14px] leading-relaxed max-w-sm">
            The Free AI Gateway & Multi-Provider Router for the <strong className="text-[#9fe870]">Oh My Pi (omp)</strong> coding agent. 160+ providers, 50+ free tiers, RTK token compression, and zero-latency failover.
          </p>
          <div className="flex items-center gap-4 pt-2 text-[#868685]">
            <a
              href="https://github.com/sauravsz/SZRoute"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#9fe870] flex items-center gap-1.5 transition-colors font-medium text-[13px]"
            >
              <Github className="w-4 h-4" /> GitHub Repository <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <span>•</span>
            <span className="text-[#9fe870] font-semibold text-[13px]">Vercel Edge Ready</span>
          </div>
        </div>

        {/* Column 1: Integrations */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-[14px]">Integrations</h4>
          <ul className="space-y-2 text-[#868685]">
            <li className="hover:text-white cursor-pointer transition-colors">Oh My Pi (omp) Agent</li>
            <li className="hover:text-white cursor-pointer transition-colors">Cursor IDE</li>
            <li className="hover:text-white cursor-pointer transition-colors">Cline & Roo Code</li>
            <li className="hover:text-white cursor-pointer transition-colors">Codex & Antigravity</li>
            <li className="hover:text-white cursor-pointer transition-colors">LiteLLM & OpenAI SDK</li>
          </ul>
        </div>

        {/* Column 2: Free Tiers */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-[14px]">Free Tiers</h4>
          <ul className="space-y-2 text-[#868685]">
            <li className="hover:text-white cursor-pointer transition-colors">Groq LPU (150M tokens/mo)</li>
            <li className="hover:text-white cursor-pointer transition-colors">Cerebras (2,000+ tok/s)</li>
            <li className="hover:text-white cursor-pointer transition-colors">Google Gemini AI Studio</li>
            <li className="hover:text-white cursor-pointer transition-colors">OpenRouter :free Tiers</li>
            <li className="hover:text-white cursor-pointer transition-colors">Cloudflare Workers AI</li>
          </ul>
        </div>

        {/* Column 3: Capabilities */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-[14px]">Capabilities</h4>
          <ul className="space-y-2 text-[#868685]">
            <li className="hover:text-white cursor-pointer transition-colors">RTK + Caveman Compression</li>
            <li className="hover:text-white cursor-pointer transition-colors">MCP Server Protocol</li>
            <li className="hover:text-white cursor-pointer transition-colors">Fast Code Reranker</li>
            <li className="hover:text-white cursor-pointer transition-colors">Audio Whisper Transcription</li>
            <li className="hover:text-white cursor-pointer transition-colors">FLUX.1 Image Generation</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto mt-14 pt-6 border-t border-[#1a1c17] flex flex-col sm:flex-row items-center justify-between text-[#868685] text-[13px] gap-4">
        <div>
          © {new Date().getFullYear()} SZRoute. MIT Licensed. Open-source Scandinavian fintech aesthetic.
        </div>
        <div className="flex items-center gap-1.5 text-[#e8ebe6]">
          Engineered for <span className="text-[#9fe870] font-bold">Oh My Pi (omp)</span> coding harness
        </div>
      </div>
    </footer>
  );
}
