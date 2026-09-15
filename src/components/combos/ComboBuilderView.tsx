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
    setNewDesc("Engineered failover across multiple free & commercial models.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e6e6] pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#262626] tracking-tight">
            Virtual Combos & Model Chains
          </h2>
          <p className="text-[15px] text-[#3c3c3c] font-light mt-1">
            Engineered multi-tier fallback routing and priority chains for the Oh My Pi (omp) coding agent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleResetToDefaults} className="btn-secondary text-[12px] h-10 px-4 uppercase tracking-[0.5px]">
            RESET DEFAULTS
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary text-[12px] h-10 px-5 uppercase tracking-[0.5px]">
            <Plus className="w-4 h-4" />
            CREATE COMBO
          </button>
        </div>
      </div>

      {/* Combos 4-Up Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {combos.map((combo) => (
          <div key={combo.id} className="bmw-card space-y-5 flex flex-col justify-between hover:border-[#1c69d4] transition-colors">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[1.5px] text-[#1c69d4] font-bold">
                    {combo.strategy} STRATEGY
                  </div>
                  <h3 className="text-[18px] font-bold text-[#262626] mt-0.5">
                    {combo.name}
                  </h3>
                  <code className="text-[12px] text-[#6b6b6b] font-mono block mt-0.5">
                    model: &quot;{combo.id}&quot;
                  </code>
                </div>

                {!DEFAULT_COMBOS.some((d) => d.id === combo.id) && (
                  <button
                    onClick={() => handleDeleteCombo(combo.id)}
                    className="p-1.5 text-[#dc2626] hover:bg-[#fafafa] border border-[#dc2626]"
                    title="Delete combo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-[14px] text-[#3c3c3c] font-light leading-relaxed">
                {combo.description}
              </p>

              {/* Failover Targets Ladder */}
              <div className="space-y-2 pt-2 border-t border-[#f7f7f7]">
                <div className="text-[11px] uppercase tracking-[1.5px] text-[#6b6b6b] font-bold">
                  Failover Execution Order
                </div>
                <div className="space-y-1.5">
                  {combo.targets.map((t, index) => {
                    const provider = PROVIDER_CATALOG.find((p) => p.id === t.providerId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-[#f7f7f7] border border-[#e6e6e6] text-[13px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 bg-[#ffffff] border border-[#cccccc] font-bold text-[11px] text-[#262626] flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-bold text-[#262626]">
                            {provider?.name || t.providerId}
                          </span>
                          <span className="text-[#6b6b6b]">/</span>
                          <span className="font-mono text-[12px] text-[#3c3c3c]">
                            {t.modelId}
                          </span>
                        </div>

                        <span className="text-[11px] text-[#1c69d4] font-bold uppercase tracking-[0.5px]">
                          {index === 0 ? "PRIMARY" : `TIER ${index + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e6e6e6] flex items-center justify-between text-[12px]">
              <span className="text-[#6b6b6b] font-light">
                Use in omp: <code className="font-bold text-[#262626]">--model {combo.id}</code>
              </span>
              <span className="text-[#22c55e] font-bold flex items-center gap-1 uppercase tracking-[0.5px]">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Failover
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Combo Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2129]/75 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-[#ffffff] border-2 border-[#1c69d4] shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3">
              <div>
                <div className="text-[11px] uppercase tracking-[1.5px] text-[#1c69d4] font-bold">VIRTUAL ROUTING</div>
                <h3 className="text-lg font-bold text-[#262626]">Create Custom Combo</h3>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 text-[#6b6b6b] hover:text-[#262626]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#262626] uppercase tracking-[0.5px]">Combo Slug</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. fast-chain"
                  className="bmw-input w-full font-mono text-[13px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#262626] uppercase tracking-[0.5px]">Display Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Fast Coding Chain"
                  className="bmw-input w-full text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#262626] uppercase tracking-[0.5px]">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Routing description..."
                className="bmw-input w-full text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-[#262626] uppercase tracking-[0.5px]">
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
                  className="btn-text-link text-[11px]"
                >
                  <Plus className="w-3 h-3" /> ADD TIER
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {newTargets.map((target, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-[#f7f7f7] border border-[#e6e6e6] text-[12px]"
                  >
                    <span className="w-5 text-center text-[#262626] font-bold">#{idx + 1}</span>
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
                      className="bg-[#ffffff] text-[#262626] font-bold border border-[#cccccc] px-2 py-1 outline-none text-[12px]"
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
                      className="flex-1 bg-[#ffffff] text-[#262626] border border-[#cccccc] px-2 py-1 font-mono text-[12px] outline-none"
                    />

                    {newTargets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewTargets(newTargets.filter((_, i) => i !== idx))}
                        className="p-1 text-[#dc2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e6e6e6]">
              <button
                onClick={() => setIsCreatingNew(false)}
                className="btn-secondary text-[12px] h-9 px-4 uppercase tracking-[0.5px]"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveNewCombo}
                className="btn-primary text-[12px] h-9 px-5 uppercase tracking-[0.5px]"
              >
                SAVE COMBO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
