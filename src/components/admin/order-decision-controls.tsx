"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleX, MoveRight } from "lucide-react";
import {
  acceptPendingOrderAction,
  advanceOrderStatusAction,
  cancelOrderAction,
  rejectPendingOrderAction,
} from "@/src/app/(dashboard)/admin/orders/actions";
import { DeliveryType } from "@/src/types/checkout";
import { OrderStatus } from "@/src/types/order";

type FeedbackState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

type OrderDecisionControlsProps = {
  orderId: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
};

export function OrderDecisionControls({
  orderId,
  status,
  deliveryType,
}: OrderDecisionControlsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const processSteps = getCompactProcessSteps(deliveryType);
  const currentStepIndex =
    status === "canceled"
      ? -1
      : processSteps.findIndex((step) => step.status === status);

  async function handleDecision(
    action: () => ReturnType<typeof acceptPendingOrderAction>,
  ) {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await action();

      if (!result.ok) {
        setFeedback({
          tone: "error",
          message: result.message,
        });
        return;
      }

      let usedWhatsapp = false;
      let copiedMessage = false;
      let blockedWhatsapp = false;

      if (result.notification.whatsappUrl && typeof window !== "undefined") {
        const whatsappWindow = window.open(
          result.notification.whatsappUrl,
          "_blank",
          "noopener,noreferrer",
        );

        usedWhatsapp = whatsappWindow !== null;
        blockedWhatsapp = whatsappWindow === null;
      }

      if (!usedWhatsapp && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(result.notification.message);
          copiedMessage = true;
        } catch {}
      }

      router.refresh();
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
      setFeedback({
        tone: "error",
        message:
          "Nao foi possivel registrar a decisao agora. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const primaryAction = getPrimaryAction({
    status,
    deliveryType,
    acceptAction: () => acceptPendingOrderAction(orderId),
    advanceAction: () => advanceOrderStatusAction(orderId),
  });

  const secondaryAction = getSecondaryAction({
    status,
    rejectAction: () => rejectPendingOrderAction(orderId),
    cancelAction: () => cancelOrderAction(orderId),
  });
  const hasBothActions = Boolean(primaryAction && secondaryAction);

  return (
    <div className="rounded-[16px] border border-zinc-200 bg-zinc-50/80 p-2.5">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Processo
      </p>

      <div className="mt-2 flex items-center gap-1.5">
        {processSteps.map((step, index) => {
          const active = currentStepIndex === index;
          const done = currentStepIndex > index;

          return (
            <span
              key={step.status}
              className={`h-1.5 flex-1 rounded-full ${
                active
                  ? "bg-sky-500"
                  : done
                    ? "bg-emerald-500"
                    : "bg-zinc-300"
              }`}
              title={step.label}
            />
          );
        })}
      </div>

      <p className="mt-2 px-1 text-[11px] text-zinc-600">
        {status === "canceled"
          ? "Pedido nao aceito/cancelado"
          : currentStepIndex >= 0
            ? processSteps[currentStepIndex]?.label
            : "Fluxo do pedido"}
      </p>

      {primaryAction || secondaryAction ? (
        <div
          className={`mt-2 grid gap-2 ${
            hasBothActions ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {primaryAction ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                void handleDecision(primaryAction.action);
              }}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(5,150,105,0.25)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-100 disabled:shadow-none"
            >
              {status === "pending" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <MoveRight className="h-3.5 w-3.5" />
              )}
              {primaryAction.label}
            </button>
          ) : null}

          {secondaryAction ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                void handleDecision(secondaryAction.action);
              }}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              <CircleX className="h-3.5 w-3.5" />
              {secondaryAction.label}
            </button>
          ) : null}
        </div>
      ) : null}

      {feedback ? (
        <div
          className={`mt-2 rounded-[12px] border px-2.5 py-2 text-xs ${
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}
    </div>
  );
}

function getCompactProcessSteps(deliveryType: DeliveryType) {
  return [
    {
      status: "pending" as const,
      label: "Aguardando decisao",
    },
    {
      status: "confirmed" as const,
      label: "Confirmado",
    },
    {
      status: "preparing" as const,
      label: "Em preparo",
    },
    {
      status: "ready" as const,
      label: deliveryType === "delivery" ? "Em rota" : "Pronto para retirada",
    },
    {
      status: "completed" as const,
      label: deliveryType === "delivery" ? "Entregue" : "Retirado",
    },
  ];
}

function getPrimaryAction(params: {
  status: OrderStatus;
  deliveryType: DeliveryType;
  acceptAction: () => ReturnType<typeof acceptPendingOrderAction>;
  advanceAction: () => ReturnType<typeof advanceOrderStatusAction>;
}) {
  switch (params.status) {
    case "pending":
      return {
        label: "Aceitar pedido",
        action: params.acceptAction,
      };
    case "confirmed":
      return {
        label: "Iniciar preparo",
        action: params.advanceAction,
      };
    case "preparing":
      return {
        label: "Marcar como pronto",
        action: params.advanceAction,
      };
    case "ready":
      return {
        label:
          params.deliveryType === "delivery"
            ? "Confirmar entrega"
            : "Confirmar retirada",
        action: params.advanceAction,
      };
    case "completed":
    case "canceled":
    default:
      return null;
  }
}

function getSecondaryAction(params: {
  status: OrderStatus;
  rejectAction: () => ReturnType<typeof rejectPendingOrderAction>;
  cancelAction: () => ReturnType<typeof cancelOrderAction>;
}) {
  if (params.status === "pending") {
    return {
      label: "Nao aceitar",
      action: params.rejectAction,
    };
  }

  if (
    params.status === "confirmed" ||
    params.status === "preparing" ||
    params.status === "ready"
  ) {
    return {
      label: "Cancelar",
      action: params.cancelAction,
    };
  }

  return null;
}
