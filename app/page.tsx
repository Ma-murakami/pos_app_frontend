"use client";

import { useState, useEffect } from 'react';

// 商品情報の仮データ
const products = {
  "123456": { name: "Apple", price: 100 },
  "789012": { name: "Banana", price: 150 },
  // 追加の商品データはここに記載できます
};

export default function POSApp() {
  const [code, setCode] = useState('');
  const [product, setProduct] = useState(null);
  const [purchaseList, setPurchaseList] = useState([]);

  // codeが変更された時に自動的に商品情報を設定する
  useEffect(() => {
    if (products[code]) {
      setProduct(products[code]);
    } else {
      setProduct(null);
    }
  }, [code]); // codeが変更された時に実行される

  // 商品コード読み取りボタンのハンドラー
  const handleScanCode = () => {
    // 仮で "123456" のコードを自動入力とする
    setCode("123456");
  };

  // 商品コードを入力した際に商品情報を表示
  const handleCodeInput = (e) => {
    const inputCode = e.target.value;
    setCode(inputCode);
  };

  // 購入リストに商品を追加
  const handleAddToCart = () => {
    if (product) {
      setPurchaseList([...purchaseList, product]);
      setCode('');
      setProduct(null);
    }
  };

  // 合計金額を計算して表示
  const handlePurchase = () => {
    const total = purchaseList.reduce((acc, item) => acc + item.price, 0);
    alert(`合計金額は ${total} 円です`);
  };

  return (
    <div className="p-4">
      <h1>POSアプリ</h1>

      {/* ①コード入力エリア */}
      <div className="mb-4">
        <label>商品コードを入力してください:</label>
        <input
          type="text"
          value={code}
          onChange={handleCodeInput}
          className="border p-2"
        />
      </div>

      {/* ➁商品コード読み取りボタン */}
      <div className="mb-4">
        <button onClick={handleScanCode} className="bg-blue-500 text-white p-2 rounded">
          商品コード読み取り
        </button>
      </div>

      {/* ③商品名称表示エリア */}
      {product && (
        <div className="mb-2">
          <p>商品名: {product.name}</p>
        </div>
      )}

      {/* ④商品単価表示エリア */}
      {product && (
        <div className="mb-2">
          <p>単価: {product.price} 円</p>
        </div>
      )}

      {/* ⑤商品購入リストへの追加ボタン */}
      <div className="mb-4">
        <button
          onClick={handleAddToCart}
          className="bg-green-500 text-white p-2 rounded"
          disabled={!product}
        >
          購入リストに追加
        </button>
      </div>

      {/* ⑥購入リスト */}
      <div className="mb-4">
        <h2>購入リスト</h2>
        <ul>
          {purchaseList.map((item, index) => (
            <li key={index}>
              {item.name} - {item.price} 円
            </li>
          ))}
        </ul>
      </div>

      {/* ⑦購入ボタン */}
      <div>
        <button onClick={handlePurchase} className="bg-red-500 text-white p-2 rounded">
          購入
        </button>
      </div>
    </div>
  );
}
