import Link from "next/link";
import { Camera, Mail, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const PAYMENT_METHODS = ["Pix", "Visa", "Mastercard", "Elo", "Boleto"];

export function Footer() {
  return (
    <footer className="border-t border-graphite-100 bg-graphite-900 text-white">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <Logo href={null} size={76} />
          <p className="mt-4 max-w-xs text-sm text-white/60">Sua ideia ganha forma.</p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-accent"
            >
              <Camera size={17} />
            </a>
            <a
              href="mailto:contato@2irmaosimpressoes3d.com.br"
              aria-label="E-mail"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-accent"
            >
              <Mail size={17} />
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-accent"
            >
              <MessageCircle size={17} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Loja</h3>
          <ul className="space-y-2.5 text-sm text-white/75">
            <li><Link href="/produtos" className="hover:text-white">Produtos</Link></li>
            <li><Link href="/personalizados" className="hover:text-white">Personalizados</Link></li>
            <li><Link href="/sobre" className="hover:text-white">Sobre nós</Link></li>
            <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
            <li><Link href="/conta" className="hover:text-white">Minha conta</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Informações</h3>
          <ul className="space-y-2.5 text-sm text-white/75">
            <li><Link href="/politica-de-privacidade" className="hover:text-white">Política de privacidade</Link></li>
            <li><Link href="/termos-de-uso" className="hover:text-white">Termos de uso</Link></li>
            <li><Link href="/trocas-e-devolucoes" className="hover:text-white">Trocas e devoluções</Link></li>
            <li><Link href="/politica-de-envio" className="hover:text-white">Política de envio</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Atendimento</h3>
          <ul className="space-y-2.5 text-sm text-white/75">
            <li>WhatsApp: (11) 99999-9999</li>
            <li>contato@2irmaosimpressoes3d.com.br</li>
            <li>Seg a sex, 9h às 18h</li>
          </ul>
          <div className="mt-5">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">Formas de pagamento</span>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <span key={m} className="rounded-md bg-white/10 px-2.5 py-1 text-xs">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} 2 Irmãos Impressões 3D. Todos os direitos reservados.
      </div>
    </footer>
  );
}
