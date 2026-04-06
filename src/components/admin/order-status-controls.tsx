"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleX, MoveRight } from "lucide-react";
import {
  advanceOrderStatusAction,
  cancelOrderAction,
  updateOrderStatusAction,
} from "@/src/app/(dashboard)/admin/orders/actions";
import { orderStatusOptions } from "@/src/lib/order-presentation";
import { OrderStatus } from "@/src/types/order";

type FeedbackState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

type OrderStatusControlsProps = {
  orderId: string;
  status: OrderStatus;
  canAdvance: boolean;
  canCancel: boolean;
  nextStatusLabel?: string;
  onActionSuccess?: () => Promise<void> | void;
};

export function OrderStatusControls({
  orderId,
  status,
  canAdvance,
  canCancel,
  nextStatusLabel,
  onActionSuccess,
}: OrderStatusControlsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  async function handleAction(
    action: () => ReturnType<typeof advanceOrderStatusAction>,
  ) {
    const notificationWindow: Window | null =
      typeof window !== "undefined"
        ? window.open("", "_blank", "noopener,noreferrer")
        : null;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await action();

      if (!result.ok) {
        notificationWindow?.close();
        setFeedback({
          tone: "error",
          message: result.message,
        });
        return;
      }

      let usedWhatsapp = false;
      let copiedMessage = false;
      let blockedWhatsapp = false;

      if (result.notification.whatsappUrl) {
        if (notificationWindow) {
          notificationWindow.location.href = result.notification.whatsappUrl;
          usedWhatsapp = true;
        } else if (typeof window !== "undefined") {
          const fallbackWindow = window.open(
            result.notification.whatsappUrl,
            "_blank",
            "noopener,noreferrer",
          );

          usedWhatsapp = fallbackWindow !== null;
          blockedWhatsapp = fallbackWindow === null;
        }
      } else {
        notificationWindow?.close();
      }

      if (!usedWhatsapp && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(result.notification.message);
          copiedMessage = true;
        } catch {}
      }

      if (onActionSuccess) {
        await onActionSuccess();
      } else {
        router.refresh();
      }
      setFeedback({
        tone: "success",
        message: usedWhatsapp
          ? `${result.message} O WhatsApp foi aberto com a mensagem pronta.`
          : copiedMessage
            ? blockedWhatsapp
              ? `${result.message} O navegador bloqueou a abertura do WhatsApp, entao a mensagem foi copiada para envio manual.`
              : `${result.message} A mensagem foi copiada para envio manual.`
            : result.message,
      });
    } catch {
      notificationWindow?.close();
      setFeedback({
        tone: "error",
        message:
          "Nao foi possivel atualizar o pedido agora. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[22px] border border-zinc-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Acoes rapidas
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            disabled={isSubmitting || !canAdvance}
            onClick={() => {
              void handleAction(() => advanceOrderStatusAction(orderId));
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            <MoveRight className="h-4 w-4" />
            {nextStatusLabel ? `Prosseguir para ${nextStatusLabel}` : "Fluxo finalizado"}
          </button>

          <button
            type="button"
            disabled={isSubmitting || !canCancel}
            onClick={() => {
              void handleAction(() => cancelOrderAction(orderId));
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
          >
            <CircleX className="h-4 w-4" />
            Cancelar pedido
          </button>
        </div>
      </section>

      <section className="rounded-[22px] border border-zinc-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Atualizar status
        </p>

        <div className="mt-4 space-y-3">
          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.currentTarget.value as OrderStatus)
            }
            disabled={isSubmitting}
            className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm text-zinc-950 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
          >
            {orderStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              void handleAction(() =>
                updateOrderStatusAction(orderId, selectedStatus),
              );
            }}
            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
          >
            Salvar status e avisar cliente
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Ao confirmar a alteracao, o sistema usa o WhatsApp informado pelo
          cliente no checkout para abrir a mensagem pronta. Para o envio sair do
          numero oficial da loja, deixe o WhatsApp Web da empresa logado neste
          navegador. Se nao conseguir abrir, a mensagem fica pronta para envio
          manual.
        </p>

        {feedback ? (
          <div
            className={`mt-4 rounded-[18px] border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}
      </section>
    </div>
  );
}
