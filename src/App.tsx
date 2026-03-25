/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Cookie, Trash2, CheckCircle, Plus, Minus, ShoppingCart } from 'lucide-react';

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
  const [orderCounter, setOrderCounter] = useState(1);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

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
    setOrderCounter((prev) => prev + 1);
    setCurrentOrder([]);
  };

  const completeOrder = (orderId: number) => {
    setOrderQueue((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 p-4 gap-4 font-sans overflow-hidden select-none">
      {/* Left Panel: POS / Menu (1/3 width) */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 text-center shrink-0">
          <h1 className="text-xl font-bold tracking-wider">園遊會點餐系統</h1>
        </div>

        {/* Menu Grid */}
        <div className="p-4 overflow-y-auto border-b border-slate-100 shrink-0">
          <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Coffee size={16} /> 飲品 (Drinks)
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
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

        {/* Current Order Summary */}
        <div className="bg-slate-50 p-4 flex flex-col flex-1 min-h-0">
          <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2 shrink-0">
            <ShoppingCart size={18} /> 目前訂單
          </h3>
          
          <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-2">
            {currentOrder.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
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
          
          <div className="shrink-0 mt-auto pt-2 border-t border-slate-200">
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
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden aspect-square"
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
    </div>
  );
}
