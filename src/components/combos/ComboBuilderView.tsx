"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ShieldCheck,
  X,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Combos & Auto-Fallback Chains
          </h2>
          <p className="text-[14px] text-ink-body font-medium mt-1">
            Build multi-tiered virtual model aliases with priority auto-failover for Oh My Pi (omp).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleResetToDefaults} className="btn-secondary text-[12px] h-9 px-3">
            Reset Defaults
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary text-[12px] h-9 px-4">
            <Plus className="w-4 h-4" />
            Create Combo
          </button>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {combos.map((combo) => (
          <div key={combo.id} className="wise-card p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-ink text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-ink">{combo.name}</h3>
                    <code className="text-[12px] text-ink-mute font-mono font-bold">model: &quot;{combo.id}&quot;</code>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-subtle text-ink rounded-full uppercase">
                    {combo.strategy}
                  </span>
                  {!DEFAULT_COMBOS.some((d) => d.id === combo.id) && (
                    <button
                      onClick={() => handleDeleteCombo(combo.id)}
                      className="p-1 text-ink-mute hover:text-negative rounded-full"
                      title="Delete combo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[13px] text-ink-body leading-relaxed">
                {combo.description}
              </p>

              {/* Targets Fallback Ladder */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] uppercase tracking-wider text-ink-mute font-bold">
                  Failover Order
                </div>
                <div className="space-y-1">
                  {combo.targets.map((t, index) => {
                    const provider = PROVIDER_CATALOG.find((p) => p.id === t.providerId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-subtle rounded-xl text-[13px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-card font-bold text-[11px] text-ink flex items-center justify-center shadow-xs">
                            {index + 1}
                          </span>
                          <span className="font-bold text-ink">
                            {provider?.name || t.providerId}
                          </span>
                          <span className="text-ink-mute">/</span>
                          <span className="font-mono text-[12px] text-ink-body font-semibold">
                            {t.modelId}
                          </span>
                        </div>

                        <span className="text-[11px] text-positive font-bold font-mono">
                          {index === 0 ? "Primary" : `Tier ${index + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between text-[12px] text-ink-mute">
              <span>In API: <code className="font-mono font-bold text-ink">model: &quot;{combo.id}&quot;</code></span>
              <span className="text-positive font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Auto-Failover
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg bg-card rounded-[24px] shadow-2xl p-6 space-y-4 border border-border-subtle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-ink">Create Virtual Combo</h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 text-ink-mute hover:text-ink rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-ink">Combo ID</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. my-chain"
                  className="wise-input w-full font-mono text-[13px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-ink">Display Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Fast Coding Chain"
                  className="wise-input w-full text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-ink">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description..."
                className="wise-input w-full text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-ink">Targets ({newTargets.length})</label>
                <button
                  type="button"
                  onClick={() => {
                    setNewTargets([
                      ...newTargets,
                      { providerId: "gemini", modelId: "gemini-2.5-flash", priority: newTargets.length + 1 },
                    ]);
                  }}
                  className="text-[12px] text-positive font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Tier
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {newTargets.map((target, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-subtle rounded-xl text-[12px]"
                  >
                    <span className="w-5 text-center text-ink font-black">#{idx + 1}</span>
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
                      className="bg-card text-ink font-bold border border-border-subtle rounded-lg px-2 py-1 outline-none text-[12px]"
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
                      className="flex-1 bg-card text-ink border border-border-subtle rounded-lg px-2 py-1 font-mono text-[12px] outline-none"
                    />

                    {newTargets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewTargets(newTargets.filter((_, i) => i !== idx))}
                        className="p-1 text-ink-mute hover:text-negative"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                onClick={() => setIsCreatingNew(false)}
                className="btn-secondary text-[12px] h-8 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewCombo}
                className="btn-primary text-[12px] h-8 px-4"
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
