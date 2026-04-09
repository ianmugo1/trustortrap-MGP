export const SHOP_CATALOG = [
  {
    id: "skin-classic",
    name: "Classic Shell",
    category: "petSkin",
    cost: 0,
    minLevel: 1,
    description: "The default Byte shell.",
    accent: "emerald",
  },
  {
    id: "skin-sunrise",
    name: "Sunrise Shell",
    category: "petSkin",
    cost: 80,
    minLevel: 2,
    description: "Warm orange plating for Byte.",
    accent: "amber",
  },
  {
    id: "skin-frost",
    name: "Frost Shell",
    category: "petSkin",
    cost: 140,
    minLevel: 3,
    description: "A cool blue shell with bright highlights.",
    accent: "sky",
  },
  {
    id: "theme-terminal",
    name: "Terminal Room",
    category: "roomTheme",
    cost: 0,
    minLevel: 1,
    description: "The default cyber room theme.",
    accent: "slate",
  },
  {
    id: "theme-forest",
    name: "Forest Room",
    category: "roomTheme",
    cost: 120,
    minLevel: 2,
    description: "A calmer green room for Byte.",
    accent: "emerald",
  },
  {
    id: "theme-arcade",
    name: "Arcade Room",
    category: "roomTheme",
    cost: 180,
    minLevel: 4,
    description: "A brighter room with arcade colours.",
    accent: "fuchsia",
  },
  {
    id: "badge-none",
    name: "No Badge",
    category: "badge",
    cost: 0,
    minLevel: 1,
    description: "No badge equipped.",
    accent: "slate",
  },
  {
    id: "badge-streak",
    name: "Streak Badge",
    category: "badge",
    cost: 90,
    minLevel: 2,
    description: "Show off your daily habit streak.",
    accent: "cyan",
  },
  {
    id: "badge-guardian",
    name: "Guardian Badge",
    category: "badge",
    cost: 220,
    minLevel: 5,
    description: "A badge for serious cyber protectors.",
    accent: "violet",
  },
];

const DEFAULT_EQUIPPED = {
  petSkin: "skin-classic",
  roomTheme: "theme-terminal",
  badge: "badge-none",
};

export function getShopItem(itemId) {
  return SHOP_CATALOG.find((item) => item.id === itemId) || null;
}

export function getDefaultOwnedItemIds() {
  return SHOP_CATALOG.filter((item) => item.cost === 0).map((item) => item.id);
}

export function normalizeUserShop(shop = {}) {
  const defaultOwned = getDefaultOwnedItemIds();
  const ownedItemIds = Array.isArray(shop.ownedItemIds)
    ? [...new Set([...defaultOwned, ...shop.ownedItemIds.filter(Boolean)])]
    : defaultOwned;

  const equipped = {
    petSkin: shop.equipped?.petSkin || DEFAULT_EQUIPPED.petSkin,
    roomTheme: shop.equipped?.roomTheme || DEFAULT_EQUIPPED.roomTheme,
    badge: shop.equipped?.badge || DEFAULT_EQUIPPED.badge,
  };

  for (const category of Object.keys(equipped)) {
    if (!ownedItemIds.includes(equipped[category])) {
      equipped[category] = DEFAULT_EQUIPPED[category];
    }
  }

  return {
    ownedItemIds,
    equipped,
  };
}

export function getCatalogForUser(user) {
  const level = Math.max(1, Number(user?.level) || 1);
  const shop = normalizeUserShop(user?.shop);

  return SHOP_CATALOG.map((item) => ({
    ...item,
    owned: shop.ownedItemIds.includes(item.id),
    equipped: shop.equipped[item.category] === item.id,
    locked: level < item.minLevel,
  }));
}
