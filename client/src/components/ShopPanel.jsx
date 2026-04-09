"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function formatShopError(message, fallback) {
  const raw = String(message || "").trim();
  if (!raw) return fallback;
  if (raw.includes("Unable to reach the API server")) return raw;
  return raw;
}

export default function ShopPanel() {
  const { user, token, refreshUser } = useAuth();
  const [shopCatalog, setShopCatalog] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadingKey, setLoadingKey] = useState("");

  useEffect(() => {
    if (!token) return;

    async function loadShop() {
      try {
        const res = await authFetch("/api/users/me/shop", {}, token);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load shop");
        }
        setShopCatalog(Array.isArray(data.catalog) ? data.catalog : []);
      } catch (err) {
        setError(formatShopError(err.message, "Could not load shop."));
      }
    }

    loadShop();
  }, [token]);

  const clearMessages = () => {
    setStatus("");
    setError("");
  };

  const syncShopState = async (data, fallbackMessage) => {
    if (Array.isArray(data?.catalog)) {
      setShopCatalog(data.catalog);
    }
    if (data?.user) {
      await refreshUser();
    }
    setStatus(data?.message || fallbackMessage);
  };

  const purchaseItem = async (itemId) => {
    clearMessages();
    setLoadingKey(`purchase:${itemId}`);

    try {
      const res = await authFetch(
        "/api/users/me/shop/purchase",
        {
          method: "POST",
          body: JSON.stringify({ itemId }),
        },
        token
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to buy item");
      }
      await syncShopState(data, "Item purchased.");
    } catch (err) {
      setError(formatShopError(err.message, "Could not buy this item."));
    } finally {
      setLoadingKey("");
    }
  };

  const equipItem = async (itemId) => {
    clearMessages();
    setLoadingKey(`equip:${itemId}`);

    try {
      const res = await authFetch(
        "/api/users/me/shop/equip",
        {
          method: "PATCH",
          body: JSON.stringify({ itemId }),
        },
        token
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to equip item");
      }
      await syncShopState(data, "Item equipped.");
    } catch (err) {
      setError(formatShopError(err.message, "Could not equip this item."));
    } finally {
      setLoadingKey("");
    }
  };

  return (
    <div className="space-y-6">
      {status && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {status}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-emerald-300">Shop</p>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                Beta
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Spend coins on Byte cosmetics and level rewards.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Coins buy cosmetics. XP and levels unlock better items. Buy something here and it
              appears on your cyber pet right away.
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-100/85">
              This shop is an early version. More items and unlocks will be added later.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Wallet
              </p>
              <p className="mt-3 text-3xl font-black text-amber-300">
                {user?.coins || 0}
              </p>
              <p className="mt-1 text-sm text-slate-400">Coins ready to spend</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Level
              </p>
              <p className="mt-3 text-3xl font-black text-white">
                {user?.level || 1}
              </p>
              <p className="mt-1 text-sm text-slate-400">Higher levels unlock more items</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Item shop</h2>
            <p className="mt-1 text-sm text-slate-400">
              Owned items can be equipped again anytime.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {shopCatalog.map((item) => {
            const actionKey = item.owned ? `equip:${item.id}` : `purchase:${item.id}`;
            const isLoading = loadingKey === actionKey;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-300">
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-300">{item.cost} coins</p>
                    <p className="mt-1 text-xs text-slate-500">Level {item.minLevel}+</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.equipped ? (
                    <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200">
                      Equipped
                    </span>
                  ) : item.owned ? (
                    <button
                      type="button"
                      onClick={() => equipItem(item.id)}
                      disabled={isLoading}
                      className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {isLoading ? "Equipping..." : "Equip"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => purchaseItem(item.id)}
                      disabled={item.locked || isLoading}
                      className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Buying..." : item.locked ? `Unlock at level ${item.minLevel}` : "Buy"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
