export const PRODUCT_OPTION_CATALOG = {
  Notebooks: {
    options: {
      size: {
        A6: { price: 80 },
        A5: { price: 120 },
        A4: { price: 160 },
      },
      coverType: {
        soft: { price: 0 },
        hard: { price: 40 },
      },
      pageType: {
        blank: { price: 0 },
        lined: { price: 20 },
      },
    },
    defaults: {
      size: "A5",
      coverType: "soft",
      pageType: "blank",
    },
  },
  "Wall Arts": {
    options: {
      size: {
        "20x30": { price: 180 },
        "40x50": { price: 260 },
        "30x40": { price: 240 },
        "50x60": { price: 380 },
        "50x70": { price: 460 },
      },
    },
    defaults: {
      size: "30x40",
    },
  },
};

export const getCategoryOptionCatalog = (category) => {
  if (!category) return null;
  return PRODUCT_OPTION_CATALOG[category] || null;
};

export const getDefaultOptionsForCategory = (category) => {
  const catalog = getCategoryOptionCatalog(category);
  return catalog?.defaults || {};
};

export const getProductOptionDefinitions = (product) => {
  if (!product?.category) return {};
  if (product.options) return product.options;

  const catalog = getCategoryOptionCatalog(product.category);
  return catalog?.options || {};
};

export const getDisplayedOptions = (product, selectedOptions = {}) => {
  const options = getProductOptionDefinitions(product);
  const defaults =
    product.defaults || getDefaultOptionsForCategory(product.category);
  const chosen = { ...defaults, ...selectedOptions };

  return Object.entries(options).reduce((acc, [key, valueMap]) => {
    const selectedValue = chosen[key];
    const definition = valueMap[selectedValue];
    acc[key] = selectedValue || Object.keys(valueMap)[0];
    acc[`${key}Price`] = definition?.price || 0;
    return acc;
  }, {});
};

export const buildCombinationKey = (product, selectedOptions = {}) => {
  const options = getProductOptionDefinitions(product);
  const keys = Object.keys(options);
  const defaults =
    product.defaults || getDefaultOptionsForCategory(product.category);
  const chosen = { ...defaults, ...selectedOptions };

  return keys.map((key) => chosen[key] || defaults[key] || "").join("|");
};

export const getProductOptionPrice = (product, selectedOptions = {}) => {
  if (!product || !product.options) {
    return Number(product?.price || 0);
  }

  const values = Object.entries(product.options).reduce(
    (sum, [key, optionMap]) => {
      const chosen =
        selectedOptions[key] ||
        product.defaults?.[key] ||
        Object.keys(optionMap)[0];
      const option = optionMap[chosen];
      return sum + Number(option?.price || 0);
    },
    0,
  );

  return Number(values);
};

export const getProductOptionOldPrice = (product, selectedOptions = {}) => {
  if (!product || !product.options) {
    return Number(product?.oldPrice || 0);
  }

  const values = Object.entries(product.options).reduce(
    (sum, [key, optionMap]) => {
      const chosen =
        selectedOptions[key] ||
        product.defaults?.[key] ||
        Object.keys(optionMap)[0];
      const option = optionMap[chosen];
      return sum + Number(option?.oldPrice || 0);
    },
    0,
  );

  return Number(values);
};

export const hasCombinationStockMap = (product) => {
  return false;
};

export const getProductCombinationStock = (product, selectedOptions = {}) => {
  if (!product) return 999;

  return 999;
};

export const getAvailableStock = (
  product,
  cartItems = [],
  selectedOptions = {},
) => {
  if (!product) return 0;

  const baseStock = getProductCombinationStock(product, selectedOptions);
  const chosenKey = buildCombinationKey(product, selectedOptions);

  const quantityInCart = cartItems.reduce((sum, item) => {
    if (item.id !== product.id) return sum;

    const itemKey = item.cartKey
      ? String(item.cartKey).split("::")[1]
      : buildCombinationKey(product, item.selectedOptions || {});

    if (itemKey !== chosenKey) return sum;

    return sum + Number(item.quantity || 0);
  }, 0);

  return Math.max(0, baseStock - quantityInCart);
};

export const summarizeChosenVariant = (product, selectedOptions = {}) => {
  if (!product) return "";

  const options = getProductOptionDefinitions(product);
  if (!options || Object.keys(options).length === 0) return "";

  const defaults =
    product.defaults || getDefaultOptionsForCategory(product.category);
  const chosen = { ...defaults, ...selectedOptions };

  const orderedKeys =
    product.category === "Notebooks"
      ? ["size", "coverType", "pageType"]
      : Object.keys(options);

  const pieces = orderedKeys
    .filter((key) => options[key])
    .map((key) => {
      const rawValue = chosen[key] || defaults[key];
      if (!rawValue) return "";

      const normalized = String(rawValue).trim().toLowerCase();
      if (normalized === "soft") return "Soft";
      if (normalized === "hard") return "Hard";
      if (normalized === "blank") return "Blank";
      if (normalized === "lined") return "Lined";

      return String(rawValue);
    });

  return pieces.filter(Boolean).join(" • ");
};

export const getProductOptionValueDisplay = (product, selectedOptions = {}) => {
  return summarizeChosenVariant(product, selectedOptions);
};

export const getCartItemKey = (product, selectedOptions = {}) => {
  const key = buildCombinationKey(product, selectedOptions);
  return `${product.id}::${key}`;
};
