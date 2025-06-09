import { useProjectContext } from "Utils/Context";
import { initiateCheckoutSession } from "Utils/Queries/Checkout";
export default function CartDrawer() {
  const { cart, dispatch, user } = useProjectContext();

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg p-4 rounded-xl border">
      <h2 className="text-xl font-bold mb-2">Your Cart</h2>
      {cart.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id} className="flex justify-between py-1">
              <span>{item.title}</span>
              <button onClick={() => dispatch({ type: "REMOVE", id: item.id })}>
                ❌
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 font-bold">Total: ${total}</p>
      <button
        className="mt-2 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        onClick={async () => await initiateCheckoutSession(cart, user)}
      >
        Checkout
      </button>
    </div>
  );
}
