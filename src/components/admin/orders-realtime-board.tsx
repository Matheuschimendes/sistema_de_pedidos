"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  Clock3,
  ExternalLink,
  Eye,
  RefreshCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { OrderStatusControls } from "@/src/components/admin/order-status-controls";
import { formatBRL } from "@/src/lib/format";
import {
  getDeliveryTypeLabel,
  getNextOrderStatus,
  getOrderStatusMeta,
  getPaymentMethodLabel,
  isOrderLocked,
  normalizePhoneNumber,
} from "@/src/lib/order-presentation";
import { OrderFeedItem, OrderMetrics, OrderStatus } from "@/src/types/order";

type OrdersRealtimeBoardProps = {
  initialOrders: OrderFeedItem[];
  initialMetrics: OrderMetrics;
  initialServerNow: string;
  statusMessage?: string | null;
  restaurantDeliveryTime?: string;
};

type OrdersSnapshotResponse = {
  orders: OrderFeedItem[];
  metrics: OrderMetrics;
  serverNow: string;
};

type BoardColumn = {
  status: OrderStatus;
  title: string;
  description: string;
  tone: "rose" | "sky" | "violet" | "emerald" | "zinc";
};

const pollingIntervalMs = 5000;

const boardColumns: BoardColumn[] = [
  {
    status: "pending",
    title: "Aguardando confirmacao",
    description: "Pedidos novos esperando resposta da equipe.",
    tone: "rose",
  },
  {
    status: "confirmed",
    title: "Confirmado",
    description: "Pedidos aceitos e prontos para entrar na preparacao.",
    tone: "sky",
  },
  {
    status: "preparing",
    title: "Preparando",
    description: "Itens sendo separados e preparados agora.",
    tone: "violet",
  },
  {
    status: "ready",
    title: "Pronto / em rota",
    description: "Pedidos aguardando retirada ou ja saindo para entrega.",
    tone: "emerald",
  },
  {
    status: "completed",
    title: "Concluido",
    description: "Ultimos pedidos encerrados com sucesso.",
    tone: "zinc",
  },
];

