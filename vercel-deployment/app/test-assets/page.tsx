"use client"

import { useLogoUrl, useVideoUrl } from "@/hooks/use-assets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, ExternalLink } from "lucide-react"
import { useState } from "react"

export default function TestAssetsPage() {
  const { logoUrl, loading: logoLoading } = useLogoUrl()
  const { videoUrl, loading: videoLoading } = useVideoUrl()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    // Force a page reload to test fresh asset loading
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Asset Loading Test</h1>
          <p className="text-gray-400 mb-6">
            Testing logo and video loading from Supabase storage
          </p>
          <Button onClick={handleRefresh} variant="outline" className="text-white border-white/20 hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Assets
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Test */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Logo Asset
                {logoLoading && <div className="w-4 h-4 border-2 border-[#F7DD0F] border-t-transparent rounded-full animate-spin" />}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Testing logo loading from Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-48 bg-gray-800 rounded-lg flex items-center justify-center p-4">
                {logoLoading ? (
                  <div className="text-gray-400">Loading logo...</div>
                ) : (
                  <img
                    src={logoUrl}
                    alt="Test Logo"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/logo/dopelogo.svg'
                      console.log('Logo failed to load, using fallback')
                    }}
                    onLoad={() => console.log('Logo loaded successfully:', logoUrl)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Source URL:</p>
                <p className="text-xs text-gray-300 break-all bg-gray-800 p-2 rounded">
                  {logoUrl}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${logoUrl.startsWith('http') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {logoUrl.startsWith('http') ? 'Supabase URL' : 'Local Fallback'}
                  </span>
                  {logoUrl.startsWith('http') && (
                    <a
                      href={logoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F7DD0F] hover:text-[#F7DD0F]/80 text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Test */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Video Asset
                {videoLoading && <div className="w-4 h-4 border-2 border-[#F7DD0F] border-t-transparent rounded-full animate-spin" />}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Testing video loading from Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-48 bg-gray-800 rounded-lg flex items-center justify-center p-4">
                {videoLoading ? (
                  <div className="text-gray-400">Loading video...</div>
                ) : (
                  <video
                    src={videoUrl}
                    className="max-h-full max-w-full object-contain"
                    muted
                    loop
                    controls
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement
                      target.src = '/video/footervid.mp4'
                      console.log('Video failed to load, using fallback')
                    }}
                    onLoadStart={() => console.log('Video loading started:', videoUrl)}
                    onCanPlay={() => console.log('Video can play successfully')}
                  />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Source URL:</p>
                <p className="text-xs text-gray-300 break-all bg-gray-800 p-2 rounded">
                  {videoUrl}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${videoUrl.startsWith('http') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {videoUrl.startsWith('http') ? 'Supabase URL' : 'Local Fallback'}
                  </span>
                  {videoUrl.startsWith('http') && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F7DD0F] hover:text-[#F7DD0F]/80 text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card className="bg-white/5 border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Asset Loading Status</CardTitle>
            <CardDescription className="text-gray-400">
              Summary of asset loading results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-white">Logo Status:</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${logoLoading ? 'bg-yellow-500' : logoUrl.startsWith('http') ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <span className="text-sm text-gray-300">
                    {logoLoading ? 'Loading...' : logoUrl.startsWith('http') ? 'Loaded from Supabase' : 'Using local fallback'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Video Status:</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${videoLoading ? 'bg-yellow-500' : videoUrl.startsWith('http') ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <span className="text-sm text-gray-300">
                    {videoLoading ? 'Loading...' : videoUrl.startsWith('http') ? 'Loaded from Supabase' : 'Using local fallback'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
