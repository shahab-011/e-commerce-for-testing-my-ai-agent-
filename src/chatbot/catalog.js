const REQUIRED_PRODUCT_FIELDS = ["id", "name", "price", "type", "primaryImage"];

/** Return only storefront products that satisfy the chatbot catalog contract. */
export function getSellableProducts(products) {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .filter((product) => {
      if (!product || typeof product !== "object" || product.type === "iGPosts") {
        return false;
      }

      return (
        REQUIRED_PRODUCT_FIELDS.every((field) => product[field] !== undefined) &&
        typeof product.id === "string" &&
        product.id.trim().length > 0 &&
        typeof product.name === "string" &&
        product.name.trim().length > 0 &&
        typeof product.price === "number" &&
        Number.isFinite(product.price) &&
        product.price >= 0 &&
        typeof product.type === "string" &&
        product.type.trim().length > 0 &&
        typeof product.primaryImage === "string" &&
        product.primaryImage.trim().length > 0
      );
    })
    .map(({ id, name, price, type, primaryImage }) => ({
      id,
      name,
      price,
      type,
      primaryImage,
    }));
}
