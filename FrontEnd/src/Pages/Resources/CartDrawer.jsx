import { useProjectContext } from "Utils/Context";
import { initiateCheckoutSession } from "Utils/Queries/Checkout";
import { IconButton, Badge, Menu } from "@mui/material";
import { useState } from "react";
import { ShoppingCart } from "@mui/icons-material";
export default function CartDrawer() {
  const { cart, dispatch, user } = useProjectContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Don't render the cart if there are no items
  if (cart.length === 0) {
    // If the cart is emptied, also reset anchorEl to ensure Menu never opens automatically
    if (anchorEl !== null) setAnchorEl(null);
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4">
        <IconButton aria-label="cart" onClick={handleClick}>
          <Badge badgeContent={cart?.length} max={10} color="info">
            <ShoppingCart sx={{ color: "#265c7e" }} fontSize="large" />
          </Badge>
        </IconButton>
      </div>
      <Menu 
        open={open && anchorEl !== null && cart.length > 0} 
        onClose={handleClose} 
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <div className="w-[250px] bg-white shadow-lg p-4 rounded-xl border">
          <h2 className="text-xl font-bold mb-2">Your Cart</h2>
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between py-1">
                <span>{item.title}</span>
                <button
                  onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold">Total: ${total}</p>
          <button
            className="mt-2 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            onClick={async () => await initiateCheckoutSession(cart, user)}
          >
            Checkout
          </button>
        </div>
      </Menu>
    </>
  );
}
