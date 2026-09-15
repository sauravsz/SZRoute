"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ShieldCheck,
  X,
  ChevronRight,
} from "lucide-react";
import { VirtualCombo, DEFAULT_COMBOS, PROVIDER_CATALOG } from "@/lib/providers/catalog";

interface ComboBuilderViewProps {
  customCombos: VirtualCombo[];
  onSaveCombos: (combos: VirtualCombo[]) => void;
}

export function ComboBuilderView({ customCombos, onSaveCombos }: ComboBuilderViewProps) {
  const [combos, setCombos] = useState<VirtualCombo[]>(customCombos);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

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
    setNewName("Custom Coding Chain");
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
    <div className="space-y-6 animate-spring-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Virtual Combos & Model Chains
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
            Multi-tier fallback routing and priority chains for the Oh My Pi (omp) coding agent.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={handleResetToDefaults} className="btn-liquid-secondary text-[12px] h-9 px-4">
            Reset Defaults
          </button>
          <button onClick={handleOpenCreateModal} className="btn-liquid-primary text-[12px] h-9 px-4">
            <Plus className="w-4 h-4" />
            Create Combo
          </button>
        </div>
      </div>

      {/* Combos 2-Up Liquid Glass Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {combos.map((combo) => (
          <div
            key={combo.id}
            className="liquid-glass-interactive p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#34C759] to-[#007AFF] flex items-center justify-center text-white shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-bold text-[#007AFF]">
                      {combo.strategy} Routing
                    </div>
                    <h3 className="text-[17px] font-bold text-[var(--text-primary)]">
                      {combo.name}
                    </h3>
                    <code className="text-[12px] text-[var(--text-secondary)] font-mono block">
                      model: &quot;{combo.id}&quot;
                    </code>
                  </div>
                </div>

                {!DEFAULT_COMBOS.some((d) => d.id === combo.id) && (
                  <button
                    onClick={() => handleDeleteCombo(combo.id)}
                    className="p-1.5 rounded-xl text-[#FF3B30] hover:bg-[#FF3B30]/15"
                    title="Delete combo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {combo.description}
              </p>

              {/* Failover Targets Ladder */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] uppercase font-bold text-[var(--text-tertiary)]">
                  Failover Execution Order
                </div>
                <div className="space-y-1">
                  {combo.targets.map((t, index) => {
                    const provider = PROVIDER_CATALOG.find((p) => p.id === t.providerId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3.5 py-2 bg-[var(--glass-surface-subtle)] rounded-2xl border border-[var(--glass-border-subtle)] text-[13px]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[var(--glass-surface)] font-bold text-[11px] text-[var(--text-primary)] flex items-center justify-center shadow-xs border border-[var(--glass-border-subtle)]">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {provider?.name || t.providerId}
                          </span>
                          <span className="text-[var(--text-tertiary)]">/</span>
                          <span className="font-mono text-[12px] text-[var(--text-secondary)]">
                            {t.modelId}
                          </span>
                        </div>

                        <span className="text-[11px] text-[#007AFF] font-semibold">
                          {index === 0 ? "Primary" : `Tier ${index + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)]">
                In omp: <code className="font-semibold text-[var(--text-primary)]">--model {combo.id}</code>
              </span>
              <span className="text-[#34C759] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Failover
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Combo Glass Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg liquid-glass-elevated p-6 space-y-4 animate-spring-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-3">
              <div>
                <div className="text-[11px] uppercase font-bold text-[#007AFF]">Virtual Routing</div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Create Custom Combo</h3>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[var(--text-primary)]">Combo Slug</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. fast-chain"
                  className="liquid-input w-full font-mono text-[13px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[var(--text-primary)]">Display Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Fast Coding Chain"
                  className="liquid-input w-full text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[var(--text-primary)]">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Routing description..."
                className="liquid-input w-full text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-[var(--text-primary)]">
                  Failover Targets ({newTargets.length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewTargets([
                      ...newTargets,
                      { providerId: "gemini", modelId: "gemini-2.5-flash", priority: newTargets.length + 1 },
                    ]);
                  }}
                  className="text-[12px] text-[#007AFF] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Tier
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {newTargets.map((target, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-[var(--glass-surface-subtle)] rounded-2xl border border-[var(--glass-border-subtle)] text-[12px]"
                  >
                    <span className="w-5 text-center text-[var(--text-primary)] font-bold">#{idx + 1}</span>
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
                      className="bg-[var(--glass-surface)] text-[var(--text-primary)] font-semibold rounded-xl px-2.5 py-1 outline-none text-[12px] border border-[var(--glass-border)] shadow-xs"
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
                      className="flex-1 bg-[var(--glass-surface)] text-[var(--text-primary)] border border-[var(--glass-border)] rounded-xl px-2.5 py-1 font-mono text-[12px] outline-none"
                    />

                    {newTargets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewTargets(newTargets.filter((_, i) => i !== idx))}
                        className="p-1 rounded-lg text-[#FF3B30] hover:bg-[#FF3B30]/15"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--glass-border-subtle)]">
              <button
                onClick={() => setIsCreatingNew(false)}
                className="btn-liquid-secondary text-[12px] h-9 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewCombo}
                className="btn-liquid-primary text-[12px] h-9 px-5"
              >
                Save Combo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
