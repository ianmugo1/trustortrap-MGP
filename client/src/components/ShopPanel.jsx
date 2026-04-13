"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Sparkles, Home, Award, Lock } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { key: "petSkin",   label: "Pet Skins",   icon: Sparkles },
  { key: "roomTheme", label: "Room Themes",  icon: Home },
  { key: "badge",     label: "Badges",       icon: Award },
];

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
        if (!res.ok) throw new Error(data?.message || "Failed to load shop");
        setShopCatalog(Array.isArray(data.catalog) ? data.catalog : []);
      } catch (err) {
        setError(err.message || "Could not load shop.");
      }
    }
    loadShop();
  }, [token]);

  const purchaseItem = async (itemId) => {
    setStatus(""); setError(""); setLoadingKey(`buy:${itemId}`);
    try {
      const res = await authFetch("/api/users/me/shop/purchase", { method: "POST", body: JSON.stringify({ itemId }) }, token);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Purchase failed");
      setShopCatalog(data.catalog || shopCatalog);
      setStatus(data.message || "Item purchased!");
      await refreshUser();
    } catch (err) {
      setError(err.message || "Could not buy this item.");
    } finally {
      setLoadingKey("");
    }
  };

  const equipItem = async (itemId) => {
    setStatus(""); setError(""); setLoadingKey(`equip:${itemId}`);
    try {
      const res = await authFetch("/api/users/me/shop/equip", { method: "PATCH", body: JSON.stringify({ itemId }) }, token);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Equip failed");
      setShopCatalog(data.catalog || shopCatalog);
      setStatus(data.message || "Item equipped!");
      await refreshUser();
    } catch (err) {
      setError(err.message || "Could not equip this item.");
    } finally {
      setLoadingKey("");
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
              <ShoppingBag className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Item Shop</p>
              <h1 className="text-3xl font-black text-white">Shop</h1>
              <p className="mt-1 text-sm text-slate-400">Spend coins on cosmetics. Higher levels unlock more.</p>
            </div>
          </div>

          {/* Wallet */}
          <div className="flex gap-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-center">
              <p className="text-xs text-slate-400">Coins</p>
              <p className="mt-1 text-xl font-black text-amber-300">{user?.coins ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-center">
              <p className="text-xs text-slate-400">Level</p>
              <p className="mt-1 text-xl font-black text-white">{user?.level ?? 1}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {status && <div className="rounded-2xl border border-emerald-800 bg-emerald-950/60 px-4 py-3 text-sm font-medium text-emerald-300">{status}</div>}
      {error   && <div className="rounded-2xl border border-rose-800 bg-rose-950/60 px-4 py-3 text-sm font-medium text-rose-300">{error}</div>}

      {/* Categories */}
      {CATEGORIES.map(({ key, label, icon: Icon }) => {
        const items = shopCatalog.filter((item) => item.category === key);
        if (items.length === 0) return null;

        return (
          <section key={key} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-5">

            {/* Category heading */}
            <div className="mb-4 flex items-center gap-2">
              <Icon className="h-4 w-4 text-slate-400" />
              <h2 className="text-base font-bold text-white">{label}</h2>
              <span className="ml-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{items.length}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const isLoading = loadingKey === `buy:${item.id}` || loadingKey === `equip:${item.id}`;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                      item.equipped
                        ? "border-white/20 bg-white/5"
                        : item.locked
                        ? "border-slate-800 bg-slate-950/40 opacity-60"
                        : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
                    }`}
                  >
                    {/* Top row: name + price */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      {item.cost === 0
                        ? <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">Free</span>
                        : <span className="rounded-full bg-amber-900/50 px-2 py-0.5 text-xs font-semibold text-amber-300">{item.cost}c</span>
                      }
                    </div>

                    {/* Description */}
                    <p className="mt-1.5 text-xs text-slate-400">{item.description}</p>

                    {/* Lock notice */}
                    {item.locked && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><Lock className="h-3 w-3" /> Level {item.minLevel} required</p>
                    )}

                    {/* Action */}
                    <div className="mt-3">
                      {item.equipped ? (
                        <span className="text-xs font-semibold text-white">✓ Equipped</span>
                      ) : item.owned ? (
                        <button
                          type="button"
                          onClick={() => equipItem(item.id)}
                          disabled={isLoading}
                          className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-200 disabled:opacity-50"
                        >
                          {isLoading ? "Equipping..." : "Equip"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => purchaseItem(item.id)}
                          disabled={item.locked || isLoading}
                          className="rounded-xl border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isLoading ? "Buying..." : item.locked ? "Locked" : "Buy"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
