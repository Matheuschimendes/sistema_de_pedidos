"use client";

import { useEffect, useRef, useState } from "react";
import { formatBRL } from "@/src/lib/format";

type MenuInfoCarouselProps = {
  deliveryFee: number;
  restaurantName: string;
};

export function MenuInfoCarousel({
  deliveryFee,
  restaurantName,
}: MenuInfoCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number | null = null;

    const updateActiveSlide = () => {
      const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      if (slides.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        const slideCenterX = slideRect.left + slideRect.width / 2;
        const distance = Math.abs(slideCenterX - containerCenterX);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex((current) =>
        current === closestIndex ? current : closestIndex,
      );
    };

    const onScroll = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(updateActiveSlide);
    };

    updateActiveSlide();
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      container.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToIndex = (index: number) => {
    slideRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  return (
    <section className="pt-3" aria-label="Informações do cardápio">
      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scroll-smooth"
      >
        <div
          ref={(element) => {
            slideRefs.current[0] = element;
          }}
          className="w-full shrink-0 snap-start"
          role="group"
          aria-roledescription="slide"
          aria-label="1 de 2"
        >
          <MenuQuickInfoCard deliveryFee={deliveryFee} />
        </div>

        <div
          ref={(element) => {
            slideRefs.current[1] = element;
          }}
          className="w-full shrink-0 snap-start"
          role="group"
          aria-roledescription="slide"
          aria-label="2 de 2"
        >
          <MenuTipCard restaurantName={restaurantName} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-1">
        <button
          type="button"
          aria-label="Ver entrega e pagamento"
          aria-current={activeIndex === 0 ? "true" : undefined}
          onClick={() => scrollToIndex(0)}
          className={`h-1.5 w-1.5 rounded-full transition-colors ${activeIndex === 0 ? "bg-[var(--brand-primary)]" : "bg-zinc-300"
            }`}
        />
        <button
          type="button"
          aria-label="Ver dica de pedido"
          aria-current={activeIndex === 1 ? "true" : undefined}
          onClick={() => scrollToIndex(1)}
          className={`h-1.5 w-1.5 rounded-full transition-colors ${activeIndex === 1 ? "bg-[var(--brand-primary)]" : "bg-zinc-300"
            }`}
        />
      </div>
    </section>
  );
}

function MenuQuickInfoCard({ deliveryFee }: { deliveryFee: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-r from-[var(--brand-ink)] via-[var(--brand-ink)] to-[var(--brand-primary)] p-4 text-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Entrega e pagamento</div>
          <div className="mt-1 text-xs leading-5 text-zinc-200">
            Taxa {formatBRL(deliveryFee)} · Pix, cartão ou dinheiro · Checkout
            rápido
          </div>
        </div>

        <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white">
          Info
        </div>
      </div>
    </div>
  );
}

function MenuTipCard({ restaurantName }: { restaurantName: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-[var(--brand-primary-soft)] via-white to-[var(--brand-accent-soft)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">
            Faça seu pedido de forma rápida e prática
          </div>
          <div className="mt-1 text-xs leading-5 text-zinc-600">
            Use a busca para encontrar seus itens e finalize tudo pelo celular em{" "}
            {restaurantName}.
          </div>
        </div>

        <div className="shrink-0 rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] px-3 py-1 text-[10px] font-semibold text-[var(--brand-ink)]">
          Dica
        </div>
      </div>
    </div>
  );
}
