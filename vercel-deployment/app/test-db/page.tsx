"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDBPage() {
  const [status, setStatus] = useState('Testing...')
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    async function testConnection() {
      try {
        setStatus('Testing database connection...')
        
        // Test basic connection
        const { data, error: testError } = await supabase
          .from('orders')
          .select('count')
          .limit(1)
        
        if (testError) {
          throw new Error(`Connection test failed: ${testError.message}`)
        }
        
        setStatus('Connection successful, fetching orders...')
        
        // Test fetching orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .limit(5)
        
        if (ordersError) {
          throw new Error(`Orders fetch failed: ${ordersError.message}`)
        }
        
        setOrders(ordersData || [])
        setStatus('All tests passed!')
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Test failed')
        console.error('Test error:', err)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <div className="mb-4">
        <p className="text-lg">Status: <span className="font-semibold">{status}</span></p>
        {error && (
          <div className="mt-2 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Sample Orders ({orders.length})</h2>
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="p-3 bg-gray-100 rounded">
                <p><strong>ID:</strong> {order.id}</p>
                <p><strong>Order ID:</strong> {order.order_id}</p>
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Status:</strong> {order.order_status}</p>
                <p><strong>Payment Status:</strong> {order.payment_status}</p>
                <p><strong>Payment Option:</strong> {order.payment_option}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
