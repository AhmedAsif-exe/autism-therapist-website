import { useProjectContext } from "Utils/Context";
import { initiateCheckoutSession } from "Utils/Queries/Checkout";
import { IconButton, Badge, Menu } from "@mui/material";
import { useState } from "react";
import { ShoppingCart, Delete } from "@mui/icons-material";
import paypal from "Assets/Icons/paypal.png";
export default function CartDrawer() {
  const { cart, dispatch, user } = useProjectContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

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
          onClick={handleClick}
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
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        PaperProps={{
          className:
            "rounded-2xl border border-gray-200 shadow-2xl bg-gradient-to-br from-white to-slate-50 w-[280px]",
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
                    €{item.price?.toFixed(2) ?? "0.00"}
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
              Total: <span className="text-gray-900">€{total.toFixed(2)}</span>
            </p>

            <div className="mt-3 flex flex-col gap-2">
              <button
                className="w-full bg-[#f9644d] text-white py-2 rounded-lg font-medium hover:bg-[#e25640] transition-all"
                onClick={async () =>
                  await initiateCheckoutSession(cart, user, "stripe")
                }
              >
                Checkout
              </button>
              <button
                onClick={async () =>
                  await initiateCheckoutSession(cart, user, "paypal")
                }
                className="w-full flex items-center justify-center gap-2 bg-[#FFC439] hover:bg-[#f0b933] text-[#003087] font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <img src={paypal} alt="PayPal" className="w-5 h-5" />
                Checkout with PayPal
              </button>
            </div>
          </div>
        </div>
      </Menu>
    </>
  );
}
