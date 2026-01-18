import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddMuralStore } from '@/stores/addMuralStore'
import { openUploadWidget } from '@/lib/cloudinary'
import { reverseGeocode, BUENOS_AIRES_CENTER, DEFAULT_ZOOM, mapOptions } from '@/lib/googleMaps'
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api'
import { toast } from 'sonner'
import type { CreateMuralFormData } from '@/types'
import { X, Upload, MapPin, Loader2, Check, Search } from 'lucide-react'

// Define libraries outside component to prevent reloading
const libraries: ('places')[] = ['places']

const muralSchema = z.object({
  contributor_email: z.email('Please enter a valid email'),
})

type FormData = z.infer<typeof muralSchema>

export default function AddMuralModal() {
  const { t } = useTranslation()
  const {
    closeModal,
    selectedLocation,
    geocodedAddress,
    uploadedImage,
    setLocation,
    setGeocodedAddress,
    setUploadedImage,
    clearImage,
    submitMural,
    isSubmitting,
    error,
  } = useAddMuralStore()

  const [isGeocoding, setIsGeocoding] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(muralSchema),
  })

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return

    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    setLocation(lat, lng)
    setIsGeocoding(true)

    try {
      const address = await reverseGeocode(lat, lng)
      if (address) {
        setGeocodedAddress(address)
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      toast.error('Failed to get address for this location')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handlePlaceSelect = async () => {
    if (!autocompleteRef.current) return

    const place = autocompleteRef.current.getPlace()
    if (!place.geometry?.location) {
      toast.error('Could not find location for this address')
      return
    }

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()

    setLocation(lat, lng)
    setIsGeocoding(true)

    try {
      const address = await reverseGeocode(lat, lng)
      if (address) {
        setGeocodedAddress(address)
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      toast.error('Failed to get address details')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleUploadClick = () => {
    openUploadWidget(
      (url, publicId) => {
        setUploadedImage(url, publicId)
        toast.success('Image uploaded successfully')
      },
      (error) => {
        toast.error(`Upload failed: ${error}`)
      }
    )
  }

  const onSubmit = async (data: FormData) => {
    // Validate required fields
    if (!uploadedImage) {
      toast.error('Please upload an image')
      return
    }
    if (!selectedLocation) {
      toast.error('Please select a location on the map')
      return
    }
    if (!geocodedAddress?.province) {
      toast.error('Could not determine location. Please try again.')
      return
    }

    const muralData: CreateMuralFormData = {
      contributor_email: data.contributor_email,
      image_url: uploadedImage.url,
      cloudinary_public_id: uploadedImage.publicId,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      province: geocodedAddress.province,
      municipality: geocodedAddress.municipality,
      neighborhood: geocodedAddress.neighborhood,
      formatted_address: geocodedAddress.formatted_address,
    }

    const result = await submitMural(muralData)

    if (result.success) {
      toast.success('Mural submitted!', {
        description: result.message || 'Your submission is pending review.',
      })
      closeModal()
    } else {
      toast.error('Submission failed', {
        description: result.message,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto kobra-border-soft">
        {/* Header */}
        <div className="bg-kobra-teal p-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white geometric">{t('modal.title')}</h2>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Error display */}
          {error && (
            <div className="bg-kobra-red/10 border-2 border-kobra-red text-kobra-red p-3 text-sm">
              {error}
            </div>
          )}

          {/* Image upload */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase">{t('modal.photo')} *</Label>
            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage.url}
                  alt="Uploaded mural"
                  className="w-full h-32 object-cover kobra-border"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-kobra-red text-white p-1.5 hover:bg-kobra-red/90"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-kobra-green/80 text-white px-2 py-1 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {t('modal.uploaded')}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUploadClick}
                className="w-full h-32 border-2 border-dashed border-kobra-teal/60 flex flex-col items-center justify-center gap-1 hover:bg-kobra-teal/5 transition-colors"
              >
                <Upload className="w-6 h-6 text-kobra-teal" />
                <span className="text-sm font-bold text-kobra-teal">{t('modal.clickUpload')}</span>
                <span className="text-xs text-muted-foreground">{t('modal.uploadHint')}</span>
              </button>
            )}
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold uppercase">
              {t('modal.email')} *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('modal.emailPlaceholder')}
              className="border border-kobra-teal/60 focus:ring-kobra-teal/50"
              {...register('contributor_email')}
            />
            <p className="text-xs text-muted-foreground">
              {t('modal.emailHint')}
            </p>
            {errors.contributor_email && (
              <p className="text-kobra-red text-sm">{errors.contributor_email.message}</p>
            )}
          </div>

          {/* Location picker */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase">{t('modal.location')} *</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {t('modal.locationHint')}
            </p>
            {googleMapsApiKey ? (
              <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
                {/* Address search */}
                <div className="relative mb-2">
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocompleteRef.current = autocomplete
                    }}
                    onPlaceChanged={handlePlaceSelect}
                    options={{
                      componentRestrictions: { country: 'ar' },
                      fields: ['geometry', 'formatted_address'],
                    }}
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder={t('modal.searchAddress')}
                        className="w-full pl-10 pr-4 py-2 border border-kobra-teal/60 focus:outline-none focus:ring-2 focus:ring-kobra-teal/50"
                      />
                    </div>
                  </Autocomplete>
                </div>

                <div className="h-64 border-2 border-kobra-teal/60 relative">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={selectedLocation || BUENOS_AIRES_CENTER}
                    zoom={selectedLocation ? 15 : DEFAULT_ZOOM}
                    options={mapOptions}
                    onClick={handleMapClick}
                  >
                    {selectedLocation && (
                      <Marker
                        position={selectedLocation}
                        icon={{
                          url: `data:image/svg+xml,${encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                              <path fill="#F15BB5" stroke="#264653" stroke-width="2" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z"/>
                              <circle fill="#FFF" cx="16" cy="16" r="6"/>
                            </svg>
                          `)}`,
                          scaledSize: new google.maps.Size(32, 40),
                          anchor: new google.maps.Point(16, 40),
                        }}
                      />
                    )}
                  </GoogleMap>

                  {/* Geocoding indicator */}
                  {isGeocoding && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin mr-2 text-kobra-teal" />
                      {t('modal.gettingAddress')}
                    </div>
                  )}
                </div>
              </LoadScript>
            ) : (
              <div className="h-64 bg-gray-100 flex items-center justify-center border-2 border-kobra-teal/60">
                <p className="text-muted-foreground">{t('modal.apiKeyRequired')}</p>
              </div>
            )}

            {/* Geocoded address display */}
            {geocodedAddress && (
              <div className="bg-gray-50 p-3 border border-kobra-teal/40 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-kobra-teal" />
                  <div>
                    <p className="font-bold">{geocodedAddress.province}</p>
                    {geocodedAddress.municipality && (
                      <p>{geocodedAddress.municipality}</p>
                    )}
                    {geocodedAddress.neighborhood && (
                      <p className="text-muted-foreground">{geocodedAddress.neighborhood}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="flex-1 border border-kobra-teal/60"
            >
              {t('modal.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-kobra-teal text-white hover:bg-kobra-teal/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('modal.submitting')}
                </>
              ) : (
                t('modal.submit')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
