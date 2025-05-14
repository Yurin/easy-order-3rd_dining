import { useState, useEffect } from "react";
import { COURSE_TEMPLATES } from "../data/courses";
import { MENU_ITEMS } from "../data/menudata";

// カテゴリの整理
const RAW_CATEGORIES = Object.keys(MENU_ITEMS);
const DISPLAY_CATEGORIES = RAW_CATEGORIES.map((cat) =>
  cat.startsWith("ドリンク_") ? "ドリンク" : cat
);
const UNIQUE_DISPLAY_CATEGORIES = [...new Set(DISPLAY_CATEGORIES)];

const OrderForm = ({ onOrderSubmit, initialData, onCancelEdit }) => {
  const [seatNumber, setSeatNumber] = useState("");
  const [courseName, setCourseName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(UNIQUE_DISPLAY_CATEGORIES[0]);
  const [orderItems, setOrderItems] = useState({});
  const [memo, setMemo] = useState("");

  const [optionTarget, setOptionTarget] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");

  // フォーム初期化（新規・編集）
  useEffect(() => {
    if (initialData) {
      setSeatNumber(initialData.seatNumber || "");
      setCourseName(initialData.courseName || "");
      setOrderItems(initialData.orderItems || {});
      setMemo(initialData.memo || "");
    } else {
      setSeatNumber("");
      setCourseName("");
      setOrderItems({});
      setMemo("");
    }
  }, [initialData]);

  const incrementItem = (itemName) => {
    setOrderItems((prev) => {
      const current = prev[itemName] || 0;
      return { ...prev, [itemName]: current + 1 };
    });
  };

  const decrementItem = (itemName) => {
    setOrderItems((prev) => {
      const current = prev[itemName] || 0;
      const newCount = Math.max(0, current - 1);
      const updated = { ...prev, [itemName]: newCount };
      if (newCount === 0) delete updated[itemName];
      return updated;
    });
  };

  const handleOptionSelect = (item) => {
    if (item.options) {
      setOptionTarget(item);
      setSelectedOption(item.options[0]);
    } else {
      // 通常商品：カウントを増やす
      incrementItem(item.name);
    }
  };

  const confirmOption = () => {
    const fullName = `${optionTarget.name} (${selectedOption})`;
    incrementItem(fullName);
    setOptionTarget(null);
    setSelectedOption("");
  };

  const handleSubmit = () => {
    const orderData = {
      seatNumber,
      courseName,
      orderItems,
      memo,
      timestamp: initialData?.timestamp || new Date().toISOString()
    };
    onOrderSubmit(orderData);
    if (!initialData) {
      setSeatNumber("");
      setCourseName("");
      setOrderItems({});
      setMemo("");
    }
  };

    

  return (
    <div className="p-4 border rounded-md shadow-md bg-white relative">
      <h2 className="text-lg font-bold mb-2">
        {initialData ? "✏️ 注文を編集" : "📝 新規オーダー入力"}
      </h2>

      {/* 席番号 */}
      <div className="mb-2">
        <label className="block text-sm font-semibold">席番号</label>
        <input
          type="text"
          value={seatNumber}
          onChange={(e) => setSeatNumber(e.target.value)}
          className="border px-2 py-1 w-full rounded"
        />
      </div>

      {/* コース選択 */}
      <div className="mb-2">
        <label className="block text-sm font-semibold">コース選択</label>
        <select
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="border px-2 py-1 w-full rounded"
        >
          <option value="">-- 未選択 --</option>
          {Object.keys(COURSE_TEMPLATES).map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {/* カテゴリタブ */}
      <div className="mb-2">
        <div className="flex gap-2 mb-1 flex-wrap">
          {UNIQUE_DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded ${
                selectedCategory === cat ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 商品リスト */}
        <div className="grid grid-cols-2 gap-2">
          {RAW_CATEGORIES.filter((cat) =>
            selectedCategory === "ドリンク"
              ? cat.startsWith("ドリンク_")
              : cat === selectedCategory
          )
            .flatMap((cat) => MENU_ITEMS[cat])
            .map((item) => {
              const isOptionItem = !!item.options;
              const count = isOptionItem
                ? 0
                : orderItems[item.name] || 0;

              return (
                <div
                  key={item.name}
                  className="bg-yellow-100 border rounded px-2 py-1 text-left hover:bg-green-200"
                >
                  <div
                    onClick={() => handleOptionSelect(item)}
                    className="cursor-pointer"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      ¥{item.price} {item.options && "（オプションあり）"}
                    </div>
                  </div>

                  {/* 通常商品のみ＋−ボタン表示 */}
                  {!isOptionItem && (
                    <div className="flex items-center mt-1 gap-2">
                      <button
                        onClick={() => decrementItem(item.name)}
                        className="bg-red-400 text-white rounded px-2"
                      >
                        －
                      </button>
                      <span>{count}</span>
                      <button
                        onClick={() => incrementItem(item.name)}
                        className="bg-blue-500 text-white rounded px-2"
                      >
                        ＋
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* 備考欄 */}
      <div className="mb-2">
        <label className="block text-sm font-semibold">備考</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="border px-2 py-1 w-full rounded"
        />
      </div>

      {/* ボタン */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
        >
          {initialData ? "保存する" : "登録する"}
        </button>

        {initialData && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="text-sm text-gray-600 underline w-full"
          >
            編集をキャンセル
          </button>
        )}
      </div>

      {/* オプション選択モーダル */}
      {optionTarget && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center z-10">
          <div className="bg-white p-4 rounded shadow-md w-72">
            <p className="font-bold mb-2">{optionTarget.name} のオプションを選択</p>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="border px-2 py-1 w-full rounded mb-2"
            >
              {optionTarget.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button
              onClick={confirmOption}
              className="bg-blue-500 text-white px-4 py-1 rounded w-full"
            >
              追加する
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
