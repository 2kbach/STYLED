"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";

interface FormulaInput {
  name: string;
  components: {
    product: string;
    grams: string;
    developer: string;
    ratio: string;
  }[];
}

const emptyComponent = () => ({
  product: "",
  grams: "",
  developer: "",
  ratio: "",
});

const emptyFormula = (): FormulaInput => ({
  name: "",
  components: [emptyComponent()],
});

export function NewSessionForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formulas, setFormulas] = useState<FormulaInput[]>([emptyFormula()]);
  const [notes, setNotes] = useState("");
  const [processingMin, setProcessingMin] = useState("");

  function addFormula() {
    setFormulas([...formulas, emptyFormula()]);
  }

  function removeFormula(idx: number) {
    setFormulas(formulas.filter((_, i) => i !== idx));
  }

  function updateFormula(idx: number, field: keyof FormulaInput, value: string) {
    const updated = [...formulas];
    if (field === "name") {
      updated[idx].name = value;
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
    const comp = updated[formulaIdx].components[compIdx];
    (comp as Record<string, string>)[field] = value;
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
        notes: notes || null,
        processingMin: processingMin ? parseInt(processingMin) : null,
        formulas: formulas
          .filter((f) => f.name.trim())
          .map((f) => ({
            name: f.name.trim(),
            components: f.components
              .filter((c) => c.product.trim())
              .map((c) => ({
                product: c.product.trim(),
                grams: parseFloat(c.grams) || 0,
                developer: c.developer || null,
                ratio: c.ratio || null,
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
            placeholder="Formula name (e.g., Root, Gloss, Toner)"
            className="touch-target w-full bg-background border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {formula.components.map((comp, ci) => (
            <div key={ci} className="space-y-2 pl-2 border-l-2 border-accent-light">
              <div className="flex gap-2">
                <input
                  value={comp.product}
                  onChange={(e) =>
                    updateComponent(fi, ci, "product", e.target.value)
                  }
                  placeholder="Product"
                  className="touch-target flex-1 bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  value={comp.grams}
                  onChange={(e) =>
                    updateComponent(fi, ci, "grams", e.target.value)
                  }
                  placeholder="g"
                  type="number"
                  step="0.1"
                  className="touch-target w-20 bg-background border border-border rounded-xl px-3 py-3 text-base text-center focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {formula.components.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeComponent(fi, ci)}
                    className="text-red-500 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={comp.developer}
                  onChange={(e) =>
                    updateComponent(fi, ci, "developer", e.target.value)
                  }
                  className="touch-target flex-1 bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Developer (optional)</option>
                  <option value="10V">10 Volume (3%)</option>
                  <option value="20V">20 Volume (6%)</option>
                  <option value="30V">30 Volume (9%)</option>
                  <option value="40V">40 Volume (12%)</option>
                </select>
                <select
                  value={comp.ratio}
                  onChange={(e) =>
                    updateComponent(fi, ci, "ratio", e.target.value)
                  }
                  className="touch-target w-24 bg-background border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Ratio</option>
                  <option value="1:1">1:1</option>
                  <option value="1:1.5">1:1.5</option>
                  <option value="1:2">1:2</option>
                </select>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addComponent(fi)}
            className="inline-flex items-center gap-1 text-accent text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" /> Add component
          </button>
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
        <label className="block text-sm font-medium mb-1">
          Processing Time (minutes)
        </label>
        <input
          value={processingMin}
          onChange={(e) => setProcessingMin(e.target.value)}
          type="number"
          placeholder="Optional"
          className="touch-target w-full bg-card border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Session Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notes about this session"
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
