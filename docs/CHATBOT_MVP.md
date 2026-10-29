# Conversational product discovery MVP

## Goal

Add a React chat assistant that searches the storefront catalog through a Python LangGraph API. The assistant returns product cards that link to the existing product detail route (`/:id`).

## Approved catalog decision

- The storefront is a Create React App project.
- **Source of truth for the five-day MVP:** `store` exported from `src/productsStore/Store.js`. The repository has no product backend, product API, or live commerce integration.
- The storefront currently contains 56 records with unique IDs. Of these, 44 have a product name and price; 12 are `iGPosts` display records and are not products. The chat request includes only records with `id`, `name`, and `price`, excluding `type: "iGPosts"`.
- The React app sends the current catalog subset with every chat request. The Python service does not keep a second product copy or cache the catalog.
- This gives the agent the storefront's current demo catalog at request time. The catalog itself is static source data, so this is **not** live operational inventory or an external commerce feed.
- `descr` and `stars` appear on only some records and are not trusted as searchable product attributes for this MVP. The assistant must not make claims about ingredients, skin suitability, inventory, shipping, or ratings.
- The existing UI displays a dollar sign, but the catalog has no ISO currency code. The API preserves numeric `price`; the UI uses the storefront's existing `$` display. The assistant must not identify the currency as USD or AUD.
- A later commerce API can replace the catalog provider without changing the chat request/response contract below.

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
  "history": [
    { "role": "user", "content": "I need a cleanser" },
    { "role": "assistant", "content": "Do you have a budget in mind?" }
  ],
  "products": [
    {
      "id": "1",
      "name": "Facial Cleanser",
      "price": 9,
      "type": "bestSeller",
      "primaryImage": "https://cdn.example.com/product.jpg"
    }
  ]
}
```

Request rules:

- `message` is required, trimmed, and 1-1000 characters.
- `history` contains at most the 12 most recent messages. Each entry has a `role` of `user` or `assistant` and a `content` string of at most 1000 characters. An empty history is valid.
- `products` contains 0-100 sellable product records from the current storefront catalog. Each record has `id`, `name`, `price`, `type`, and `primaryImage`; `hoverImg` is optional. `price` is a non-negative number. IDs must be unique within the request. An empty array is valid and produces a no-products response.
- The client omits Instagram display records and does not send `descr` or `stars` in the MVP.

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

The backend returns only products drawn from the request catalog. Product IDs are used by the frontend to build the existing `/:id` product URL. Each product result includes `id`, `name`, `price`, `type`, and `primaryImage`. If there are no matches, return an explanatory `answer` and an empty `products` array. Product matching must honor explicit price constraints deterministically; the language model must not invent product attributes or currency codes.

### Response status behavior

- `200`: valid request, including searches that return zero matches.
- `400`: malformed JSON or an invalid/missing chat message.
- `413`: request exceeds the configured body size limit.
- `500`: unexpected model or server failure; do not return secrets or stack traces.

## MVP boundaries

- Product discovery and follow-up refinement only.
- No checkout, payment, cart mutation, account data, or persistent memory.
- No claims about current inventory, delivery, ingredients, or suitability unless those fields are later added to the authoritative catalog.
- Keep the API URL and model key configurable; never put secrets in React code.

## Day 1 completion checklist

- [x] Inspected the storefront routes and catalog structure.
- [x] Confirmed there is no commerce API in the copied storefront repository.
- [x] Counted and inspected the current product records; excluded Instagram display records from the product-search contract.
- [x] Finalized the MVP data source, product fields, API contract, and limitations with the project lead.
