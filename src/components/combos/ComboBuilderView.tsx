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
  const [editingCombo, setEditingCombo] = useState<VirtualCombo | null>(null);
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
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Combos & Auto-Fallback Chains
          </h2>
          <p className="text-[14px] text-[#9c9c9d] mt-1">
            Build multi-tiered virtual model aliases with priority auto-failover, round-robin, or lowest latency routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={handleResetToDefaults} className="btn-secondary text-[13px]">
            Reset to Defaults
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary text-[13px] flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Create Custom Combo
          </button>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {combos.map((combo) => (
          <div key={combo.id} className="raycast-card p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#121212] border border-[#242728] flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[#59d499]" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">{combo.name}</h3>
                    <code className="text-[12px] text-[#57c1ff] font-mono">model: &quot;{combo.id}&quot;</code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-[#101111] text-[#cdcdcd] border border-[#242728] rounded uppercase">
                    {combo.strategy}
                  </span>
                  {!DEFAULT_COMBOS.some((d) => d.id === combo.id) && (
                    <button
                      onClick={() => handleDeleteCombo(combo.id)}
                      className="p-1.5 text-[#6a6b6c] hover:text-[#ff6161] hover:bg-[#ff6161]/10 rounded"
                      title="Delete combo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[13px] text-[#cdcdcd] leading-relaxed">
                {combo.description}
              </p>

              {/* Targets Fallback Ladder */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] uppercase tracking-wider text-[#6a6b6c] font-medium">
                  Failover Execution Ladder
                </div>
                <div className="space-y-1.5">
                  {combo.targets.map((t, index) => {
                    const provider = PROVIDER_CATALOG.find((p) => p.id === t.providerId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-[#101111] border border-[#242728] rounded-lg text-[13px]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#121212] border border-[#242728] flex items-center justify-center text-[11px] text-[#9c9c9d] font-mono">
                            {index + 1}
                          </span>
                          <span className="font-medium text-white">
                            {provider?.name || t.providerId}
                          </span>
                          <span className="text-[#6a6b6c]">/</span>
                          <span className="font-mono text-[12px] text-[#cdcdcd]">
                            {t.modelId}
                          </span>
                        </div>

                        <span className="text-[11px] text-[#59d499] font-mono">
                          {index === 0 ? "Primary Target" : `Tier ${index + 1} Fallback`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Test Hint */}
            <div className="pt-3 border-t border-[#242728] flex items-center justify-between text-[12px] text-[#9c9c9d]">
              <span>Try in API: <code className="font-mono text-white">model: &quot;{combo.id}&quot;</code></span>
              <span className="text-[#59d499] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Failover
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Custom Combo Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
          <div
            className="w-full max-w-2xl bg-[#0d0d0d] border border-[#242728] rounded-xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#242728] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#121212] border border-[#242728] flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#59d499]" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">Create Virtual Combo</h3>
                  <p className="text-[12px] text-[#9c9c9d]">
                    Combine multiple providers into a resilient virtual model endpoint
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 text-[#6a6b6c] hover:text-white rounded hover:bg-[#121212]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#cdcdcd]">Combo ID / Slug</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. my-coding-chain"
                  className="w-full bg-[#101111] text-white border border-[#242728] rounded-lg px-3 py-2 text-[13px] outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#cdcdcd]">Display Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. My Fast Coding Chain"
                  className="w-full bg-[#101111] text-white border border-[#242728] rounded-lg px-3 py-2 text-[13px] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#cdcdcd]">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short description of this routing combo..."
                className="w-full bg-[#101111] text-white border border-[#242728] rounded-lg px-3 py-2 text-[13px] outline-none"
              />
            </div>

            {/* Targets Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-[#cdcdcd]">
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
                  className="text-[12px] text-[#57c1ff] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Target Tier
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {newTargets.map((target, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-[#101111] border border-[#242728] rounded-lg text-[13px]"
                  >
                    <span className="w-6 text-center text-[#9c9c9d] font-mono text-[11px]">
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
                      className="bg-[#121212] text-white border border-[#242728] rounded px-2 py-1 text-[12px] outline-none"
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
                      className="flex-1 bg-[#121212] text-white border border-[#242728] rounded px-2 py-1 text-[12px] font-mono outline-none"
                    />

                    {newTargets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewTargets(newTargets.filter((_, i) => i !== idx));
                        }}
                        className="p-1 text-[#6a6b6c] hover:text-[#ff6161]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#242728]">
              <button
                onClick={() => setIsCreatingNew(false)}
                className="btn-secondary text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewCombo}
                className="btn-primary text-[13px] px-4"
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
