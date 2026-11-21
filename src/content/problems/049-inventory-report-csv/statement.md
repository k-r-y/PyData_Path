Given raw CSV content string `csv_text` with columns `sku`, `category`, `units`, and `unit_price` (in any header order), compute total inventory value per `category`.

Write `summarize_inventory_csv(csv_text: str) -> dict[str, float]` returning each category mapped to `round(sum(units * unit_price), 2)`.

### Requirements
- Handle quoted fields containing commas (e.g. `"Office, Supplies"`).
- Handle arbitrary column order matching header names cleanly.
- Skip blank lines cleanly and return `{}` if there are no data rows.
