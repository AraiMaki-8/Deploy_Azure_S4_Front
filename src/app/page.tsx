'use client'
import { useState } from 'react'

export default function Home() {
  const [productCode, setProductCode] = useState('')
  const [productInfo, setProductInfo] = useState<{
    product_name: string | null
    product_price: number | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!productCode.trim()) {
      setError('商品コードを入力してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/products/${productCode}`
      )
      
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
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } text-white`}
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? '読み込み中...' : '商品コード 読み込み'}
            </button>

            {error && (
              <div className="text-red-500 mt-2">
                {error}
              </div>
            )}

            {productInfo && (
              <div className="mt-6 space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-black mb-1">商品名</div>
                  <div className="text-lg font-medium text-black">{productInfo.product_name}</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-black mb-1">価格</div>
                  <div className="text-lg font-medium text-black">
                    {productInfo.product_price?.toLocaleString()}円
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}