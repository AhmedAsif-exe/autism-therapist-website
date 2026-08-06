// PayFast (gopayfast.com, Pakistan) gateway client.
//
// NOTE: this is the Pakistani PayFast operated by APPS, NOT the unrelated South
// African payfast.co.za. Their APIs share nothing — do not mix reference code.
//
// We use the hosted Web Checkout: the customer enters card details on PayFast's
// own page, so card data never reaches this server and we stay at PCI SAQ A.

const crypto = require("crypto");

const HOSTS = {
  sandbox: "https://ipguat.apps.net.pk",
  live: "https://ipg1.apps.net.pk",
};

/**
 * Sandbox and live credentials are read from separate variables so that
 * flipping PAYFAST_ENV can never pair one environment's keys with the other's
 * host.
 *
 * Live deliberately has NO fallback to the unprefixed names: those currently
 * hold sandbox values, and falling back would aim test credentials at the live
 * host — the exact mismatch this split exists to prevent. Sandbox keeps the
 * fallback because getting it wrong there costs nothing.
 */
function payfastConfig() {
  const env = (process.env.PAYFAST_ENV || "sandbox").toLowerCase();
  if (!HOSTS[env]) {
    throw new Error(`PAYFAST_ENV must be "sandbox" or "live" (got "${env}")`);
  }

  let merchantId;
  let securedKey;
  if (env === "live") {
    merchantId = process.env.PAYFAST_LIVE_MERCHANT_ID;
    securedKey = process.env.PAYFAST_LIVE_SECURED_KEY;
  } else {
    merchantId =
      process.env.PAYFAST_SANDBOX_MERCHANT_ID || process.env.PAYFAST_MERCHANT_ID;
    securedKey =
      process.env.PAYFAST_SANDBOX_SECURED_KEY || process.env.PAYFAST_SECURED_KEY;
  }

  if (!merchantId || !securedKey) {
    const prefix = env === "live" ? "PAYFAST_LIVE_" : "PAYFAST_SANDBOX_";
    throw new Error(
      `Missing PayFast credentials for env "${env}": set ${prefix}MERCHANT_ID and ${prefix}SECURED_KEY`,
    );
  }

  return {
    env,
    baseUrl: `${HOSTS[env]}/Ecommerce/api/Transaction`,
    merchantId: String(merchantId),
    securedKey: String(securedKey),
    merchantName: process.env.PAYFAST_MERCHANT_NAME || "Aba Virtual",
    // STORE_ID identifies a store/terminal/outlet and is issued by PayFast —
    // it is NOT the merchant id (sending 14833 returns err_code 005 "Store ID
    // is invalid"). PayFast's own plugin defaults it to empty, so an account
    // without terminals sends nothing. Default to empty rather than guessing.
    storeId: String(process.env.PAYFAST_STORE_ID ?? ""),
  };
}

/**
 * Exchange merchant credentials for a short-lived ACCESS_TOKEN.
 *
 * Verified against sandbox: responds
 *   {"MERCHANT_ID":..,"ACCESS_TOKEN":"..","NAME":"..","GENERATED_DATE_TIME":".."}
 *
 * The response carries no expiry and the token may be single-use, so callers
 * should fetch one per checkout rather than caching it.
 */
async function getAccessToken(
  config = payfastConfig(),
  { amount, basketId, currency = "PKR" } = {},
) {
  const params = {
    MERCHANT_ID: config.merchantId,
    SECURED_KEY: config.securedKey,
  };
  // Live is stricter than sandbox: it rejects a token request without all three
  // of these ("003 Amount , Basket Id and Currency code must be required"),
  // while sandbox issues a token from credentials alone. Note PayFast's own
  // plugin omits CURRENCY_CODE here — following it would fail in production.
  if (amount !== undefined) params.TXNAMT = formatAmount(amount);
  if (basketId) params.BASKET_ID = basketId;
  if (currency) params.CURRENCY_CODE = currency;

  const res = await fetch(`${config.baseUrl}/GetAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PayFast token HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // A non-JSON body here usually means the request reached an IIS error page
    // rather than the API — surface a snippet so the cause is visible.
    throw new Error(`PayFast token returned non-JSON: ${text.slice(0, 200)}`);
  }

  if (!data.ACCESS_TOKEN) {
    throw new Error(`PayFast token missing: ${JSON.stringify(data).slice(0, 300)}`);
  }

  return {
    token: data.ACCESS_TOKEN,
    generatedAt: data.GENERATED_DATE_TIME || null,
  };
}

const formatAmount = (n) => Number(n).toFixed(2);

/** PayFast expects `Y-m-d H:i:s`. */
function formatOrderDate(date = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ` +
    `${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
  );
}

/**
 * Fields for the auto-submitting form POST to /PostTransaction.
 *
 * SIGNATURE is included because PayFast's plugin sends it, but note what it
 * actually is there: `hash('sha256', $order->get_id())` — a hash of a public
 * value with no secret. It authenticates nothing and must not be treated as a
 * security control. Callback authenticity comes from `validation_hash` instead
 * (see verifyValidationHash).
 */
function buildCheckoutFields({
  config = payfastConfig(),
  token,
  basketId,
  amount,
  currency = "PKR",
  description,
  customerEmail,
  customerMobile,
  successUrl,
  failureUrl,
  checkoutUrl,
  orderDate = formatOrderDate(),
}) {
  return {
    MERCHANT_ID: config.merchantId,
    MERCHANT_NAME: config.merchantName,
    TOKEN: token,
    PROCCODE: "00",
    TXNAMT: formatAmount(amount),
    CUSTOMER_MOBILE_NO: customerMobile || "",
    CUSTOMER_EMAIL_ADDRESS: customerEmail || "",
    SIGNATURE: crypto.createHash("sha256").update(String(basketId)).digest("hex"),
    PLUGIN_VERSION: "ABAVIRTUAL-NODE-1.0",
    TXNDESC: description || "Purchase from Aba Virtual",
    SUCCESS_URL: encodeURIComponent(successUrl),
    FAILURE_URL: encodeURIComponent(failureUrl),
    BASKET_ID: basketId,
    ORDER_DATE: orderDate,
    CHECKOUT_URL: encodeURIComponent(checkoutUrl),
    TRAN_TYPE: "ECOMM_PURCHASE",
    STORE_ID: config.storeId,
    CURRENCY_CODE: currency,
  };
}

/**
 * Authenticate a PayFast callback.
 *
 * PayFast returns validation_hash = sha256(basket_id|SECURED_KEY|MERCHANT_ID|err_code).
 * The shared secret in the middle is what makes it unforgeable, so this is the
 * ONLY thing that may be trusted before granting a purchase. Verified identical
 * across PayFast's WooCommerce 3 and 8 plugins.
 */
function verifyValidationHash(
  { validationHash, basketId, errCode },
  config = payfastConfig(),
) {
  if (!validationHash) return false;
  const protocol = `${basketId}|${config.securedKey}|${config.merchantId}|${errCode}`;
  const expected = crypto.createHash("sha256").update(protocol).digest("hex");
  // Constant-time compare so a mismatch can't be probed byte-by-byte.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(validationHash).trim().toLowerCase(), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// PayFast signals success as "000" — NOT the "00" listed in the published error
// table. Their own plugin checks "000"; trusting the docs fails every payment.
const SUCCESS_CODE = "000";

module.exports = {
  payfastConfig,
  getAccessToken,
  buildCheckoutFields,
  verifyValidationHash,
  formatOrderDate,
  SUCCESS_CODE,
  HOSTS,
};