export function OrdersRealtimeBoard({
  initialOrders,
  initialMetrics,
  initialServerNow,
  statusMessage,
  restaurantDeliveryTime,
}: OrdersRealtimeBoardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [lastSyncAt, setLastSyncAt] = useState(initialServerNow);
  const [feedStatus, setFeedStatus] = useState<"connecting" | "ready" | "error">(
    "connecting",
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(
    () =>
      new Set(
        initialOrders
          .filter((order) => order.status === "pending")
          .slice(0, 1)
          .map((order) => order.id),
      ),
  );
  const [focusedOrderId, setFocusedOrderId] = useState<string | null>(null);
  const [freshOrderIds, setFreshOrderIds] = useState<Set<string>>(new Set());
  const [notificationQueue, setNotificationQueue] = useState<OrderFeedItem[]>([]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mutedAlertId, setMutedAlertId] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    return Notification.permission;
  });

  const knownOrderIdsRef = useRef(new Set(initialOrders.map((order) => order.id)));
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundLoopRef = useRef<number | null>(null);

  const currentAlert = notificationQueue[0] ?? null;
  const isCurrentAlertMuted =
    currentAlert != null && mutedAlertId === currentAlert.id;

  const ordersByStatus = useMemo(() => {
    return boardColumns.reduce(
      (accumulator, column) => {
        accumulator[column.status] = orders
          .filter((order) => order.status === column.status)
          .sort((left, right) => {
            if (column.status === "pending") {
              return (
                new Date(left.createdAt).getTime() -
                new Date(right.createdAt).getTime()
              );
            }

            return (
              new Date(right.updatedAt).getTime() -
              new Date(left.updatedAt).getTime()
            );
          });

        return accumulator;
      },
      {} as Record<OrderStatus, OrderFeedItem[]>,
    );
  }, [orders]);

  const clearSoundLoop = useCallback(() => {
    if (soundLoopRef.current) {
      window.clearInterval(soundLoopRef.current);
      soundLoopRef.current = null;
    }
  }, []);

  const playAlertTone = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const audioContext =
        audioContextRef.current ?? new window.AudioContext();

      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.04;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.18);
    } catch {}
  }, []);

  const pushFreshOrders = useCallback((freshOrders: OrderFeedItem[]) => {
    if (freshOrders.length === 0) {
      return;
    }

    const freshIds = freshOrders.map((order) => order.id);

    setFreshOrderIds((current) => {
      const next = new Set(current);

      for (const freshId of freshIds) {
        next.add(freshId);
      }

      return next;
    });

    window.setTimeout(() => {
      setFreshOrderIds((current) => {
        const next = new Set(current);

        for (const freshId of freshIds) {
          next.delete(freshId);
        }

        return next;
      });
    }, 12000);
  }, []);

  const applySnapshot = useCallback(
    (snapshot: OrdersSnapshotResponse, notifyOnNewOrders: boolean) => {
      const freshOrders = notifyOnNewOrders
        ? snapshot.orders.filter((order) => !knownOrderIdsRef.current.has(order.id))
        : [];

      knownOrderIdsRef.current = new Set([
        ...knownOrderIdsRef.current,
        ...snapshot.orders.map((order) => order.id),
      ]);

      startTransition(() => {
        setOrders(snapshot.orders);
        setMetrics(snapshot.metrics);
        setLastSyncAt(snapshot.serverNow);
        setFeedStatus("ready");
      });

      if (freshOrders.length === 0) {
        return;
      }

      const sortedFreshOrders = [...freshOrders].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      );

      pushFreshOrders(sortedFreshOrders);
      setNotificationQueue((current) => [...current, ...sortedFreshOrders]);
      setExpandedOrderIds((current) => {
        const next = new Set(current);

        for (const order of sortedFreshOrders) {
          next.add(order.id);
        }

        return next;
      });

      if (notificationPermission === "granted") {
        for (const order of sortedFreshOrders) {
          try {
            const notification = new window.Notification("Novo pedido!", {
              body: `${order.orderNumber} · ${order.customerName} · ${formatBRL(order.total)}`,
            });

            window.setTimeout(() => notification.close(), 5000);
          } catch {}
        }
      }
    },
    [notificationPermission, pushFreshOrders],
  );

  const refreshSnapshot = useCallback(
    async (notifyOnNewOrders = true) => {
      setIsRefreshing(true);

      try {
        const response = await fetch("/api/admin/orders/live", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          setFeedStatus("error");
          return;
        }

        const snapshot = (await response.json()) as OrdersSnapshotResponse;
        applySnapshot(snapshot, notifyOnNewOrders);
      } catch {
        setFeedStatus("error");
      } finally {
        setIsRefreshing(false);
      }
    },
    [applySnapshot],
  );

  useEffect(() => {
    void refreshSnapshot(false);

    const intervalId = window.setInterval(() => {
      void refreshSnapshot(true);
    }, pollingIntervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshSnapshot(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSnapshot]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    clearSoundLoop();

    if (!currentAlert || !soundEnabled || isCurrentAlertMuted) {
      return;
    }

    playAlertTone();
    soundLoopRef.current = window.setInterval(() => {
      playAlertTone();
    }, 1600);

    return () => clearSoundLoop();
  }, [
    clearSoundLoop,
    currentAlert,
    isCurrentAlertMuted,
    playAlertTone,
    soundEnabled,
  ]);

  function toggleOrderExpansion(orderId: string) {
    setExpandedOrderIds((current) => {
      const next = new Set(current);

      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }

      return next;
    });
  }

  function dismissCurrentAlert() {
    clearSoundLoop();
    setNotificationQueue((current) => current.slice(1));
  }

  function focusOrder(orderId: string) {
    setExpandedOrderIds((current) => {
      const next = new Set(current);
      next.add(orderId);
      return next;
    });
    setFocusedOrderId(orderId);

    window.setTimeout(() => {
      const element = document.getElementById(`order-card-${orderId}`);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 50);

    window.setTimeout(() => {
      setFocusedOrderId((current) => (current === orderId ? null : current));
    }, 4000);
  }

  async function requestDesktopNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
  }

  return (
    <div className="space-y-5">
      {statusMessage ? (
        <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          {statusMessage}
        </div>
      ) : null}

      {feedStatus === "error" ? (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          O quadro nao conseguiu atualizar os pedidos agora. Assim que a conexao
          voltar, os alertas voltam automaticamente.
        </div>
      ) : null}

      <section className="rounded-[26px] border border-zinc-200 bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.06)] sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
          Painel em tempo real
        </p>

        <div className="mt-4 flex flex-col gap-4 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-start">
          <div className="max-w-3xl">
            <h2 className="text-[1.95rem] font-semibold tracking-tight text-zinc-950">
              Gerenciar pedidos ao vivo
            </h2>
            <p className="mt-3 text-[15px] leading-8 text-zinc-500">
              O quadro se atualiza sozinho, destaca pedidos novos e mantem a
              equipe orientada por etapa do fluxo.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap xl:rounded-[22px] xl:border xl:border-zinc-200/80 xl:bg-zinc-50/70 xl:p-2">
            <InfoPill
              icon={Clock3}
              label={`Atualiza a cada ${pollingIntervalMs / 1000}s`}
            />
            {restaurantDeliveryTime ? (
              <InfoPill
                icon={RefreshCcw}
                label={`Entrega: ${restaurantDeliveryTime}`}
              />
            ) : null}
            <InfoPill
              icon={RefreshCcw}
              label={
                feedStatus === "error"
                  ? "Feed com problema"
                  : `Ultima sync ${formatTime(lastSyncAt)}`
              }
              active={isRefreshing || feedStatus === "error"}
            />
            <button
              type="button"
              onClick={() => setSoundEnabled((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                soundEnabled
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              {soundEnabled ? "Som ativo" : "Som desligado"}
            </button>
            <button
              type="button"
              onClick={() => {
                void requestDesktopNotifications();
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                notificationPermission === "granted"
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              {notificationPermission === "granted" ? (
                <BellRing className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {getNotificationButtonLabel(notificationPermission)}
            </button>
          </div>
        </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          <MetricCard
            label="Em aberto"
            value={`${metrics.open}`}
            detail="pedidos ativos no quadro"
            tone="rose"
          />
          <MetricCard
            label="Aguardando"
            value={`${metrics.pending}`}
            detail="novos para confirmar"
            tone="rose"
          />
          <MetricCard
            label="Confirmado"
            value={`${metrics.confirmed}`}
            detail="prontos para seguir"
            tone="sky"
          />
          <MetricCard
            label="Preparando"
            value={`${metrics.preparing}`}
            detail="em operacao agora"
            tone="violet"
          />
          <MetricCard
            label="Pronto / rota"
            value={`${metrics.ready}`}
            detail="saida ou retirada"
            tone="emerald"
          />
          <MetricCard
            label="Concluidos"
            value={`${metrics.completed}`}
            detail={`${metrics.canceled} cancelado(s)`}
            tone="zinc"
          />
        </div>
      </section>

      <section className="rounded-[26px] border border-zinc-200 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
        <div className="border-b border-zinc-200 px-5 py-5 md:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Quadro
          </p>
          <h3 className="mt-2 text-[1.4rem] font-semibold tracking-tight text-zinc-950">
            Painel de pedidos em tempo real
          </h3>
          <p className="mt-2 text-sm leading-7 text-zinc-500">
            Pedidos cancelados saem do fluxo. Os cards podem ser expandidos
            quando voce precisar de detalhes e atualizam sozinhos no painel.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-6 md:px-6">
            <div className="rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Sem pedidos ativos
              </p>
              <h4 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-zinc-950">
                O painel esta aguardando novos pedidos
              </h4>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                Assim que um novo checkout for confirmado, o card vai aparecer
                automaticamente aqui e voce recebera o alerta instantaneo.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto px-5 py-5 md:px-6 md:py-6 xl:pb-7">
            <div className="grid min-w-max grid-flow-col auto-cols-[320px] gap-4 xl:auto-cols-[340px] 2xl:auto-cols-[360px]">
              {boardColumns.map((column) => (
                <OrderBoardColumn
                  key={column.status}
                  column={column}
                  orders={ordersByStatus[column.status] ?? []}
                  expandedOrderIds={expandedOrderIds}
                  focusedOrderId={focusedOrderId}
                  freshOrderIds={freshOrderIds}
                  currentTime={currentTime}
                  onToggleOrder={toggleOrderExpansion}
                  onFocusOrder={focusOrder}
                  onStatusChanged={() => refreshSnapshot(false)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {currentAlert ? (
        <div className="fixed right-5 top-24 z-50 w-[min(360px,calc(100vw-2rem))] rounded-[24px] border border-emerald-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between rounded-t-[24px] bg-emerald-600 px-5 py-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BellRing className="h-4 w-4" />
              Novo pedido!
            </div>

            <button
              type="button"
              onClick={dismissCurrentAlert}
              className="text-sm font-semibold text-white/90 transition hover:text-white"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div>
              <p className="text-lg font-semibold text-zinc-950">
                Pedido {currentAlert.orderNumber}
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Cliente: {currentAlert.customerName}
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Total: {formatBRL(currentAlert.total)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  focusOrder(currentAlert.id);
                  dismissCurrentAlert();
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
              >
                <Eye className="h-4 w-4" />
                Ver pedido
              </button>

                <button
                  type="button"
                  onClick={() => setMutedAlertId(currentAlert.id)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                <VolumeX className="h-4 w-4" />
                Parar som
              </button>
            </div>

            {notificationQueue.length > 1 ? (
              <p className="text-xs font-medium text-zinc-500">
                Mais {notificationQueue.length - 1} pedido(s) aguardando alerta.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OrderBoardColumn({
  column,
  orders,
  expandedOrderIds,
  focusedOrderId,
  freshOrderIds,
  currentTime,
  onToggleOrder,
  onFocusOrder,
  onStatusChanged,
}: {
  column: BoardColumn;
  orders: OrderFeedItem[];
  expandedOrderIds: Set<string>;
  focusedOrderId: string | null;
  freshOrderIds: Set<string>;
  currentTime: number;
  onToggleOrder: (orderId: string) => void;
  onFocusOrder: (orderId: string) => void;
  onStatusChanged: () => Promise<void>;
}) {
  return (
    <section className="min-h-[640px] rounded-[24px] border border-zinc-200 bg-[linear-gradient(180deg,#fbfbfd_0%,#f4f6fb_100%)] shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
      <div
        className={`flex items-center justify-between gap-3 rounded-t-[26px] px-4 py-4 text-white ${getColumnHeaderClassNames(
          column.tone,
        )}`}
      >
        <div>
          <p className="text-base font-semibold">{column.title}</p>
          <p className="mt-1 text-xs text-white/80">{column.description}</p>
        </div>

        <div className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
          {orders.length}
        </div>
      </div>

      <div className="max-h-[calc(100vh-290px)] space-y-3 overflow-y-auto p-3 xl:p-4">
        {orders.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm leading-7 text-zinc-500">
            Nenhum pedido nesta etapa no momento.
          </div>
        ) : (
          orders.map((order) => (
            <OrderRealtimeCard
              key={order.id}
              order={order}
              currentTime={currentTime}
              isExpanded={expandedOrderIds.has(order.id)}
              isFocused={focusedOrderId === order.id}
              isFresh={freshOrderIds.has(order.id)}
              onToggle={() => onToggleOrder(order.id)}
              onFocus={() => onFocusOrder(order.id)}
              onStatusChanged={onStatusChanged}
            />
          ))
        )}
      </div>
    </section>
  );
}

function OrderRealtimeCard({
  order,
  currentTime,
  isExpanded,
  isFocused,
  isFresh,
  onToggle,
  onFocus,
  onStatusChanged,
}: {
  order: OrderFeedItem;
  currentTime: number;
  isExpanded: boolean;
  isFocused: boolean;
  isFresh: boolean;
  onToggle: () => void;
  onFocus: () => void;
  onStatusChanged: () => Promise<void>;
}) {
  const statusMeta = getOrderStatusMeta(order.status, order.deliveryType);
  const nextStatus = getNextOrderStatus(order.status);
  const nextStatusMeta = nextStatus
    ? getOrderStatusMeta(nextStatus, order.deliveryType)
    : null;
  const phoneNumber = normalizePhoneNumber(order.customerPhone);
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const canAdvance = Boolean(nextStatus) && !isOrderLocked(order.status);
  const canCancel = order.status !== "completed" && order.status !== "canceled";

  return (
    <article
      id={`order-card-${order.id}`}
      className={`rounded-[20px] border bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.07)] transition hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)] ${
        isFocused
          ? "border-violet-400 ring-2 ring-violet-200"
          : isFresh
            ? "border-emerald-300 ring-2 ring-emerald-100"
            : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-[10px] bg-slate-700 px-3 py-1 text-base font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.14)]">
          {order.orderNumber}
        </span>

        <div className="text-right">
          <div className="text-[1.1rem] font-semibold text-emerald-700">
            {formatBRL(order.total)}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {getPaymentMethodLabel(order.paymentMethod)}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm font-medium text-zinc-900">{order.customerName}</div>
        <div className="mt-1 text-xs text-zinc-500">
          {getDeliveryTypeLabel(order.deliveryType)}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-zinc-900">Itens:</p>
        <div className="mt-2 space-y-1.5">
          {order.items.slice(0, 2).map((item) => (
            <p key={item.id} className="text-sm text-zinc-600">
              {item.quantity}x {item.name}
            </p>
          ))}
          {order.items.length > 2 ? (
            <p className="text-sm text-zinc-400">
              + {order.items.length - 2} item(ns)
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
        <span>{formatDateTime(order.createdAt)}</span>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-600">
          {formatElapsedTime(order.createdAt, currentTime)}
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 font-semibold ${getToneClassNames(
            statusMeta.tone,
          )}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
      >
        <Eye className="h-4 w-4" />
        {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
      </button>

      {isExpanded ? (
        <div className="mt-4 space-y-4 border-t border-zinc-100 pt-4">
          <div className="grid gap-3">
            <CompactInfoRow
              label="Contato"
              value={order.customerPhone}
              detail={phoneNumber ? "WhatsApp disponivel" : "Sem numero valido"}
            />
            <CompactInfoRow
              label="Endereco"
              value={order.customerAddress ?? "Retirada no balcao"}
              detail={order.customerNotes ?? "Sem observacoes"}
            />
            <CompactInfoRow
              label="Proxima etapa"
              value={nextStatusMeta?.label ?? "Fluxo encerrado"}
              detail={statusMeta.detail}
            />
            <CompactInfoRow
              label="Quantidade"
              value={`${itemCount} unidade(s)`}
              detail={`Subtotal ${formatBRL(order.subtotal)}`}
            />
          </div>

          <div className="space-y-2 rounded-[18px] border border-zinc-200 bg-zinc-50 p-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-zinc-700">
                  {item.quantity}x {item.name}
                </span>
                <strong className="text-zinc-900">{formatBRL(item.total)}</strong>
              </div>
            ))}
          </div>

          <OrderStatusControls
            orderId={order.id}
            status={order.status}
            deliveryType={order.deliveryType}
            canAdvance={canAdvance}
            canCancel={canCancel}
            nextStatusLabel={nextStatusMeta?.label}
            onActionSuccess={onStatusChanged}
          />

          <div className="flex flex-col gap-2">
            {phoneNumber ? (
              <Link
                href={`https://wa.me/${phoneNumber}`}
                target="_blank"
                rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir WhatsApp do cliente
              </Link>
            ) : null}

            <button
              type="button"
              onClick={onFocus}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
            >
              <Eye className="h-4 w-4" />
              Destacar no painel
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: BoardColumn["tone"];
}) {
  return (
    <div className="rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </div>
      <div className={`mt-2 text-[1.25rem] font-semibold tracking-tight ${getMetricToneClassNames(tone)}`}>
        {value}
      </div>
      <div className="mt-1 text-sm text-zinc-500">{detail}</div>
    </div>
  );
}

function CompactInfoRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[16px] border border-zinc-200 bg-white px-3 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.03)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-zinc-900">
        {value}
      </div>
      <div className="mt-1 text-sm leading-6 text-zinc-500">{detail}</div>
    </div>
  );
}

function InfoPill({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Clock3;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${
        active
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-zinc-200 bg-white text-zinc-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

function formatElapsedTime(value: string, now: number) {
  const diffInSeconds = Math.max(
    0,
    Math.floor((now - new Date(value).getTime()) / 1000),
  );

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  const remainingMinutes = diffInMinutes % 60;

  if (remainingMinutes === 0) {
    return `${diffInHours}h`;
  }

  return `${diffInHours}h ${remainingMinutes}min`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function getNotificationButtonLabel(
  permission: NotificationPermission | "unsupported",
) {
  switch (permission) {
    case "granted":
      return "Alertas do navegador ativos";
    case "denied":
      return "Alertas bloqueados";
    case "unsupported":
      return "Alertas indisponiveis";
    case "default":
    default:
      return "Ativar alertas do navegador";
  }
}

function getColumnHeaderClassNames(tone: BoardColumn["tone"]) {
  switch (tone) {
    case "rose":
      return "bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)]";
    case "sky":
      return "bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)]";
    case "violet":
      return "bg-[linear-gradient(135deg,#8b5cf6_0%,#6d28d9_100%)]";
    case "emerald":
      return "bg-[linear-gradient(135deg,#10b981_0%,#059669_100%)]";
    case "zinc":
    default:
      return "bg-[linear-gradient(135deg,#64748b_0%,#475569_100%)]";
  }
}

function getToneClassNames(
  tone: ReturnType<typeof getOrderStatusMeta>["tone"],
) {
  switch (tone) {
    case "amber":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "blue":
      return "border-sky-300 bg-sky-50 text-sky-700";
    case "violet":
      return "border-violet-300 bg-violet-50 text-violet-700";
    case "emerald":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "rose":
      return "border-rose-300 bg-rose-50 text-rose-700";
    case "zinc":
    default:
      return "border-zinc-300 bg-zinc-100 text-zinc-700";
  }
}

function getMetricToneClassNames(tone: BoardColumn["tone"]) {
  switch (tone) {
    case "rose":
      return "text-rose-600";
    case "sky":
      return "text-sky-600";
    case "violet":
      return "text-violet-600";
    case "emerald":
      return "text-emerald-600";
    case "zinc":
    default:
      return "text-zinc-900";
  }
}
