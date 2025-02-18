'use client'
import { useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// 商品情報の型定義
interface ProductInfo {
  product_code: string;
  product_name: string;
  product_price: number;
}

// カートアイテムの型定義
interface CartItem {
  code: string;
  name: string;
  price: number;
  quantity: number;
}

// 購入処理の型定義
interface PurchaseTransaction {
  emp_cd: string;
  store_cd: string;
  pos_no: string;
  product_code: string;
  quantity: number;
}

export default function Home() {
  const [productCode, setProductCode] = useState('')
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 購入リスト（カート）の状態を管理
  const [cart, setCart] = useState<CartItem[]>([])

  // 商品検索処理
  const handleSearch = async () => {
    if (!productCode.trim()) {
      setError('商品コードを入力してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productCode}`)
      
      if (!response.ok) {
        throw new Error('APIエラーが発生しました')
      }
      
      const data = await response.json()
      
      if (!data.product_name) {
        setError('商品がマスタ未登録です')
        setProductInfo(null)
        return
      }

      setProductInfo(data)
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。')
      setProductInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  // 商品を購入リストに追加する処理
  const handleAddToCart = () => {
    if (!productInfo) return;

    setCart((prevCart: CartItem[]) => {
      // 既存のアイテムを探す
      const existingItem = prevCart.find(item => item.code === productInfo.product_code);

      if (existingItem) {
        // 既存アイテムの数量を増やす
        return prevCart.map(item =>
          item.code === productInfo.product_code
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // 新規アイテムを追加
      return [
        ...prevCart,
        {
          code: productInfo.product_code,
          name: productInfo.product_name,
          price: productInfo.product_price,
          quantity: 1
        }
      ];
    });

    // 入力フィールドと検索結果をリセット
    setProductCode('');
    setProductInfo(null);
    setError(null);
  };
  

  // 合計金額を計算
  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // 税込金額計算関数を追加
  const calculateTotalWithTax = () => {
    const subtotal = calculateTotalPrice();
    const tax = Math.floor(subtotal * 0.1);  // 10%の消費税
    return subtotal + tax;
  };

  // Enterキーで検索する処理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 購入処理の関数
  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      
      // カート内の各商品について取引を作成
      for (const item of cart) {
        const transaction: PurchaseTransaction = {
          emp_cd: "",  // 空白の場合は'9999999999'が設定される
          store_cd: "30",  // 店舗コード固定
          pos_no: "90",  // POS機ID固定
          product_code: item.code,
          quantity: item.quantity
        };

        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction)
        });

        if (!response.ok) {
          throw new Error('購入処理に失敗しました');
        }
      }

      // 成功時の処理：既存のポップアップ表示
      alert(
        `小計: ${calculateTotalPrice().toLocaleString()}円\n` +
        `消費税: ${Math.floor(calculateTotalPrice() * 0.1).toLocaleString()}円\n` +
        `合計金額（税込）: ${calculateTotalWithTax().toLocaleString()}円\n\n` +
        `ご購入ありがとうございました！`
      );
      
      // カートをクリア
      setCart([]);
      setProductCode('');
      setProductInfo(null);
      setError(null);

    } catch (err) {
      setError('購入処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <main className="w-full max-w-md p-4">
        <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-black">商品検索</h1>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-black"
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="商品コードを入力"
                disabled={isLoading}
              />
            </div>

            <button
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } text-white`}
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? '読み込み中...' : '商品コード 読み込み'}
            </button>

            {error && <div className="text-red-500 mt-2">{error}</div>}

            {productInfo && (
              <div className="mt-6 space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-black mb-1">商品名</div>
                  <div className="text-lg font-medium text-black">{productInfo.product_name}</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-black mb-1">価格</div>
                  <div className="text-lg font-medium text-black">{productInfo.product_price?.toLocaleString()}円</div>
                </div>

                {/* 追加ボタン */}
                <button
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  onClick={handleAddToCart}
                >
                  追加
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 購入リスト表示 */}
        {cart.length > 0 && (
          <div className="mt-6 bg-white shadow-lg rounded-lg px-8 pt-6 pb-8">
            <h2 className="text-xl font-bold text-center mb-4 text-black">購入リスト</h2>
            <ul>
              {cart.map((item) => (
                <li key={item.code} className="border-b py-2 text-black">
                  {item.name} - {item.price.toLocaleString()}円 x {item.quantity}
                </li>
              ))}
            </ul>

            {/* 合計金額の表示 */}
            <div className="text-lg font-bold text-center mt-4 text-black">
              合計: {calculateTotalPrice().toLocaleString()}円
            </div>

            {/* 購入ボタン */}
            <button
              className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              onClick={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? '購入中...' : '購入'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
