"use client";

import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

interface ComponentInput {
  id?: string;
  product: string;
  amount: string;
  unit: string;
}

interface FormulaInput {
  id?: string;
  name: string;
  developer: string;
  ratio: string;
  processingMin: string;
  notes: string;
  components: ComponentInput[];
}

interface SessionData {
  id: string;
  notes: string | null;
  formulas: {
    id: string;
    name: string;
    developer: string | null;
    ratio: string | null;
    processingMin: number | null;
    notes: string | null;
    components: {
      id: string;
      product: string;
      amount: number;
      unit: string;
    }[];
  }[];
}

function toFormData(session: SessionData): {
  sessionNotes: string;
  formulas: FormulaInput[];
} {
  return {
    sessionNotes: session.notes || "",
    formulas: session.formulas.map((f) => ({
      id: f.id,
      name: f.name,
      developer: f.developer || "",
      ratio: f.ratio || "",
      processingMin: f.processingMin?.toString() || "",
      notes: f.notes || "",
      components: f.components.map((c) => ({
        id: c.id,
        product: c.product,
        amount: c.amount.toString(),
        unit: c.unit,
      })),
    })),
  };
}

export function EditSessionForm({
  session,
  onSave,
  onCancel,
}: {
  session: SessionData;
  onSave: () => void;
  onCancel: () => void;
}) {
  const initial = toFormData(session);
  const [formulas, setFormulas] = useState<FormulaInput[]>(initial.formulas);
  const [sessionNotes, setSessionNotes] = useState(initial.sessionNotes);
  const [loading, setLoading] = useState(false);

  function addFormula() {
    setFormulas([
      ...formulas,
      { name: "", developer: "", ratio: "", processingMin: "", notes: "", components: [{ product: "", amount: "", unit: "oz" }] },
    ]);
  }

  function removeFormula(idx: number) {
    setFormulas(formulas.filter((_, i) => i !== idx));
  }

  function updateFormula(idx: number, field: keyof FormulaInput, value: string) {
    const updated = [...formulas];
    if (field !== "components") {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    setFormulas(updated);
  }

  function addComponent(fi: number) {
    const updated = [...formulas];
    updated[fi].components.push({ product: "", amount: "", unit: "oz" });
    setFormulas(updated);
  }

  function removeComponent(fi: number, ci: number) {
    const updated = [...formulas];
    updated[fi].components = updated[fi].components.filter((_, i) => i !== ci);
    setFormulas(updated);
  }

  function updateComponent(fi: number, ci: number, field: string, value: string) {
    const updated = [...formulas];
    updated[fi].components[ci] = { ...updated[fi].components[ci], [field]: value };
    setFormulas(updated);
  }

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: sessionNotes || null,
        formulas: formulas
          .filter((f) => f.name.trim())
          .map((f) => ({
            name: f.name.trim(),
            developer: f.developer || null,
            ratio: f.ratio || null,
            processingMin: f.processingMin ? parseInt(f.processingMin) : null,
            notes: f.notes || null,
            components: f.components
              .filter((c) => c.product.trim())
              .map((c) => ({
                product: c.product.trim(),
                amount: parseFloat(c.amount) || 0,
                unit: c.unit,
              })),
          })),
      }),
    });

    if (res.ok) {
      onSave();
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {formulas.map((formula, fi) => (
        <div key={fi} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Formula {formulas.length > 1 ? fi + 1 : ""}</h3>
            {formulas.length > 1 && (
              <button type="button" onClick={() => removeFormula(fi)} className="text-red-500 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <input
            value={formula.name}
            onChange={(e) => updateFormula(fi, "name", e.target.value)}
            placeholder="Name (e.g., Base, Hairline, Toner)"
            className="touch-target w-full bg-background border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <div className="flex gap-2">
            <select
              value={formula.developer}
              onChange={(e) => updateFormula(fi, "developer", e.target.value)}
              className="touch-target flex-1 bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Developer</option>
              <option value="10V">10 Vol</option>
              <option value="15V">15 Vol</option>
              <option value="20V">20 Vol</option>
              <option value="30V">30 Vol</option>
              <option value="40V">40 Vol</option>
            </select>
            <select
              value={formula.ratio}
              onChange={(e) => updateFormula(fi, "ratio", e.target.value)}
              className="touch-target w-28 bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Ratio</option>
              <option value="1:1">1:1</option>
              <option value="1:1.5">1:1.5</option>
              <option value="1:2">1:2</option>
            </select>
          </div>

          {formula.components.map((comp, ci) => (
            <div key={ci} className="flex gap-2 items-center pl-2 border-l-2 border-accent-light">
              <input
                value={comp.product}
                onChange={(e) => updateComponent(fi, ci, "product", e.target.value)}
                placeholder="Product"
                className="touch-target flex-1 bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                value={comp.amount}
                onChange={(e) => updateComponent(fi, ci, "amount", e.target.value)}
                placeholder="Amt"
                type="number"
                step="0.01"
                className="touch-target w-20 bg-background border border-border rounded-xl px-3 py-3 text-base text-center focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <select
                value={comp.unit}
                onChange={(e) => updateComponent(fi, ci, "unit", e.target.value)}
                className="touch-target w-16 bg-background border border-border rounded-xl px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="oz">oz</option>
                <option value="g">g</option>
                <option value="tube">tube</option>
              </select>
              {formula.components.length > 1 && (
                <button type="button" onClick={() => removeComponent(fi, ci)} className="text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={() => addComponent(fi)} className="inline-flex items-center gap-1 text-accent text-sm font-medium">
            <PlusCircle className="w-4 h-4" /> Add component
          </button>

          <div className="flex gap-2">
            <input
              value={formula.processingMin}
              onChange={(e) => updateFormula(fi, "processingMin", e.target.value)}
              type="number"
              placeholder="Processing min"
              className="touch-target flex-1 bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <textarea
            value={formula.notes}
            onChange={(e) => updateFormula(fi, "notes", e.target.value)}
            rows={2}
            placeholder="Formula notes"
            className="w-full bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      ))}

      <button type="button" onClick={addFormula} className="touch-target w-full border-2 border-dashed border-border rounded-xl py-3 text-muted font-medium hover:border-accent hover:text-accent transition-colors">
        + Add another formula
      </button>

      <div>
        <label className="block text-sm font-medium mb-1">Session Notes</label>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          rows={3}
          placeholder="Pre-treatment, prep steps, general notes..."
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="touch-target flex-1 border border-border rounded-xl py-4 font-semibold text-muted hover:bg-card transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="touch-target flex-1 bg-accent text-white font-semibold rounded-xl py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
