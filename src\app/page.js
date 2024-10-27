"use client";

import { useState, useEffect, useRef } from "react";
import Quagga from "quagga";

export default function HomePage() {
    const [barcode, setBarcode] = useState("");
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [purchaseList, setPurchaseList] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalAmountExTax, setTotalAmountExTax] = useState(0);
    const [scanning, setScanning] = useState(false);
    const quaggaInitialized = useRef(false);  // Quaggaの初期化状態を管理

    useEffect(() => {
        if (scanning) {
            // Quaggaが初期化されていない場合にだけinitを呼ぶ
            if (!quaggaInitialized.current) {
                Quagga.init({
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: document.querySelector("#scanner"),  // スキャンのターゲット要素
                        constraints: {
                            width: 640,  // 高解像度に設定
                            height: 480,  // 高解像度に設定
                            facingMode: "environment"  // 背面カメラを使用
                        },
                    },
                    decoder: {
                        readers: ["ean_reader"],  // EANバーコードを読み取る
                        multiple: false  // 複数のバーコードを同時に読み取らない
                    },
                    locator: {
                        patchSize: "small",  // 小さいとスキャン精度が上がるが速度が落ちる
                        halfSample: false,  // スキャン処理のスピードを上げるが精度を下げる
                    },
                    numOfWorkers: 4,  // Web Workerの数
                    locate: true
                }, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    Quagga.start();  // カメラを起動
                    quaggaInitialized.current = true;  // 初期化完了フラグを設定
                });

                Quagga.onDetected((data) => {
                    if (data && data.codeResult && data.codeResult.code) {
                        const scannedCode = data.codeResult.code;
                        setBarcode(scannedCode);  // スキャンしたバーコードをセット
                        Quagga.stop();  // スキャンを停止
                        quaggaInitialized.current = false;  // 再スキャン時に再初期化するためにリセット
                        setScanning(false);
                        searchProduct(scannedCode);  // スキャンしたバーコードで商品検索
                    }
                });
            }
        }

        return () => {
            if (scanning) {
                Quagga.stop();  // コンポーネントがアンマウントされたときにスキャンを停止
                quaggaInitialized.current = false;  // 再初期化するためにリセット
            }
        };
    }, [scanning]);

    const searchProduct = async (scannedBarcode) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/product/${scannedBarcode}`);
            if (!response.ok) {
                throw new Error("商品情報を取得できませんでした");
            }
            const data = await response.json();
            if (!data) {
                alert("商品が見つかりません");
                setProduct(null);
            } else {
                setProduct(data);
            }
        } catch (error) {
            console.error("エラー:", error);
            alert("商品情報の取得に失敗しました");
        }
    };

    const addToPurchaseList = () => {
        if (product) {
            const newItem = { 
                name: product.name, 
                price: product.price, 
                barcode: barcode, 
                quantity 
            };
            setPurchaseList([...purchaseList, newItem]);
            setTotalAmount(totalAmount + product.price * quantity);
            setTotalAmountExTax(totalAmountExTax + Math.round(product.price / 1.1) * quantity); // 税抜金額を計算
            setProduct(null);
            setBarcode("");
        }
    };

    const handlePurchase = async () => {
        const cart = purchaseList.map(item => ({
            name: item.name,
            price: item.price,
            barcode: item.barcode,
        }));
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                cart, 
                totalAmt: totalAmount, 
                totalAmtExTax: totalAmountExTax 
            })
        });

        if (!response.ok) {
            alert("購入処理に失敗しました");
            return;
        }

        const data = await response.json();
        alert(`購入金額（税込）: ${data.totalAmt}円, 購入金額（税抜）: ${data.totalAmtExTax}円`);
        setPurchaseList([]);
        setTotalAmount(0);
        setTotalAmountExTax(0);
    };

    const handleStartScan = () => {
        if (!scanning) {
            setScanning(true);
        }
    };

    const handleStopScan = () => {
        if (scanning) {
            Quagga.stop();
            quaggaInitialized.current = false;  // 再スキャン時に再初期化するためにリセット
            setScanning(false);
        }
    };

    // 手動でバーコードを入力して商品を検索する機能
    const handleManualInput = () => {
        if (barcode) {
            searchProduct(barcode);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md bg-white shadow-lg rounded-lg">
            <div id="scanner" className="scanner-container mb-4"></div> {/* カメラプレビュー */}
            <button
                onClick={scanning ? handleStopScan : handleStartScan}
                className="w-full bg-blue-500 text-white py-2 mt-2 rounded-md"
            >
                {scanning ? "スキャン停止" : "バーコードスキャン"}
            </button>

            {/* スキャンしたバーコードの数字を表示 */}
            {barcode && (
                <div className="mt-4 p-2 bg-gray-100 rounded-md text-black">
                    <p>スキャンされたバーコード: {barcode}</p>
                </div>
            )}

            {/* 手動バーコード入力 */}
            <div className="mt-4">
                <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="バーコードを手入力"
                    className="w-full border border-gray-300 p-2 rounded-md text-black"
                />
                <button
                    onClick={handleManualInput}
                    className="w-full bg-blue-500 text-white py-2 mt-2 rounded-md"
                >
                    手動で商品を検索
                </button>
            </div>

            {product && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md text-black">
                    <p className="font-bold text-lg">商品情報</p>
                    <p>商品名: {product.name}</p>
                    <p>価格: {product.price}円</p>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        className="w-full border border-gray-300 p-2 rounded-md mt-2"
                    />
                    <button
                        onClick={addToPurchaseList}
                        className="w-full bg-green-500 text-black py-2 mt-2 rounded-md"
                    >
                        購入リストに追加
                    </button>
                </div>
            )}

            <div className="mt-4">
                <h2 className="font-bold text-black">購入リスト</h2>
                <ul className="bg-gray-100 p-4 rounded-md text-black">
                    {purchaseList.map((item, index) => (
                        <li key={index} className="border-b py-2">
                            {item.name} x {item.quantity} - {item.price * item.quantity}円
                        </li>
                    ))}
                </ul>
                <p className="mt-2 font-bold text-black">合計金額: {totalAmount}円</p>
                <button
                    onClick={handlePurchase}
                    className="w-full bg-red-500 text-white py-2 mt-2 rounded-md"
                >
                    購入
                </button>
            </div>

            {/* カメラプレビューのスタイルを追加 */}
            <style jsx>{`
                .scanner-container {
                    width: 100%;
                    height: 320px;  /* 高さを固定 */
                    background-color: #ccc;  /* プレビューがないときはグレー */
                    position: relative;
                    overflow: hidden;  /* カメラプレビューが範囲を超えないようにする */
                }
                video {
                    width: 100%;  /* カメラ映像をコンテナに合わせる */
                    height: auto;
                }
            `}</style>
        </div>
    );
}
