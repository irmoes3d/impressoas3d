"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, MessageCircle, Plus, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";
import { formatBRL, formatInstallments } from "@/lib/format";
import { computeSubtotal, computeUnitPrice, selectionToCustomization } from "@/lib/pricing";
import { buildWhatsappLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";

export function PurchasePanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();

  const [colorId, setColorId] = useState(product.variants.colors?.[0]?.id);
  const [sizeId, setSizeId] = useState(product.variants.sizes?.[0]?.id);
  const [customName, setCustomName] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selection = useMemo(
    () => ({ colorId, sizeId, customName, fields, quantity }),
    [colorId, sizeId, customName, fields, quantity]
  );

  const unitPrice = computeUnitPrice(product, selection);
  const subtotal = computeSubtotal(product, selection);

  const missingRequired = product.customFields.some((f) => f.required && !fields[f.id]?.trim());

  function buildCartItem() {
    return {
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      imageSeed: product.images[0]?.seed ?? product.slug,
      unitPrice,
      quantity,
      customization: selectionToCustomization(product, selection),
    };
  }

  function handleAddToCart() {
    addItem(buildCartItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(buildCartItem());
    router.push("/checkout");
  }

  return (
    <div className="space-y-6">
      <div>
        {product.compareAtPrice && (
          <span className="mr-2 text-sm text-graphite-400 line-through">{formatBRL(product.compareAtPrice)}</span>
        )}
        <span className="font-display text-3xl font-bold text-ink">{formatBRL(unitPrice)}</span>
        <p className="mt-1 text-sm text-graphite-400">{formatInstallments(unitPrice, product.installments)}</p>
      </div>

      {product.variants.colors && product.variants.colors.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-graphite-400">
            Cor {colorId && `· ${product.variants.colors.find((c) => c.id === colorId)?.name}`}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setColorId(c.id)}
                title={c.name}
                className={`h-9 w-9 rounded-full border-2 transition ${colorId === c.id ? "border-accent scale-110" : "border-graphite-200"}`}
                style={{ background: c.hex }}
              />
            ))}
            {product.variants.allowCustomColor && (
              <button
                onClick={() => setColorId(undefined)}
                className={`rounded-full border px-3 text-xs font-medium ${!colorId ? "border-accent text-accent" : "border-graphite-200 text-graphite-500"}`}
              >
                Personalizado
              </button>
            )}
          </div>
        </div>
      )}

      {product.variants.sizes && product.variants.sizes.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Tamanho</span>
          <div className="flex flex-wrap gap-2">
            {product.variants.sizes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSizeId(s.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  sizeId === s.id ? "border-accent bg-accent-100 text-accent" : "border-graphite-200 text-graphite-600 hover:border-graphite-400"
                }`}
              >
                {s.name} {s.priceDelta > 0 && `(+${formatBRL(s.priceDelta)})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.allowCustomName && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-graphite-400">
            Digite o nome que deseja colocar
          </label>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ex: Maria"
            className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
      )}

      {product.customFields.map((field) => (
        <div key={field.id}>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-graphite-400">
            {field.label} {field.required && <span className="text-danger">*</span>}
          </label>
          {field.type === "observacoes" ? (
            <textarea
              rows={3}
              placeholder={field.placeholder}
              value={fields[field.id] ?? ""}
              onChange={(e) => setFields((f) => ({ ...f, [field.id]: e.target.value }))}
              className="w-full resize-none rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          ) : field.type === "cor" && field.options ? (
            <select
              value={fields[field.id] ?? ""}
              onChange={(e) => setFields((f) => ({ ...f, [field.id]: e.target.value }))}
              className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
            >
              <option value="">Selecione</option>
              {field.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : field.type === "upload" ? (
            <input
              type="file"
              onChange={(e) => setFields((f) => ({ ...f, [field.id]: e.target.files?.[0]?.name ?? "" }))}
              className="w-full rounded-xl border border-dashed border-graphite-300 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-graphite-100 file:px-3 file:py-1 file:text-xs"
            />
          ) : (
            <input
              type={field.type === "numero" ? "number" : field.type === "data" ? "date" : "text"}
              placeholder={field.placeholder}
              value={fields[field.id] ?? ""}
              onChange={(e) => setFields((f) => ({ ...f, [field.id]: e.target.value }))}
              className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          )}
        </div>
      ))}

      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Quantidade</span>
        <div className="inline-flex items-center rounded-full border border-graphite-200">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center text-graphite-600 hover:text-accent" aria-label="Diminuir quantidade">
            <Minus size={15} />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="flex h-10 w-10 items-center justify-center text-graphite-600 hover:text-accent" aria-label="Aumentar quantidade">
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-graphite-100/70 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-graphite-500">Subtotal</span>
          <span className="font-display text-lg font-bold text-ink">{formatBRL(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-graphite-400">
          Prazo de produção estimado: {product.productionDays} dias úteis
        </p>
      </div>

      <div className="space-y-2.5">
        <button
          onClick={handleBuyNow}
          disabled={missingRequired}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Zap size={16} /> Comprar agora
        </button>
        <button
          onClick={handleAddToCart}
          disabled={missingRequired}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-ink py-3.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={16} /> {added ? "Adicionado!" : "Adicionar ao carrinho"}
        </button>
        <a
          href={buildWhatsappLink(WHATSAPP_MESSAGES.product(product.name))}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366]/40 py-3.5 text-sm font-semibold text-[#128C4A] transition hover:bg-[#25D366]/10"
        >
          <MessageCircle size={16} /> Pedir pelo WhatsApp
        </a>
        {missingRequired && (
          <p className="text-center text-xs text-danger">Preencha os campos obrigatórios para continuar.</p>
        )}
      </div>
    </div>
  );
}
