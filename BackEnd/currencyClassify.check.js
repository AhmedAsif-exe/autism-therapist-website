// ponytail: one runnable check for classify + convert math
const assert = require("assert");

const EUROPE = new Set([
  "AL",
  "AD",
  "AT",
  "BY",
  "BE",
  "BA",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IS",
  "IE",
  "IT",
  "XK",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "MD",
  "MC",
  "ME",
  "NL",
  "MK",
  "NO",
  "PL",
  "PT",
  "RO",
  "RU",
  "SM",
  "RS",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "UA",
  "GB",
  "VA",
]);

function classifyCurrency(countryCode) {
  if (!countryCode) return "EUR";
  const cc = countryCode.toUpperCase();
  if (cc === "PK") return "PKR";
  if (EUROPE.has(cc)) return "EUR";
  return "USD";
}

function convert(eur, rate) {
  return Math.round(eur * rate * 10) / 10;
}

assert.strictEqual(classifyCurrency("PK"), "PKR");
assert.strictEqual(classifyCurrency("DE"), "EUR");
assert.strictEqual(classifyCurrency("GB"), "EUR");
assert.strictEqual(classifyCurrency("US"), "USD");
assert.strictEqual(classifyCurrency("AE"), "USD");
assert.strictEqual(convert(10, 300.55), 3005.5);
assert.strictEqual(convert(10, 1.086), 10.9);
console.log("currencyClassify.check.js OK");
