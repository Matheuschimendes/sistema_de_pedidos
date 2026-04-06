import { DeliveryType, PaymentMethod } from "@/src/types/checkout";
import { OrderStatus } from "@/src/types/order";

export const orderStatusFlow: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

export const orderStatusOptions: Array<{
  value: OrderStatus;
  label: string;
}> = [
  { value: "pending", label: "Aguardando confirmacao" },
  { value: "confirmed", label: "Confirmado" },
  { value: "preparing", label: "Em preparo" },
  { value: "ready", label: "Pronto / em rota" },
  { value: "completed", label: "Concluido" },
  { value: "canceled", label: "Cancelado" },
];

export function formatOrderNumber(orderId: string) {
  return `#${orderId.slice(-6).toUpperCase()}`;
}

export function normalizePhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^0+/, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("55") && digits.length >= 12) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

export function formatWhatsappDisplayNumber(value: string) {
  const digits = normalizePhoneNumber(value);

  if (digits.length === 13 && digits.startsWith("55")) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(
      4,
      9,
    )}-${digits.slice(9)}`;
  }

  if (digits.length === 12 && digits.startsWith("55")) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(
      4,
      8,
    )}-${digits.slice(8)}`;
  }

  return digits;
}

export function getNextOrderStatus(status: OrderStatus) {
  const currentIndex = orderStatusFlow.indexOf(status);

  if (currentIndex === -1 || currentIndex === orderStatusFlow.length - 1) {
    return null;
  }

  return orderStatusFlow[currentIndex + 1];
}

export function isOrderLocked(status: OrderStatus) {
  return status === "completed" || status === "canceled";
}

export function getDeliveryTypeLabel(deliveryType: DeliveryType) {
  return deliveryType === "delivery" ? "Delivery" : "Retirada";
}

export function getPaymentMethodLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case "credit":
      return "Cartao de credito";
    case "debit":
      return "Cartao de debito";
    case "cash":
      return "Dinheiro";
    case "pix":
    default:
      return "Pix";
  }
}

export function getOrderStatusMeta(
  status: OrderStatus,
  deliveryType: DeliveryType,
) {
  switch (status) {
    case "pending":
      return {
        label: "Aguardando confirmacao",
        detail: "Pedido novo esperando a equipe aceitar.",
        tone: "amber" as const,
      };
    case "confirmed":
      return {
        label: "Confirmado",
        detail: "Pedido aceito e pronto para seguir.",
        tone: "blue" as const,
      };
    case "preparing":
      return {
        label: "Em preparo",
        detail: "Equipe separando e preparando os itens.",
        tone: "violet" as const,
      };
    case "ready":
      return {
        label:
          deliveryType === "delivery"
            ? "Saiu para entrega"
            : "Pronto para retirada",
        detail:
          deliveryType === "delivery"
            ? "Pedido em rota para o cliente."
            : "Pedido aguardando retirada no balcão.",
        tone: "emerald" as const,
      };
    case "completed":
      return {
        label: deliveryType === "delivery" ? "Entregue" : "Retirado",
        detail: "Fluxo encerrado com sucesso.",
        tone: "zinc" as const,
      };
    case "canceled":
      return {
        label: "Cancelado",
        detail: "Pedido encerrado sem concluir a entrega.",
        tone: "rose" as const,
      };
  }
}

export function getOrderStatusNotificationText(
  status: OrderStatus,
  deliveryType: DeliveryType,
) {
  switch (status) {
    case "pending":
      return "Recebemos seu pedido e ele esta aguardando confirmacao da equipe.";
    case "confirmed":
      return "Seu pedido foi confirmado e ja entrou na fila de atendimento.";
    case "preparing":
      return "Seu pedido esta em preparo.";
    case "ready":
      return deliveryType === "delivery"
        ? "Seu pedido saiu para entrega."
        : "Seu pedido esta pronto para retirada.";
    case "completed":
      return deliveryType === "delivery"
        ? "Seu pedido foi entregue com sucesso. Obrigado por pedir com a gente."
        : "Seu pedido foi finalizado e retirado com sucesso. Obrigado por pedir com a gente.";
    case "canceled":
      return "Seu pedido foi cancelado. Se precisar, fale com a equipe para ajustar ou refazer o atendimento.";
  }
}

export function buildOrderStatusNotificationMessage(params: {
  restaurantName: string;
  restaurantWhatsappNumber?: string;
  orderId: string;
  customerName: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
}) {
  const firstName = params.customerName.trim().split(/\s+/)[0] ?? "cliente";
  const statusMeta = getOrderStatusMeta(params.status, params.deliveryType);
  const statusText = getOrderStatusNotificationText(
    params.status,
    params.deliveryType,
  );
  const restaurantWhatsapp = params.restaurantWhatsappNumber
    ? formatWhatsappDisplayNumber(params.restaurantWhatsappNumber)
    : null;

  return [
    `Ola, ${firstName}! Aqui e da ${params.restaurantName}.`,
    "",
    `Seu pedido ${formatOrderNumber(params.orderId)} teve uma atualizacao.`,
    `Status: ${statusMeta.label}.`,
    "",
    statusText,
    "",
    restaurantWhatsapp
      ? `WhatsApp da loja: ${restaurantWhatsapp}.`
      : "Qualquer duvida, pode responder esta mensagem.",
  ].join("\n");
}
