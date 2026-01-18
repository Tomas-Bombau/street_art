import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import type { Mural } from '@/types'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { BUENOS_AIRES_CENTER, DEFAULT_ZOOM, MAP_CONTAINER_STYLE, mapOptions } from '@/lib/googleMaps'
import { getThumbnailUrl } from '@/lib/cloudinary'
import LanguageToggle from '@/components/LanguageToggle'
import { ArrowLeft, List, Loader2 } from 'lucide-react'

interface MuralsMapResponse {
  data: Mural[]
}

export default function MuralsMapPage() {
  const { t } = useTranslation()
  const [murals, setMurals] = useState<Mural[]>([])
  const [isLoadingMurals, setIsLoadingMurals] = useState(true)
  const [selectedMural, setSelectedMural] = useState<Mural | null>(null)

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
  })

  useEffect(() => {
    const fetchMurals = async () => {
      try {
        const response = await api.get<MuralsMapResponse>('/murals/map')
        setMurals(response.data.data)
      } catch (error) {
        console.error('Failed to fetch murals for map:', error)
      } finally {
        setIsLoadingMurals(false)
      }
    }

    fetchMurals()
  }, [])

  if (!googleMapsApiKey) {
    return (
      <div className="min-h-screen bg-kobra-teal flex flex-col items-center justify-center text-white">
        {/* Geometric hexagon decoration */}
        <div className="mb-4">
          <svg width="80" height="80" viewBox="0 0 80 80" className="text-kobra-pink">
            <polygon points="40,5 72,22.5 72,57.5 40,75 8,57.5 8,22.5" fill="none" stroke="currentColor" strokeWidth="3"/>
            <polygon points="40,20 56,30 56,50 40,60 24,50 24,30" fill="currentColor"/>
          </svg>
        </div>
        <h1 className="text-2xl mb-4 geometric">{t('map.apiKeyRequired')}</h1>
        <p className="text-white/70 mb-6">{t('map.apiKeyHint')}</p>
        <Link to="/murals">
          <Button className="bg-kobra-pink text-white hover:bg-kobra-pink/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('map.backToList')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-kobra-teal text-white py-4 px-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/murals" className="text-kobra-pink hover:text-kobra-pink/80 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl geometric">{t('map.title')}</h1>
              <p className="text-kobra-yellow handwritten text-sm">{t('map.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle variant="light" />
            <Link to="/murals">
              <Button
                variant="outline"
                className="border-kobra-pink text-kobra-pink hover:bg-kobra-pink hover:text-white"
              >
                <List className="w-4 h-4 mr-2" />
                {t('map.listView')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Rainbow stripe (7 colors) */}
      <div className="h-1 flex flex-shrink-0">
        <div className="flex-1 bg-kobra-red"></div>
        <div className="flex-1 bg-kobra-orange"></div>
        <div className="flex-1 bg-kobra-yellow"></div>
        <div className="flex-1 bg-kobra-green"></div>
        <div className="flex-1 bg-kobra-teal"></div>
        <div className="flex-1 bg-kobra-blue"></div>
        <div className="flex-1 bg-kobra-purple"></div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {!isLoaded || isLoadingMurals ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-kobra-pink" />
            <span className="ml-3 text-lg">{t('map.loading')}</span>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={BUENOS_AIRES_CENTER}
            zoom={DEFAULT_ZOOM}
            options={mapOptions}
          >
            {murals.map((mural) => (
              <Marker
                key={mural.id}
                position={{ lat: mural.latitude, lng: mural.longitude }}
                onClick={() => setSelectedMural(mural)}
                icon={{
                  url: `data:image/svg+xml,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                      <path fill="#F15BB5" stroke="#264653" stroke-width="2" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z"/>
                      <circle fill="#FFF" cx="16" cy="16" r="6"/>
                    </svg>
                  `)}`,
                  scaledSize: new google.maps.Size(24, 30),
                  anchor: new google.maps.Point(12, 30),
                }}
              />
            ))}

            {selectedMural && (
              <InfoWindow
                position={{ lat: selectedMural.latitude, lng: selectedMural.longitude }}
                onCloseClick={() => setSelectedMural(null)}
              >
                <div className="max-w-xs p-2">
                  <img
                    src={getThumbnailUrl(selectedMural.image_url, 200, 150)}
                    alt={selectedMural.name}
                    className="w-full h-32 object-cover mb-2 kobra-border"
                  />
                  <h3 className="font-bold text-lg">{selectedMural.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedMural.neighborhood && `${selectedMural.neighborhood}, `}
                    {selectedMural.province}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        {/* Mural count */}
        <div className="absolute bottom-4 left-4 bg-kobra-teal text-white px-4 py-2 kobra-border">
          <span className="text-kobra-pink font-bold">{murals.length}</span> {t('map.muralsOnMap')}
        </div>
      </div>
    </div>
  )
}
