"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, ClipboardList, VolumeX } from "lucide-react";
import { formatBRL } from "@/src/lib/format";
import { OrderFeedItem } from "@/src/types/order";

type OrdersSnapshotResponse = {
  orders: OrderFeedItem[];
  serverNow: string;
};

type AdminOrderNotifierProps = {
  enabled?: boolean;
};

const pollingIntervalMs = 5000;

export function AdminOrderNotifier({
  enabled = true,
}: AdminOrderNotifierProps) {
  const router = useRouter();
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [feedStatus, setFeedStatus] = useState<"connecting" | "ready" | "error">(
    "connecting",
  );
  const [notificationQueue, setNotificationQueue] = useState<OrderFeedItem[]>([]);
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

  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundLoopRef = useRef<number | null>(null);

  const currentAlert = notificationQueue[0] ?? null;
  const isCurrentAlertMuted =
    currentAlert != null && mutedAlertId === currentAlert.id;

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

  const applySnapshot = useCallback(
    (snapshot: OrdersSnapshotResponse, notifyOnNewOrders: boolean) => {
      const knownOrderIds = knownOrderIdsRef.current;
      const freshOrders =
        notifyOnNewOrders && knownOrderIds
          ? snapshot.orders.filter((order) => !knownOrderIds.has(order.id))
          : [];

      knownOrderIdsRef.current = new Set(snapshot.orders.map((order) => order.id));
      setLastSyncAt(snapshot.serverNow);
      setFeedStatus("ready");

      if (freshOrders.length === 0) {
        return;
      }

      const sortedFreshOrders = [...freshOrders].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      );

      setNotificationQueue((current) => {
        const queuedIds = new Set(current.map((order) => order.id));

        return [
          ...current,
          ...sortedFreshOrders.filter((order) => !queuedIds.has(order.id)),
        ];
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
    [notificationPermission],
  );

  const refreshSnapshot = useCallback(
    async (notifyOnNewOrders: boolean) => {
      if (!enabled) {
        return;
      }

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
      }
    },
    [applySnapshot, enabled],
  );

  useEffect(() => {
    if (!enabled) {
      clearSoundLoop();
      return;
    }

    const bootstrapTimeoutId = window.setTimeout(() => {
      void refreshSnapshot(false);
    }, 0);

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
      window.clearTimeout(bootstrapTimeoutId);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearSoundLoop, enabled, refreshSnapshot]);

  useEffect(() => {
    clearSoundLoop();

    if (!enabled || !currentAlert || !soundEnabled || isCurrentAlertMuted) {
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
    enabled,
    isCurrentAlertMuted,
    playAlertTone,
    soundEnabled,
  ]);

  async function requestDesktopNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
  }

  function dismissCurrentAlert() {
    clearSoundLoop();
    setNotificationQueue((current) => current.slice(1));
  }

  if (!enabled) {
    return null;
  }

  return (
    <>
      {feedStatus === "error" ? (
        <div className="fixed bottom-5 right-5 z-40 w-[min(360px,calc(100vw-2rem))] rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-[0_20px_50px_rgba(15,23,42,0.15)]">
          <div className="flex items-center gap-2 font-semibold">
            <Bell className="h-4 w-4" />
            Feed de pedidos desconectado
          </div>
          <p className="mt-2 leading-6">
            O painel tentou atualizar os pedidos e nao recebeu resposta. Assim
            que a conexao voltar, as notificacoes voltam junto.
          </p>
          <button
            type="button"
            onClick={() => {
              void refreshSnapshot(false);
            }}
            className="mt-3 inline-flex items-center justify-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

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
              <p className="mt-2 text-xs font-medium text-zinc-500">
                {lastSyncAt
                  ? `Detectado as ${formatTime(lastSyncAt)}`
                  : "Pedido detectado agora"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  router.push("/admin/orders");
                  dismissCurrentAlert();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
              >
                <ClipboardList className="h-4 w-4" />
                Abrir pedidos
              </button>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMutedAlertId(currentAlert.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <VolumeX className="h-4 w-4" />
                  Parar som
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (notificationPermission === "default") {
                      void requestDesktopNotifications();
                      return;
                    }

                    setSoundEnabled((current) => !current);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <Bell className="h-4 w-4" />
                  {notificationPermission === "default"
                    ? "Ativar alerta"
                    : soundEnabled
                      ? "Som ativo"
                      : "Som desligado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
