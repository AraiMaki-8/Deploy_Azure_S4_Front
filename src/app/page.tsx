'use client'
import { useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function Home() {
  const [productCode, setProductCode] = useState('')
  const [productInfo, setProductInfo] = useState<{ product_name: string | null, product_price: number | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 購入リスト（カート）の状態を管理
  const [cart, setCart] = useState<{ code: string; name: string; price: number; quantity: number }[]>([])

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
    if (!productInfo || !productInfo.product_name || !productInfo.product_price) {
      return
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.code === productCode)

      if (existingItem) {
        // 既にカートにある商品なら数量を増やす
        return prevCart.map((item) =>
          item.code === productCode ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        // 新規の商品を追加
        return [...prevCart, { code: productCode, name: productInfo.product_name, price: productInfo.product_price, quantity: 1 }]
      }
    })

    // 入力フィールドと検索結果をリセット
    setProductCode('')
    setProductInfo(null)
    setError(null)
  }

  // 合計金額を計算
  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Enterキーで検索する処理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

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
          </div>
        )}
      </main>
    </div>
  )
}
