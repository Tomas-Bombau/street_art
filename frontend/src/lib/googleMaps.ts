import type { GeocodedAddress } from '@/types'

// Buenos Aires center coordinates
export const BUENOS_AIRES_CENTER = {
  lat: -34.6037,
  lng: -58.3816,
}

// Default zoom level
export const DEFAULT_ZOOM = 12

// Map container style
export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
}

/**
 * Reverse geocode coordinates to get address components
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodedAddress | null> {
  if (!window.google?.maps) {
    console.error('Google Maps API not loaded')
    return null
  }

  const geocoder = new google.maps.Geocoder()

  try {
    const response = await geocoder.geocode({ location: { lat, lng } })

    if (response.results && response.results.length > 0) {
      return parseGeocodingResult(response.results)
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Parse Google geocoding results to extract province, municipality, and neighborhood
 */
function parseGeocodingResult(results: google.maps.GeocoderResult[]): GeocodedAddress {
  let province = ''
  let municipality: string | null = null
  let neighborhood: string | null = null
  let formatted_address = results[0]?.formatted_address || ''

  // Iterate through all results to find the best components
  for (const result of results) {
    for (const component of result.address_components) {
      const types = component.types

      // Province (administrative_area_level_1)
      if (types.includes('administrative_area_level_1') && !province) {
        province = component.long_name
      }

      // Municipality/Partido (administrative_area_level_2) - only for Buenos Aires Province
      if (types.includes('administrative_area_level_2') && !municipality) {
        municipality = component.long_name
      }

      // Neighborhood/Locality (sublocality_level_1, neighborhood, or locality)
      if (
        (types.includes('sublocality_level_1') ||
          types.includes('neighborhood') ||
          types.includes('locality')) &&
        !neighborhood
      ) {
        neighborhood = component.long_name
      }
    }
  }

  // Special handling for CABA
  const isCABA =
    province.toLowerCase().includes('ciudad autónoma') ||
    province.toLowerCase().includes('ciudad autonoma') ||
    province.toLowerCase().includes('buenos aires') &&
    (formatted_address.toLowerCase().includes('caba') ||
     !municipality)

  if (isCABA) {
    province = 'Ciudad Autónoma de Buenos Aires'
    municipality = null // CABA doesn't have municipalities
  }

  return {
    province,
    municipality,
    neighborhood,
    formatted_address,
  }
}

/**
 * Create a custom marker icon with Basquiat-style colors
 */
export function createMarkerIcon(color: string = '#FF3333'): google.maps.Icon {
  return {
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path fill="${color}" stroke="#000" stroke-width="2" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z"/>
        <circle fill="#FFF" cx="16" cy="16" r="6"/>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(32, 40),
    anchor: new google.maps.Point(16, 40),
  }
}

/**
 * Map options with custom styling
 */
export const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
}
