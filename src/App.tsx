/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Cookie, Trash2, CheckCircle, Plus, Minus, ShoppingCart, Receipt, FileSpreadsheet, X } from 'lucide-react';

// Types
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: 'drink' | 'snack';
};

type OrderItem = MenuItem & {
  quantity: number;
};

type Order = {
  id: number;
  items: OrderItem[];
  total: number;
  timestamp: Date;
};

const MENU_ITEMS: MenuItem[] = [
  { id: 'd1', name: '貝多芬的憤怒', price: 50, category: 'drink' },
  { id: 'd2', name: '柴可夫斯基的眼淚', price: 50, category: 'drink' },
  { id: 'd3', name: '韋瓦第的春天', price: 50, category: 'drink' },
  { id: 'd4', name: '莫札特的微笑', price: 50, category: 'drink' },
  { id: 's1', name: '聖桑的動物狂歡熱狗', price: 40, category: 'snack' },
  { id: 's2', name: '德布西的印象甘草芭樂', price: 50, category: 'snack' },
];

export default function App() {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orderQueue, setOrderQueue] = useState<Order[]>([]);
  const [salesHistory, setSalesHistory] = useState<Order[]>([]);
  const [orderCounter, setOrderCounter] = useState(1);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [showReport, setShowReport] = useState(false);

  const getQty = (id: string) => itemQuantities[id] || 1;
  const setQty = (id: string, delta: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const qty = getQty(item.id);
    setCurrentOrder((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    // Reset quantity back to 1 after adding
    setItemQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCurrentOrder((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const newQuantity = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQuantity };
        }
        return i;
      })
    );
  };

  const currentTotal = currentOrder.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const submitOrder = () => {
    if (currentOrder.length === 0) return;

    const newOrder: Order = {
      id: orderCounter,
      items: [...currentOrder],
      total: currentTotal,
      timestamp: new Date(),
    };

    setOrderQueue((prev) => [...prev, newOrder]);
    setSalesHistory((prev) => [...prev, newOrder]);
    setOrderCounter((prev) => prev + 1);
    setCurrentOrder([]);
  };

  const completeOrder = (orderId: number) => {
    setOrderQueue((prev) => prev.filter((o) => o.id !== orderId));
  };

  const getSalesSummary = () => {
    const summary: Record<string, { name: string; price: number; quantity: number; total: number }> = {};
    MENU_ITEMS.forEach(item => {
      summary[item.id] = { name: item.name, price: item.price, quantity: 0, total: 0 };
    });
    salesHistory.forEach(order => {
      order.items.forEach(item => {
        if (summary[item.id]) {
          summary[item.id].quantity += item.quantity;
          summary[item.id].total += item.price * item.quantity;
        }
      });
    });
    return Object.values(summary).filter(item => item.quantity > 0);
  };

  const exportToExcel = () => {
    const summary = getSalesSummary();
    const grandTotal = summary.reduce((sum, item) => sum + item.total, 0);

    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += '商品名稱,單價,銷售數量,總金額\n';
    summary.forEach(item => {
      csvContent += `${item.name},${item.price},${item.quantity},${item.total}\n`;
    });
    csvContent += `總計,,,${grandTotal}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `今日結帳明細_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 p-4 gap-4 font-sans overflow-hidden select-none">
      {/* Left Panel: POS / Menu (1/3 width) */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold tracking-wider">園遊會點餐系統</h1>
          <button 
            onClick={() => setShowReport(true)} 
            className="flex items-center gap-1.5 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            <Receipt size={16} /> 今日結帳
          </button>
        </div>

        {/* Menu Grid - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Coffee size={16} /> 飲品 (Drinks)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {MENU_ITEMS.filter((i) => i.category === 'drink').map((item) => (
                <div
                  key={item.id}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col h-auto"
                >
                  <div className="font-bold text-blue-900 leading-tight mb-1">{item.name}</div>
                  <div className="text-blue-600 font-medium mb-3">${item.price}</div>
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-center bg-white rounded-lg border border-blue-200 shadow-sm">
                      <button onClick={() => setQty(item.id, -1)} className="p-1.5 flex-1 hover:bg-blue-100 rounded-l-lg text-blue-700 flex justify-center transition-colors">
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold text-blue-900">{getQty(item.id)}</span>
                      <button onClick={() => setQty(item.id, 1)} className="p-1.5 flex-1 hover:bg-blue-100 rounded-r-lg text-blue-700 flex justify-center transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95"
                    >
                      加入
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Cookie size={16} /> 點心 (Snacks)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {MENU_ITEMS.filter((i) => i.category === 'snack').map((item) => (
                <div
                  key={item.id}
                  className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex flex-col h-auto"
                >
                  <div className="font-bold text-orange-900 leading-tight mb-1">{item.name}</div>
                  <div className="text-orange-600 font-medium mb-3">${item.price}</div>
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-center bg-white rounded-lg border border-orange-200 shadow-sm">
                      <button onClick={() => setQty(item.id, -1)} className="p-1.5 flex-1 hover:bg-orange-100 rounded-l-lg text-orange-700 flex justify-center transition-colors">
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold text-orange-900">{getQty(item.id)}</span>
                      <button onClick={() => setQty(item.id, 1)} className="p-1.5 flex-1 hover:bg-orange-100 rounded-r-lg text-orange-700 flex justify-center transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95"
                    >
                      加入
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Order Summary (Moved below menu items) */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <ShoppingCart size={18} /> 目前訂單
            </h3>
            
            <div className="space-y-2 mb-4">
              {currentOrder.length === 0 ? (
                <div className="py-6 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  尚未選擇餐點
                </div>
              ) : (
                currentOrder.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-medium text-slate-800 truncate">{item.name}</div>
                      <div className="text-slate-500 text-sm">${item.price}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-slate-200 rounded-l-lg text-slate-600 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-semibold text-slate-800 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-slate-200 rounded-r-lg text-slate-600 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeFromOrder(item.id)} className="text-red-400 hover:text-red-600 p-1.5 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Checkout Button Area (Fixed at bottom) */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 shrink-0">
          <div className="flex justify-between items-end mb-4">
            <span className="text-slate-500 font-medium">總計</span>
            <span className="text-3xl font-bold text-slate-800">${currentTotal}</span>
          </div>
          <button
            onClick={submitOrder}
            disabled={currentOrder.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xl py-4 rounded-xl shadow-sm transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            結帳 / 送出訂單
          </button>
        </div>
      </div>

      {/* Right Panel: Order Queue (2/3 width) */}
      <div className="flex-1 bg-slate-200/50 rounded-2xl p-6 flex flex-col min-w-0 overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            製作排程 
            {orderQueue.length > 0 && (
              <span className="bg-slate-800 text-white text-sm py-1 px-3 rounded-full">
                {orderQueue.length} 筆待處理
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {orderQueue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <CheckCircle size={64} className="mb-4 opacity-20" />
              <p className="text-xl font-medium">目前沒有待製作的訂單</p>
              <p className="text-sm mt-2 opacity-60">在左側點選餐點並送出訂單</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-max">
              <AnimatePresence mode="popLayout">
                {orderQueue.map((order) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    key={order.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[250px]"
                  >
                    {/* Order Header */}
                    <div className="bg-amber-100 px-4 py-3 border-b border-amber-200 flex justify-between items-center shrink-0">
                      <span className="font-black text-3xl text-amber-900 tracking-tighter">
                        #{order.id.toString().padStart(3, '0')}
                      </span>
                      <span className="text-amber-700 font-bold text-lg">
                        ${order.total}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 flex-1 overflow-y-auto">
                      <ul className="space-y-3">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-start text-lg">
                            <span className="font-medium text-slate-700 leading-tight pr-2">
                              {item.name}
                            </span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md shrink-0">
                              x{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Complete Button */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0">
                      <button
                        onClick={() => completeOrder(order.id)}
                        className="w-full bg-slate-800 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <CheckCircle size={20} />
                        完成出餐
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full"
            >
              <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Receipt size={24} />
                  今日結帳明細
                </h2>
                <button 
                  onClick={() => setShowReport(false)}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500">
                      <th className="pb-3 font-semibold">商品名稱</th>
                      <th className="pb-3 font-semibold text-right">單價</th>
                      <th className="pb-3 font-semibold text-right">銷售數量</th>
                      <th className="pb-3 font-semibold text-right">總金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSalesSummary().length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          今日尚無銷售紀錄
                        </td>
                      </tr>
                    ) : (
                      getSalesSummary().map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 font-medium text-slate-800">{item.name}</td>
                          <td className="py-3 text-right text-slate-600">${item.price}</td>
                          <td className="py-3 text-right font-bold text-slate-800">{item.quantity}</td>
                          <td className="py-3 text-right font-bold text-emerald-600">${item.total}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {getSalesSummary().length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-slate-800">
                        <td colSpan={3} className="pt-4 text-right font-bold text-slate-800 text-lg">
                          營業總額：
                        </td>
                        <td className="pt-4 text-right font-black text-emerald-600 text-2xl">
                          ${getSalesSummary().reduce((sum, item) => sum + item.total, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setShowReport(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  關閉
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={getSalesSummary().length === 0}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet size={20} />
                  匯出 Excel (CSV)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
