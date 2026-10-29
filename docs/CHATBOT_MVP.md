# Conversational product discovery MVP

## Goal

Add a React chat assistant that searches the storefront catalog through a Python LangGraph API. The assistant returns product cards that link to the existing product detail route (`/:id`).

## Day 1 findings and working decision

- The storefront is a Create React App project.
- Product records are currently defined in `src/productsStore/Store.js`; the project has no product backend or catalog API.
- The current product records include `id`, `name`, `price`, `type`, `primaryImage`, and `hoverImg`. Prices are displayed with `$` in the existing product detail page. Product descriptions, inventory, and availability are not consistently present.
- For this five-day demo, the React app will send its current `store` catalog with each chat request. This keeps the assistant in sync with the catalog currently loaded by the storefront and avoids maintaining a second copy of the data.
- This is live with respect to the storefront's current in-memory catalog, but it is not a connection to a live inventory or commerce service. The assistant must not claim stock, shipping, ingredients, or other details absent from the catalog.
- The catalog source can be replaced with a real commerce API later without changing the chat response shape.

## Proposed architecture

```text
React storefront
  -> Chat widget sends message, recent conversation, and current catalog
       -> Python FastAPI POST /api/chat
            -> LangGraph interprets request and selects matching catalog products
                 -> Returns grounded response and product IDs
                      -> React renders product cards linking to /:id
```

The React app remains in this repository. The Python chatbot backend will live in `backend/` in this repository and use LangGraph. The UI should keep only a bounded recent conversation in browser state for the MVP; server-side persistent user memory is out of scope.

## API contract

### Request

`POST /api/chat`

```json
{
  "message": "Show me a face cleanser under $20",
  "history": [],
  "products": [
    {
      "id": "1",
      "name": "Facial Cleanser",
      "price": 9,
      "type": "bestSeller",
      "primaryImage": "https://example.com/product.jpg",
      "hoverImg": "https://example.com/product-hover.jpg"
    }
  ]
}
```

`history` is an array of `{ "role": "user" | "assistant", "content": "..." }` messages. `products` uses the fields already present in the storefront catalog; `hoverImg` is optional.

### Response

```json
{
  "answer": "Here are a few matching products.",
  "products": [
    {
      "id": "1",
      "name": "Facial Cleanser",
      "price": 9,
      "type": "bestSeller",
      "primaryImage": "https://example.com/product.jpg"
    }
  ]
}
```

The backend returns only products drawn from the request catalog. Product IDs are used by the frontend to build the existing `/:id` product URL. Product matching should honor explicit price constraints deterministically; the language model must not invent product attributes.

## MVP boundaries

- Product discovery and follow-up refinement only.
- No checkout, payment, cart mutation, account data, or persistent memory.
- No claims about current inventory, delivery, ingredients, or suitability unless those fields are later added to the authoritative catalog.
- Keep the API URL and model key configurable; never put secrets in React code.

## Day 1 completion checklist

- [x] Inspected the storefront routes and catalog structure.
- [x] Confirmed there is no commerce API in the copied storefront repository.
- [x] Documented the MVP data source, API contract, architecture, and limitations.
- [ ] Review this contract with the team before the Day 2 implementation.
