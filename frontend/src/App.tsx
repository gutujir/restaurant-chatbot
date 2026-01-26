import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

type MenuItem = {
  code: number;
  name: string;
  price: number;
  description?: string;
};

type OrderItem = {
  item: { name: string; price: number } | string;
  qty: number;
};

type CurrentOrder = {
  items: OrderItem[];
  total: number;
  status: string;
  reference?: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const baseOptions = [
  "Select 1 to Place an order",
  "Select 99 to checkout order",
  "Select 98 to see order history",
  "Select 97 to see current order",
  "Select 0 to cancel order",
];

const formatOptions = () => baseOptions.join("\n");

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "bot",
      text: `Welcome to the Restaurant ChatBot!\n${formatOptions()}`,
    },
  ]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<CurrentOrder | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [paymentRef, setPaymentRef] = useState<string | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "paid"
  >("idle");
  const listRef = useRef<HTMLDivElement>(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
    }),
    [],
  );

  const appendMessage = (msg: ChatMessage) =>
    setMessages((prev) => [...prev, msg]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API_URL}/api/menu`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMenu(data.menu || []);
      }
    } catch {
      console.error("Failed to fetch menu");
    }
  };

  const verifyPaymentByRef = useCallback(async (reference: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/pay/verify?reference=${reference}`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data?.status === "paid") {
        setPaymentStatus("paid");
        appendMessage({
          id: crypto.randomUUID(),
          role: "bot",
          text: "🎉 Payment verified successfully! Your order has been confirmed.",
        });
        // Refresh current order to show updated status
        setTimeout(() => sendInput("97"), 500);
      } else {
        appendMessage({
          id: crypto.randomUUID(),
          role: "bot",
          text: data?.message || "Payment not completed",
        });
      }
    } catch {
      appendMessage({
        id: crypto.randomUUID(),
        role: "bot",
        text: "Verification failed.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMenu();
    // Check if returning from payment
    const urlParams = new URLSearchParams(window.location.search);
    const paid = urlParams.get("paid");
    const ref = urlParams.get("ref");
    if (paid === "1" && ref) {
      setPaymentRef(ref);
      // Auto-verify payment
      setTimeout(() => {
        verifyPaymentByRef(ref);
      }, 1000);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [verifyPaymentByRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendInput = async (value: string) => {
    const trimmed = value.trim();
    if (!/^[0-9]+$/.test(trimmed)) {
      appendMessage({
        id: crypto.randomUUID(),
        role: "bot",
        text: "Please enter numbers only.",
      });
      return;
    }
    setInput("");
    appendMessage({ id: crypto.randomUUID(), role: "user", text: trimmed });
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ input: trimmed }),
      });
      const data = await res.json();
      if (data?.current) setCurrentOrder(data.current);
      if (data?.history) setHistory(data.history);
      if (data?.reference) setPaymentRef(data.reference);
      appendMessage({
        id: crypto.randomUUID(),
        role: "bot",
        text: data?.message || "Done",
      });
      if (data?.menu) setMenu(data.menu);

      // Auto-refresh current order after adding an item (codes 10+)
      const inputNum = parseInt(trimmed, 10);
      if (inputNum >= 10 && inputNum < 99 && data?.current) {
        // Item was added, current order already updated
      }
    } catch {
      appendMessage({
        id: crypto.randomUUID(),
        role: "bot",
        text: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    await sendInput("99");
  };

  const startPayment = async () => {
    if (!paymentRef) return;
    setPaymentStatus("pending");
    try {
      const res = await fetch(`${API_URL}/api/pay/init`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ reference: paymentRef }),
      });
      const data = await res.json();
      if (data?.authorizationUrl) {
        window.open(data.authorizationUrl, "_blank");
      } else {
        appendMessage({
          id: crypto.randomUUID(),
          role: "bot",
          text: data?.message || "Unable to start payment",
        });
      }
    } catch {
      appendMessage({
        id: crypto.randomUUID(),
        role: "bot",
        text: "Payment init failed.",
      });
    }
  };

  const verifyPayment = async () => {
    if (!paymentRef) return;
    try {
      const res = await fetch(
        `${API_URL}/api/pay/verify?reference=${paymentRef}`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data?.status === "paid") {
        setPaymentStatus("paid");
        appendMessage({
          id: crypto.randomUUID(),
          role: "bot",
          text: "Payment verified successfully.",
        });
      } else {
        appendMessage({
          id: crypto.randomUUID(),
          role: "bot",
          text: data?.message || "Payment not completed",
        });
      }
    } catch {
      appendMessage({
        id: crypto.randomUUID(),
        role: "bot",
        text: "Verification failed.",
      });
    }
  };

  const quickActions = [
    { label: "Menu", value: "1" },
    { label: "Current", value: "97" },
    { label: "History", value: "98" },
    { label: "Checkout", value: "99" },
    { label: "Cancel", value: "0" },
  ];

  const renderOrderItems = (items: OrderItem[]) => (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between text-sm text-slate-100/90"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {typeof it.item === "string" ? it.item : it.item.name}
            </span>
            <span className="text-slate-400">x{it.qty}</span>
          </div>
          <span className="text-slate-200">
            ₦{typeof it.item === "string" ? "-" : it.item.price * it.qty}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-indigo-300">
                Restaurant ChatBot
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Order assistant
              </h1>
            </div>
            <div className="flex gap-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.value}
                  onClick={() => sendInput(qa.value)}
                  className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-500 text-white transition"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="h-[60vh] sm:h-[65vh] overflow-y-auto pr-2 scrollbar"
            ref={listRef}
          >
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-white/10 text-slate-100 border border-white/10"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input && !loading) sendInput(input);
              }}
              className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type a number (e.g. 1 for menu)"
            />
            <button
              onClick={() => sendInput(input)}
              disabled={!input || loading}
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send"
              )}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            {quickActions.map((qa) => (
              <button
                key={qa.value}
                onClick={() => sendInput(qa.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-500 text-white transition"
              >
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={fetchMenu}
                className="text-xs text-indigo-300 hover:text-indigo-100"
              >
                refresh
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar pr-1">
              {menu.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.code}. {item.name}
                    </p>
                    <p className="text-xs text-slate-400">₦{item.price}</p>
                  </div>
                  <button
                    onClick={() => sendInput(String(item.code))}
                    className="text-xs px-3 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
                  >
                    Add
                  </button>
                </div>
              ))}
              {menu.length === 0 && (
                <p className="text-sm text-slate-400">No menu items yet.</p>
              )}
            </div>
          </div>

          <div className="glass rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Current Order
              </h2>
              <button
                onClick={() => sendInput("97")}
                className="text-xs text-indigo-300 hover:text-indigo-100"
              >
                refresh
              </button>
            </div>
            {currentOrder && currentOrder.items?.length ? (
              <>
                {renderOrderItems(currentOrder.items)}
                <div className="flex items-center justify-between text-sm text-white pt-2">
                  <span>Total</span>
                  <span className="font-semibold">₦{currentOrder.total}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCheckout}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500"
                  >
                    Checkout (99)
                  </button>
                  <button
                    onClick={() => sendInput("0")}
                    className="px-3 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500"
                  >
                    Cancel (0)
                  </button>
                </div>
                {paymentRef && currentOrder.status !== "paid" && (
                  <div className="pt-2 space-y-2">
                    <p className="text-xs text-slate-300">
                      Reference: {paymentRef}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={startPayment}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
                        disabled={paymentStatus === "paid"}
                      >
                        Pay with Paystack
                      </button>
                      <button
                        onClick={verifyPayment}
                        className="px-3 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20"
                      >
                        Verify payment
                      </button>
                    </div>
                  </div>
                )}
                {paymentStatus === "paid" && (
                  <p className="text-xs text-emerald-300">Payment confirmed.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">
                No items in your order yet.
              </p>
            )}
          </div>

          <div className="glass rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">History</h2>
              <button
                onClick={() => sendInput("98")}
                className="text-xs text-indigo-300 hover:text-indigo-100"
              >
                refresh
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar pr-1">
              {history && history.length ? (
                history.map((order: any) => (
                  <div
                    key={order._id}
                    className="bg-white/5 border border-white/5 rounded-2xl px-3 py-2 text-sm text-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <span>Ref: {order.reference || order._id}</span>
                      <span className="uppercase text-xs text-slate-400">
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      ₦{order.total} •{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No past orders.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
