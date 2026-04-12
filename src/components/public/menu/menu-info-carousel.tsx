"use client";

import { useEffect, useRef, useState } from "react";
import { formatBRL } from "@/src/lib/format";

type MenuInfoCarouselProps = {
  deliveryFee: number;
  restaurantName: string;
  deliveryTime?: string;
};

export function MenuInfoCarousel({
  deliveryFee,
  restaurantName,
  deliveryTime,
}: MenuInfoCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = [
    {
      id: "delivery",
      buttonLabel: "entrega e pagamento",
      content: (
        <MenuQuickInfoCard
          deliveryFee={deliveryFee}
          deliveryTime={deliveryTime}
        />
      ),
    },
    {
      id: "tip",
      buttonLabel: "dica de pedido",
      content: <MenuTipCard restaurantName={restaurantName} />,
    },
  ];

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
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(element) => {
              slideRefs.current[index] = element;
            }}
            className="w-full shrink-0 snap-start"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${slides.length}`}
          >
            {slide.content}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pb-1">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ver ${slide.buttonLabel}`}
            aria-current={activeIndex === index ? "true" : undefined}
            onClick={() => scrollToIndex(index)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${activeIndex === index ? "bg-[var(--brand-primary)]" : "bg-[var(--brand-border)]"
              }`}
          />
        ))}
      </div>
    </section>
  );
}

function MenuQuickInfoCard({
  deliveryFee,
  deliveryTime,
}: {
  deliveryFee: number;
  deliveryTime?: string;
}) {
  const deliveryFeeToCombine = /combinar/i.test(deliveryTime ?? "");
  const deliveryFeeCopy = deliveryFeeToCombine
    ? "Taxa a combinar"
    : deliveryFee > 0
      ? `Taxa ${formatBRL(deliveryFee)}`
      : "Taxa grátis";

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#0d58a8] bg-[linear-gradient(135deg,#0f1115_0%,#13365b_48%,#0073e6_100%)] p-5 text-white shadow-[0_16px_34px_rgba(0,115,230,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">Entrega e pagamento</div>
          <div className="mt-1 text-sm leading-6 text-zinc-200">
            {deliveryFeeCopy} com pagamento via Pix, cartão ou dinheiro.
            Checkout rápido direto pelo celular
            {deliveryTime ? ` em média ${deliveryTime}.` : "."}
          </div>
        </div>

        <div className="font-ui-mono shrink-0 rounded-full border border-white/16 bg-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.02em] text-white">
          Entrega
        </div>
      </div>
    </div>
  );
}

function MenuTipCard({ restaurantName }: { restaurantName: string }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--brand-border)] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_56%,#fffaf0_100%)] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-[var(--brand-ink)]">
            Faça seu pedido de forma rápida e prática
          </div>
          <div className="mt-1 text-sm leading-6 text-zinc-600">
            Use a busca, navegue pelas categorias e escolha seus combos ou
            bebidas para finalizar tudo pelo celular em {restaurantName}.
          </div>
        </div>

        <div className="font-ui-mono shrink-0 rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] px-3 py-1 text-[11px] uppercase tracking-[0.02em] text-[var(--brand-primary)]">
          Dica
        </div>
      </div>
    </div>
  );
}
