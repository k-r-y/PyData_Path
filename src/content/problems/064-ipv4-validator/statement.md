Validate whether a string is a strictly formatted IPv4 address `A.B.C.D`.

Write `is_valid_ipv4(ip: str) -> bool`:
- Exactly 4 dot-separated octets.
- Each octet consists solely of ASCII digits `'0'..'9'`, has numeric value `0..255`, and has **no leading zeros** (so `"0"` is valid, while `"01"` and `"00"` are invalid).
