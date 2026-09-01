"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, QrCode, ShieldCheck, Wallet } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { formatBRL } from "@/lib/format";
import { evaluateCoupon } from "@/lib/coupons";
import { calculateShipping, type ShippingOption } from "@/lib/shipping";
import { createOrder } from "@/lib/actions/orders";
import { saveStoredOrder } from "@/lib/orders-store";
import { getProductBySlug } from "@/lib/data/products";
import type { PaymentMethod } from "@/lib/types";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: typeof Wallet }[] = [
  { id: "pix", label: "Pix", icon: QrCode },
  { id: "mercado_pago", label: "Mercado Pago", icon: Wallet },
];

export default function CheckoutPage() {
  const { items, subtotal, couponCode, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0 && !submitting) router.replace("/carrinho");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalWeight = items.reduce((sum, item) => {
    const product = getProductBySlug(item.productSlug);
    return sum + (product?.weightGrams ?? 150) * item.quantity;
  }, 0);

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
      } else {
        setStreet(data.logradouro || "");
        setDistrict(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
      const options = calculateShipping(digits, totalWeight);
      setShippingOptions(options);
      setShippingId(options[0].id);
    } catch {
      setCepError("Não foi possível buscar o CEP agora. Preencha manualmente.");
    } finally {
      setCepLoading(false);
    }
  }

  const coupon = evaluateCoupon(couponCode, subtotal);
  const discount = coupon.valid ? coupon.discount : 0;
  const selectedShipping = shippingOptions.find((o) => o.id === shippingId);
  const total = subtotal - discount + (selectedShipping?.cost ?? 0);

  const canSubmit = useMemo(
    () => name && document && email && phone && cep && street && number && district && city && state && selectedShipping,
    [name, document, email, phone, cep, street, number, district, city, state, selectedShipping]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !selectedShipping) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        items: items.map(({ productSlug, quantity, customization }) => ({ productSlug, quantity, customization })),
        customerName: name,
        customerDocument: document,
        customerEmail: email,
        customerPhone: phone,
        address: { id: "", label: "Entrega", cep, street, number, complement, district, city, state },
        shippingId: selectedShipping.id,
        paymentMethod,
        couponCode: coupon.valid ? (couponCode ?? undefined) : undefined,
      });
      saveStoredOrder(order);
      clear();
      router.push(`/pedido/${order.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível finalizar o pedido.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-ink">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Section title="Cliente">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome completo" value={name} onChange={setName} required />
              <Input label="CPF/CNPJ" value={document} onChange={setDocument} required placeholder="000.000.000-00" />
              <Input label="E-mail" type="email" value={email} onChange={setEmail} required />
              <Input label="WhatsApp / Telefone" value={phone} onChange={setPhone} required placeholder="(11) 99999-9999" />
            </div>
          </Section>

          <Section title="Endereço de entrega">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <Input label="CEP" value={cep} onChange={setCep} onBlur={handleCepBlur} required placeholder="00000-000" />
                {cepLoading && <p className="mt-1 flex items-center gap-1 text-xs text-graphite-400"><Loader2 size={12} className="animate-spin" /> Buscando endereço...</p>}
                {cepError && <p className="mt-1 text-xs text-danger">{cepError}</p>}
              </div>
              <div className="sm:col-span-2">
                <Input label="Rua" value={street} onChange={setStreet} required />
              </div>
              <Input label="Número" value={number} onChange={setNumber} required />
              <Input label="Complemento" value={complement} onChange={setComplement} />
              <Input label="Bairro" value={district} onChange={setDistrict} required />
              <Input label="Cidade" value={city} onChange={setCity} required />
              <Input label="Estado" value={state} onChange={setState} required placeholder="UF" />
            </div>
          </Section>

          <Section title="Entrega">
            {shippingOptions.length === 0 ? (
              <p className="text-sm text-graphite-400">Informe o CEP para ver as opções de frete.</p>
            ) : (
              <div className="space-y-2">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                      shippingId === opt.id ? "border-accent bg-accent-100/50" : "border-graphite-200"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input type="radio" name="shipping" checked={shippingId === opt.id} onChange={() => setShippingId(opt.id)} className="accent-accent" />
                      <span>
                        <span className="block font-medium text-ink">{opt.carrier} · {opt.service}</span>
                        <span className="text-xs text-graphite-400">até {opt.deadlineDays} dias úteis após produção</span>
                      </span>
                    </span>
                    <span className="font-display font-semibold text-ink">{formatBRL(opt.cost)}</span>
                  </label>
                ))}
              </div>
            )}
          </Section>

          <Section title="Pagamento">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-xs font-medium transition ${
                    paymentMethod === opt.id ? "border-accent bg-accent-100/50 text-accent" : "border-graphite-200 text-graphite-600"
                  }`}
                >
                  <opt.icon size={18} />
                  {opt.label}
                </button>
              ))}
            </div>

            {paymentMethod === "pix" && (
              <p className="mt-3 rounded-xl bg-graphite-100/70 p-3 text-xs text-graphite-500">
                O pedido será criado como aguardando pagamento. Não pague códigos enviados fora deste site.
              </p>
            )}
            {paymentMethod === "mercado_pago" && (
              <p className="mt-3 rounded-xl bg-graphite-100/70 p-3 text-xs text-graphite-500">
                A confirmação só será aceita após validação direta da assinatura, referência e valor no Mercado Pago.
              </p>
            )}
          </Section>
        </div>

        <div className="h-fit space-y-4 rounded-2xl border border-graphite-100 bg-graphite-100/40 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Resumo do pedido</h2>
          <div className="max-h-52 space-y-2 overflow-y-auto border-b border-graphite-200 pb-4 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between gap-2 text-graphite-500">
                <span className="line-clamp-1">{i.quantity}x {i.name}</span>
                <span className="shrink-0">{formatBRL(i.unitPrice * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-graphite-500"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
            <div className="flex justify-between text-graphite-500"><span>Desconto</span><span>- {formatBRL(discount)}</span></div>
            <div className="flex justify-between text-graphite-500"><span>Frete</span><span>{selectedShipping ? formatBRL(selectedShipping.cost) : "—"}</span></div>
            <div className="flex justify-between border-t border-graphite-200 pt-2 font-display text-base font-bold text-ink"><span>Total</span><span>{formatBRL(Math.max(0, total))}</span></div>
          </div>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {submitting ? "Processando..." : "Finalizar compra"}
          </button>
          {submitError && <p role="alert" className="text-center text-xs font-medium text-danger">{submitError}</p>}
          <p className="text-center text-xs text-graphite-400">
            Ao continuar você concorda com nossos{" "}
            <Link href="/termos-de-uso" className="underline">termos de uso</Link>.
          </p>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  onBlur?: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}
