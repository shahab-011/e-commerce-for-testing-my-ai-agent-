import { getSellableProducts } from "./catalog";
import { store } from "../productsStore/Store";

describe("getSellableProducts", () => {
  test("returns only valid, uniquely identified products from the storefront catalog", () => {
    const products = getSellableProducts(store);
    const ids = products.map((product) => product.id);

    expect(products).toHaveLength(44);
    expect(ids).toHaveLength(new Set(ids).size);
    expect(products.every((product) => product.type !== "iGPosts")).toBe(true);
    expect(
      products.every(
        ({ id, name, price, type, primaryImage }) =>
          Boolean(id && name && type && primaryImage) &&
          Number.isFinite(price) &&
          price >= 0
      )
    ).toBe(true);
  });

  test("drops display-only, incomplete, and invalid-price records", () => {
    const products = getSellableProducts([
      {
        id: "1",
        name: "Cleanser",
        price: 9,
        type: "bestSeller",
        primaryImage: "https://example.com/cleanser.jpg",
      },
      {
        id: "2",
        type: "iGPosts",
        primaryImage: "https://example.com/post.jpg",
      },
      {
        id: "3",
        name: "Missing price",
        type: "bestSeller",
        primaryImage: "https://example.com/missing-price.jpg",
      },
      {
        id: "4",
        name: "Invalid price",
        price: "9",
        type: "bestSeller",
        primaryImage: "https://example.com/invalid-price.jpg",
      },
    ]);

    expect(products).toEqual([
      {
        id: "1",
        name: "Cleanser",
        price: 9,
        type: "bestSeller",
        primaryImage: "https://example.com/cleanser.jpg",
      },
    ]);
  });

  test("returns an empty catalog for invalid input", () => {
    expect(getSellableProducts(null)).toEqual([]);
    expect(getSellableProducts({})).toEqual([]);
  });
});
