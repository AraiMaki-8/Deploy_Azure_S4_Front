'use client'
import { useState } from 'react'

export default function Home() {
  const [productCode, setProductCode] = useState('')
  const [productInfo, setProductInfo] = useState<{
    product_name: string | null
    product_price: number | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:8000/products/${productCode}`)
      const data = await response.json()
      
      if (!data.product_name) {
        setError('商品がマスタ未登録です')
        setProductInfo(null)
        return
      }

      setProductInfo(data)
      setError(null)
    } catch {
      setError('エラーが発生しました')
      setProductInfo(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center"
              type="text"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="商品コードを入力"
            />
            <button
              className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSearch}
            >
              商品コード 読み込み
            </button>
          </div>

          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : productInfo && (
            <div className="space-y-4">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center"
                type="text"
                value={productInfo.product_name || ''}
                readOnly
              />
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center"
                type="text"
                value={productInfo.product_price ? `${productInfo.product_price}円` : ''}
                readOnly
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
