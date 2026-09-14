"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import { VirtualCombo, DEFAULT_COMBOS, PROVIDER_CATALOG } from "@/lib/providers/catalog";

interface ComboBuilderViewProps {
  customCombos: VirtualCombo[];
  onSaveCombos: (combos: VirtualCombo[]) => void;
}

export function ComboBuilderView({ customCombos, onSaveCombos }: ComboBuilderViewProps) {
  const [combos, setCombos] = useState<VirtualCombo[]>(customCombos);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New combo state
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStrategy, setNewStrategy] = useState<VirtualCombo["strategy"]>("priority");
  const [newTargets, setNewTargets] = useState<VirtualCombo["targets"]>([
    { providerId: "groq", modelId: "llama-3.3-70b-versatile", priority: 1 },
    { providerId: "cerebras", modelId: "llama3.3-70b", priority: 2 },
  ]);

  const handleOpenCreateModal = () => {
    setNewId(`custom-${Date.now().toString(36)}`);
    setNewName("My Custom Fallback Combo");
    setNewDesc("Seamless failover across multiple free & commercial models.");
    setNewStrategy("priority");
    setNewTargets([
      { providerId: "groq", modelId: "llama-3.3-70b-versatile", priority: 1 },
      { providerId: "gemini", modelId: "gemini-2.5-flash", priority: 2 },
    ]);
    setIsCreatingNew(true);
  };

  const handleSaveNewCombo = () => {
    if (!newId.trim() || !newName.trim() || newTargets.length === 0) return;

    const newCombo: VirtualCombo = {
      id: newId.trim().toLowerCase().replace(/\s+/g, "-"),
      name: newName.trim(),
      description: newDesc.trim(),
      strategy: newStrategy,
      targets: newTargets,
    };

    const updated = [...combos, newCombo];
    setCombos(updated);
    onSaveCombos(updated);
    setIsCreatingNew(false);
  };

  const handleDeleteCombo = (id: string) => {
    const updated = combos.filter((c) => c.id !== id);
    setCombos(updated);
    onSaveCombos(updated);
  };

  const handleResetToDefaults = () => {
    setCombos(DEFAULT_COMBOS);
    onSaveCombos(DEFAULT_COMBOS);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0e0f0c] tracking-tight">
            Combos & Auto-Fallback Chains
          </h2>
          <p className="text-[15px] text-[#454745] font-medium mt-1">
            Build multi-tiered virtual model aliases with priority auto-failover and latency routing for Oh My Pi (omp).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleResetToDefaults} className="btn-secondary text-[14px]">
            Reset to Defaults
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary text-[14px] flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Create Custom Combo
          </button>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {combos.map((combo) => (
          <div key={combo.id} className="wise-card space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#9fe870] flex items-center justify-center font-bold text-[#0e0f0c]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-[#0e0f0c]">{combo.name}</h3>
                    <code className="text-[13px] text-[#054d28] font-mono font-bold">model: &quot;{combo.id}&quot;</code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-[11px] font-bold bg-[#e8ebe6] text-[#0e0f0c] rounded-full uppercase">
                    {combo.strategy}
                  </span>
                  {!DEFAULT_COMBOS.some((d) => d.id === combo.id) && (
                    <button
                      onClick={() => handleDeleteCombo(combo.id)}
                      className="p-2 text-[#868685] hover:text-[#d03238] hover:bg-[#320707]/10 rounded-full transition-colors"
                      title="Delete combo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[14px] text-[#454745] leading-relaxed">
                {combo.description}
              </p>

              {/* Targets Fallback Ladder */}
              <div className="space-y-2 pt-2">
                <div className="text-[12px] uppercase tracking-wider text-[#868685] font-bold">
                  Failover Execution Ladder
                </div>
                <div className="space-y-2">
                  {combo.targets.map((t, index) => {
                    const provider = PROVIDER_CATALOG.find((p) => p.id === t.providerId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 py-2.5 bg-[#e8ebe6] rounded-[16px] text-[14px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#ffffff] font-bold text-[12px] text-[#0e0f0c] flex items-center justify-center shadow-xs">
                            {index + 1}
                          </span>
                          <span className="font-bold text-[#0e0f0c]">
                            {provider?.name || t.providerId}
                          </span>
                          <span className="text-[#868685]">/</span>
                          <span className="font-mono text-[13px] text-[#454745] font-semibold">
                            {t.modelId}
                          </span>
                        </div>

                        <span className="text-[12px] text-[#054d28] font-bold font-mono">
                          {index === 0 ? "Primary Target" : `Tier ${index + 1} Fallback`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Test Hint */}
            <div className="pt-3 border-t border-[#e8ebe6] flex items-center justify-between text-[13px] text-[#454745]">
              <span>In API: <code className="font-mono font-bold text-[#0e0f0c]">model: &quot;{combo.id}&quot;</code></span>
              <span className="text-[#2ead4b] font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 100% Failover
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Custom Combo Modal in Wise Style */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e0f0c]/60 backdrop-blur-sm animate-in fade-in duration-100">
          <div
            className="w-full max-w-2xl bg-[#ffffff] rounded-[24px] shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e8ebe6] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9fe870] flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#0e0f0c]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0e0f0c]">Create Virtual Combo</h3>
                  <p className="text-[13px] text-[#454745] font-medium">
                    Combine multiple providers into a resilient virtual model endpoint
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1.5 text-[#868685] hover:text-[#0e0f0c] rounded-full hover:bg-[#e8ebe6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#0e0f0c]">Combo ID / Slug</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. my-coding-chain"
                  className="wise-input w-full font-mono text-[14px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#0e0f0c]">Display Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. My Fast Coding Chain"
                  className="wise-input w-full text-[14px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#0e0f0c]">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short description of this routing combo..."
                className="wise-input w-full text-[14px]"
              />
            </div>

            {/* Targets Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-[#0e0f0c]">
                  Fallback Order ({newTargets.length} targets)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewTargets([
                      ...newTargets,
                      { providerId: "gemini", modelId: "gemini-2.5-flash", priority: newTargets.length + 1 },
                    ]);
                  }}
                  className="text-[13px] text-[#054d28] font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Target Tier
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {newTargets.map((target, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 bg-[#e8ebe6] rounded-[16px] text-[13px]"
                  >
                    <span className="w-6 text-center text-[#0e0f0c] font-black text-[13px]">
                      #{idx + 1}
                    </span>

                    <select
                      value={target.providerId}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        const p = PROVIDER_CATALOG.find((prov) => prov.id === newProv);
                        const updated = [...newTargets];
                        updated[idx] = {
                          ...updated[idx],
                          providerId: newProv,
                          modelId: p?.models[0]?.id || "default",
                        };
                        setNewTargets(updated);
                      }}
                      className="bg-[#ffffff] text-[#0e0f0c] font-bold border border-[#c5edab] rounded-xl px-3 py-1.5 text-[13px] outline-none"
                    >
                      {PROVIDER_CATALOG.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={target.modelId}
                      onChange={(e) => {
                        const updated = [...newTargets];
                        updated[idx] = { ...updated[idx], modelId: e.target.value };
                        setNewTargets(updated);
                      }}
                      placeholder="Model ID"
                      className="flex-1 bg-[#ffffff] text-[#0e0f0c] border border-[#c5edab] rounded-xl px-3 py-1.5 text-[13px] font-mono outline-none"
                    />

                    {newTargets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewTargets(newTargets.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 text-[#868685] hover:text-[#d03238]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e8ebe6]">
              <button
                onClick={() => setIsCreatingNew(false)}
                className="btn-secondary text-[14px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewCombo}
                className="btn-primary text-[14px] px-6"
              >
                Save Virtual Combo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
