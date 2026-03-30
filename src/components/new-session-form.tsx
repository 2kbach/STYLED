"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";

interface ComponentInput {
  product: string;
  amount: string;
  unit: string;
}

interface FormulaInput {
  name: string;
  developer: string;
  ratio: string;
  processingMin: string;
  notes: string;
  components: ComponentInput[];
}

const emptyComponent = (): ComponentInput => ({
  product: "",
  amount: "",
  unit: "oz",
});

const emptyFormula = (): FormulaInput => ({
  name: "",
  developer: "",
  ratio: "",
  processingMin: "",
  notes: "",
  components: [emptyComponent()],
});

export function NewSessionForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formulas, setFormulas] = useState<FormulaInput[]>([emptyFormula()]);
  const [sessionNotes, setSessionNotes] = useState("");

  function addFormula() {
    setFormulas([...formulas, emptyFormula()]);
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

  function addComponent(formulaIdx: number) {
    const updated = [...formulas];
    updated[formulaIdx].components.push(emptyComponent());
    setFormulas(updated);
  }

  function removeComponent(formulaIdx: number, compIdx: number) {
    const updated = [...formulas];
    updated[formulaIdx].components = updated[formulaIdx].components.filter(
      (_, i) => i !== compIdx
    );
    setFormulas(updated);
  }

  function updateComponent(
    formulaIdx: number,
    compIdx: number,
    field: string,
    value: string
  ) {
    const updated = [...formulas];
    const comp = { ...updated[formulaIdx].components[compIdx], [field]: value };
    updated[formulaIdx].components[compIdx] = comp;
    setFormulas(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
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
      router.push(`/dashboard/clients/${clientId}`);
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formulas.map((formula, fi) => (
        <div
          key={fi}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Formula {formulas.length > 1 ? fi + 1 : ""}
            </h3>
            {formulas.length > 1 && (
              <button
                type="button"
                onClick={() => removeFormula(fi)}
                className="text-red-500 p-1"
              >
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

          {/* Developer + Ratio row */}
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

          {/* Components */}
          {formula.components.map((comp, ci) => (
            <div
              key={ci}
              className="flex gap-2 items-center pl-2 border-l-2 border-accent-light"
            >
              <input
                value={comp.product}
                onChange={(e) =>
                  updateComponent(fi, ci, "product", e.target.value)
                }
                placeholder="Product (e.g., 6-1)"
                className="touch-target flex-1 bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                value={comp.amount}
                onChange={(e) =>
                  updateComponent(fi, ci, "amount", e.target.value)
                }
                placeholder="Amt"
                type="number"
                step="0.01"
                className="touch-target w-20 bg-background border border-border rounded-xl px-3 py-3 text-base text-center focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <select
                value={comp.unit}
                onChange={(e) =>
                  updateComponent(fi, ci, "unit", e.target.value)
                }
                className="touch-target w-16 bg-background border border-border rounded-xl px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="oz">oz</option>
                <option value="g">g</option>
                <option value="tube">tube</option>
              </select>
              {formula.components.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeComponent(fi, ci)}
                  className="text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => addComponent(fi)}
            className="inline-flex items-center gap-1 text-accent text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" /> Add component
          </button>

          {/* Processing time + notes for this formula */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                value={formula.processingMin}
                onChange={(e) =>
                  updateFormula(fi, "processingMin", e.target.value)
                }
                type="number"
                placeholder="Processing min"
                className="touch-target w-full bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <textarea
            value={formula.notes}
            onChange={(e) => updateFormula(fi, "notes", e.target.value)}
            rows={2}
            placeholder="Formula notes (optional)"
            className="w-full bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addFormula}
        className="touch-target w-full border-2 border-dashed border-border rounded-xl py-3 text-muted font-medium hover:border-accent hover:text-accent transition-colors"
      >
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

      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full bg-accent text-white font-semibold rounded-xl px-6 py-4 text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Session"}
      </button>
    </form>
  );
}
