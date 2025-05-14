import { useState, useEffect } from "react";
import OrderForm from "./components/OrderForm";
import TimerManager from "./components/TimerManager";
import { COURSE_TEMPLATES } from "./data/courses";

const STORAGE_KEY = "handymemo_orders";

function App() {
  const [orders, setOrders] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); // 編集中の注文番号

  // 初回 localStorage 読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  // 注文を保存するたび localStorage に保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // 新規登録
  const handleOrderSubmit = (orderData) => {
    setOrders((prev) => [...prev, orderData]);
  };

  // 編集ボタンが押されたとき
  const handleEditOrder = (index) => {
    setEditingIndex(index);
  };

  // 編集完了時に上書き保存
  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((order, idx) => (idx === editingIndex ? updatedOrder : order))
    );
    setEditingIndex(null); // 編集終了
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <div className="max-w-md mx-auto mt-4 space-y-6">
      <OrderForm
        onOrderSubmit={
          editingIndex === null ? handleOrderSubmit : handleOrderUpdate
        }
        initialData={editingIndex !== null ? orders[editingIndex] : null}
        onCancelEdit={editingIndex !== null ? handleCancelEdit : null}
      />

      <TimerManager orders={orders} />

      {/* 注文リスト表示 */}
      <div className="p-4 border rounded-md bg-white shadow">
        <h2 className="text-lg font-bold mb-2">🧾 登録済みの注文</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">まだ注文がありません</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="mb-4 border-b pb-2 flex flex-col gap-1 relative"
            >
              <p>🪑 席番号: {order.seatNumber}</p>
              <p>🍽 コース: {order.courseName || "なし"}</p>
              <p>📝 備考: {order.memo || "なし"}</p>
              <ul className="pl-4 mt-1 list-disc text-sm">
                {Object.entries(order.orderItems).map(([item, count]) => (
                  <li key={item}>
                    {item} × {count}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-1">
                登録時間: {new Date(order.timestamp).toLocaleTimeString()}
              </p>

              {/* 編集ボタン */}
              <button
                onClick={() => handleEditOrder(index)}
                className="absolute right-2 top-2 text-blue-600 text-sm underline"
              >
                編集
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
