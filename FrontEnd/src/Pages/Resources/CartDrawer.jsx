import {
  useProjectContext,
  formatPrice,
  formatAmount,
  convertPrice,
} from "Utils/Context";
import { initiateCheckoutSession } from "Utils/Queries/Checkout";
import { IconButton, Badge, Menu, CircularProgress } from "@mui/material";
import { useState } from "react";
import { ShoppingCart, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "axiosInstance";

/** Mirrors the server's check so users get told before a round trip. */
function isValidPkMobile(input) {
  const digits = String(input || "").replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("0092")) local = local.slice(4);
  else if (local.startsWith("92")) local = local.slice(2);
  if (local.startsWith("0")) local = local.slice(1);
  return /^3\d{9}$/.test(local);
}

export default function CartDrawer() {
  const { cart, dispatch, loggedIn, currency, rate } = useProjectContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobile, setMobile] = useState("");
  const [busy, setBusy] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Sum per-line rounded display amounts.
  const totalDisplay = cart.reduce(
    (sum, item) => sum + convertPrice(item.price, rate),
    0,
  );

  // PayFast settles in PKR, so that is what the card is actually billed —
  // show it explicitly rather than letting the euro price imply otherwise.
  const [pkrRate, setPkrRate] = useState(null);
  const eurTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const pkrTotal = pkrRate ? Math.round(eurTotal * pkrRate) : null;

  const loadPkrRate = async () => {
    if (pkrRate !== null) return;
    try {
      const { data } = await api.get("/paypal/currency", {
        params: { country: "PK" },
      });
      if (data?.currency === "PKR" && Number(data.rate) > 0) {
        setPkrRate(Number(data.rate));
      }
    } catch {
      /* disclosure is best-effort; the server still charges the correct amount */
    }
  };

  const handleCheckout = async () => {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    if (!isValidPkMobile(mobile)) {
      toast.error("Enter a valid mobile number, e.g. 03001234567");
      return;
    }
    setBusy(true);
    try {
      await initiateCheckoutSession(cart, {
        mobile,
        currency,
        displayAmount: totalDisplay,
      });
      // On success the browser is navigating to PayFast; nothing follows.
    } catch (err) {
      setBusy(false);
      const message =
        err.response?.data?.error || "Could not start checkout. Please retry.";
      toast.error(message);
    }
  };

  if (cart.length === 0) {
    if (anchorEl !== null) setAnchorEl(null);
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <IconButton
          aria-label="cart"
          onClick={(e) => {
            handleClick(e);
            loadPkrRate();
          }}
          className="bg-white shadow-md hover:shadow-lg rounded-full transition-all duration-300"
        >
          <Badge badgeContent={cart.length} max={10} color="info">
            <ShoppingCart sx={{ color: "#f9644d" }} fontSize="large" />
          </Badge>
        </IconButton>
      </div>

      {/* Dropdown Cart Menu */}
      <Menu
        open={open && anchorEl !== null && cart.length > 0}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        PaperProps={{
          className:
            "rounded-2xl border border-gray-200 shadow-2xl bg-gradient-to-br from-white to-slate-50 w-[320px]",
        }}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            🛒 Your Cart
          </h2>

          <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-2 text-gray-700"
              >
                <div className="flex-1 mr-2">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatPrice(item.price, currency, rate)}
                  </p>
                </div>
                <IconButton
                  size="small"
                  onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                  className="hover:bg-red-100"
                >
                  <Delete fontSize="small" sx={{ color: "#d33" }} />
                </IconButton>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <p className="text-right font-semibold text-gray-700">
              Total:{" "}
              <span className="text-gray-900">
                {formatAmount(totalDisplay, currency)}
              </span>
            </p>

            {/* PayFast needs a mobile number; the cart never collected one. */}
            <label
              htmlFor="payfast-mobile"
              className="block mt-3 text-xs font-medium text-gray-600"
            >
              Mobile number
            </label>
            <input
              id="payfast-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="03001234567"
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#45B4B3]"
            />

            <div className="mt-3">
              <button
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-[#f9644d] text-white py-2.5 rounded-lg font-medium hover:bg-[#e25640] transition-all disabled:opacity-60"
                onClick={handleCheckout}
              >
                {busy ? (
                  <>
                    <CircularProgress size={16} sx={{ color: "white" }} />
                    Redirecting…
                  </>
                ) : (
                  "Pay with PayFast"
                )}
              </button>

              {pkrTotal !== null && (
                <p className="mt-2 text-[11px] leading-snug text-gray-500 text-center">
                  You will be charged{" "}
                  <span className="font-semibold text-gray-700">
                    Rs {pkrTotal.toLocaleString()}
                  </span>
                  . Cards are billed in PKR by PayFast.
                </p>
              )}
              <p className="mt-1 text-[11px] text-gray-400 text-center">
                Secure payment via PayFast — cards, wallets &amp; bank accounts
              </p>
            </div>
          </div>
        </div>
      </Menu>
    </>
  );
}
