import { useEffect, useState } from "react";
import { COURSE_TEMPLATES } from "../data/courses";

const STORAGE_KEY = "handymemo_adjustments";

const TimerManager = ({ orders }) => {
  const [now, setNow] = useState(Date.now());
  const [adjustments, setAdjustments] = useState({});

  // ⏰ 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 💾 初期読み込み（localStorage）
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAdjustments(JSON.parse(saved));
    }
  }, []);

  // 💾 自動保存（localStorage）
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adjustments));
  }, [adjustments]);

  // 🔧 オフセット取得（調整反映）
  const getAdjustedOffset = (seat, stepName, originalOffset) => {
    const key = `${seat}_${stepName}`;
    return originalOffset + (adjustments[key] || 0);
  };

  // 🔧 オフセット調整（±分）
  const adjustOffset = (seat, stepName, delta) => {
    const key = `${seat}_${stepName}`;
    setAdjustments((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + delta
    }));
  };

  // 📊 ステータス計算
  const getStatus = (startTime, offsetMin) => {
    const elapsedMin = (now - new Date(startTime)) / 60000;
    if (elapsedMin >= offsetMin) {
      return "🔔 通知済";
    } else {
      const remaining = Math.ceil(offsetMin - elapsedMin);
      return `⏳ あと ${remaining} 分`;
    }
  };

  return (
    <div className="p-4 mt-4 border rounded-md shadow-md bg-white">
      <h2 className="text-lg font-bold mb-2">⏰ タイマー管理</h2>
      {orders.length === 0 && (
        <p className="text-gray-500">現在アクティブな注文はありません</p>
      )}

      {orders.map((order, index) => {
        const course = COURSE_TEMPLATES[order.courseName];
        if (!course) return null;

        return (
          <div key={index} className="mb-4 border-t pt-2">
            <p className="font-semibold mb-1">
              🪑 席: {order.seatNumber} / コース: {order.courseName}
            </p>

            {course.map((step, i) => {
              const adjOffset = getAdjustedOffset(
                order.seatNumber,
                step.name,
                step.offsetMin
              );
              const status = getStatus(order.timestamp, adjOffset);

              return (
                <div
                  key={i}
                  className={`text-sm pl-2 py-0.5 flex items-center justify-between ${
                    status.includes("通知済")
                      ? "text-green-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <div>
                    ・{step.name}：{status}（{adjOffset}分後）
                  </div>
                  <div className="flex gap-1 text-xs">
                    <button
                      onClick={() =>
                        adjustOffset(order.seatNumber, step.name, -5)
                      }
                      className="bg-gray-300 px-2 rounded"
                    >
                      -5分
                    </button>
                    <button
                      onClick={() =>
                        adjustOffset(order.seatNumber, step.name, 5)
                      }
                      className="bg-gray-300 px-2 rounded"
                    >
                      +5分
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default TimerManager;
