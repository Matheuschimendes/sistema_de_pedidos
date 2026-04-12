"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleX, MoveRight } from "lucide-react";
import {
  acceptPendingOrderAction,
  advanceOrderStatusAction,
  cancelOrderAction,
  rejectPendingOrderAction,
  updateOrderStatusAction,
} from "@/src/app/(dashboard)/admin/orders/actions";
import { orderStatusOptions } from "@/src/lib/order-presentation";
import { DeliveryType } from "@/src/types/checkout";
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
  deliveryType: DeliveryType;
  canAdvance: boolean;
  canCancel: boolean;
  nextStatusLabel?: string;
  onActionSuccess?: () => Promise<void> | void;
};

export function OrderStatusControls({
  orderId,
  status,
  deliveryType,
  canAdvance,
  canCancel,
  nextStatusLabel,
  onActionSuccess,
}: OrderStatusControlsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const processSteps = getProcessSteps(deliveryType);
  const currentStepIndex =
    status === "canceled"
      ? -1
      : processSteps.findIndex((step) => step.status === status);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  async function handleAction(
    action: () => ReturnType<typeof advanceOrderStatusAction>,
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
      setFeedback({
        tone: "error",
        message:
          "Nao foi possivel atualizar o pedido agora. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const primaryAction = getPrimaryAction({
    status,
    deliveryType,
    nextStatusLabel,
    action: () => advanceOrderStatusAction(orderId),
    acceptAction: () => acceptPendingOrderAction(orderId),
  });
  const secondaryAction = getSecondaryAction({
    status,
    cancelAction: () => cancelOrderAction(orderId),
    rejectAction: () => rejectPendingOrderAction(orderId),
  });
  const hasBothQuickActions = Boolean(primaryAction && secondaryAction);

  return (
    <div className="space-y-4">
      <section className="rounded-[22px] border border-zinc-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Processo ate a entrega
        </p>

        <div className="mt-3 space-y-2">
          {processSteps.map((step, index) => {
            const isDone = currentStepIndex > index;
            const isCurrent = currentStepIndex === index;

            return (
              <div
                key={step.status}
                className={`rounded-[14px] border px-3 py-2.5 ${
                  isCurrent
                    ? "border-sky-200 bg-sky-50"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                      isCurrent
                        ? "text-sky-700"
                        : isDone
                          ? "text-emerald-700"
                          : "text-zinc-500"
                    }`}
                  >
                    {step.tag}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      isCurrent
                        ? "text-sky-700"
                        : isDone
                          ? "text-emerald-700"
                          : "text-zinc-500"
                    }`}
                  >
                    {isCurrent ? "Atual" : isDone ? "Concluida" : "Pendente"}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    isCurrent || isDone ? "text-zinc-900" : "text-zinc-600"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {status === "canceled" ? (
          <div className="mt-3 rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            Fluxo encerrado como nao aceito/cancelado.
          </div>
        ) : null}

        <div
          className={`mt-4 grid gap-3 ${
            hasBothQuickActions ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {primaryAction ? (
            <button
              type="button"
              disabled={isSubmitting || !canAdvance}
              onClick={() => {
                void handleAction(primaryAction.action);
              }}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(5,150,105,0.22)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {status === "pending" ? (
                <Check className="h-4 w-4" />
              ) : (
                <MoveRight className="h-4 w-4" />
              )}
              {primaryAction.label}
            </button>
          ) : (
            <div className="rounded-[14px] border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600">
              Sem avancos disponiveis para este status.
            </div>
          )}

          {secondaryAction ? (
            <button
              type="button"
              disabled={isSubmitting || !canCancel}
              onClick={() => {
                void handleAction(secondaryAction.action);
              }}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              <CircleX className="h-4 w-4" />
              {secondaryAction.label}
            </button>
          ) : null}
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
          cliente no checkout para abrir a mensagem pronta. O numero da loja
          configurado no Dashboard aparece como contato oficial na mensagem. Para
          o envio sair do numero oficial da loja, deixe o WhatsApp Web da empresa
          logado neste navegador. Se nao conseguir abrir, a mensagem fica pronta
          para envio manual.
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

function getProcessSteps(deliveryType: DeliveryType) {
  return [
    {
      status: "pending" as const,
      tag: "Etapa 1",
      label: "Pedido recebido e aguardando decisao.",
    },
    {
      status: "confirmed" as const,
      tag: "Etapa 2",
      label: "Pedido aceito e confirmado para atendimento.",
    },
    {
      status: "preparing" as const,
      tag: "Etapa 3",
      label: "Pedido em preparo na cozinha/operacao.",
    },
    {
      status: "ready" as const,
      tag: "Etapa 4",
      label:
        deliveryType === "delivery"
          ? "Pedido em rota para entrega."
          : "Pedido pronto para retirada.",
    },
    {
      status: "completed" as const,
      tag: "Etapa 5",
      label:
        deliveryType === "delivery"
          ? "Entrega concluida com sucesso."
          : "Retirada concluida com sucesso.",
    },
  ];
}

function getPrimaryAction(params: {
  status: OrderStatus;
  deliveryType: DeliveryType;
  nextStatusLabel?: string;
  action: () => ReturnType<typeof advanceOrderStatusAction>;
  acceptAction: () => ReturnType<typeof acceptPendingOrderAction>;
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
        action: params.action,
      };
    case "preparing":
      return {
        label: "Marcar como pronto",
        action: params.action,
      };
    case "ready":
      return {
        label:
          params.deliveryType === "delivery"
            ? "Confirmar entrega"
            : "Confirmar retirada",
        action: params.action,
      };
    case "completed":
    case "canceled":
    default:
      return params.nextStatusLabel
        ? {
            label: `Prosseguir para ${params.nextStatusLabel}`,
            action: params.action,
          }
        : null;
  }
}

function getSecondaryAction(params: {
  status: OrderStatus;
  cancelAction: () => ReturnType<typeof cancelOrderAction>;
  rejectAction: () => ReturnType<typeof rejectPendingOrderAction>;
}) {
  if (params.status === "pending") {
    return {
      label: "Nao aceitar pedido",
      action: params.rejectAction,
    };
  }

  if (
    params.status === "confirmed" ||
    params.status === "preparing" ||
    params.status === "ready"
  ) {
    return {
      label: "Cancelar pedido",
      action: params.cancelAction,
    };
  }

  return null;
}
