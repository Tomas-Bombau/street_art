import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMuralsStore } from '@/stores/muralsStore'
import { useFilterOptionsStore } from '@/stores/filterOptionsStore'
import { Search, X } from 'lucide-react'

export default function MuralFilters() {
  const { t } = useTranslation()
  const { filters, setFilter, clearFilters } = useMuralsStore()
  const {
    provinces,
    municipalities,
    neighborhoods,
    fetchMunicipalities,
    fetchNeighborhoods,
    clearMunicipalities,
    clearNeighborhoods,
  } = useFilterOptionsStore()

  const [nameInput, setNameInput] = useState(filters.name)
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Check if selected province is CABA
  const isCABA = filters.province.toLowerCase().includes('ciudad') ||
                 filters.province.toLowerCase().includes('caba') ||
                 filters.province.toLowerCase().includes('autónoma')

  // Handle name search with debounce
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      if (nameInput !== filters.name) {
        setFilter('name', nameInput)
      }
    }, 300)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [nameInput])

  // Fetch municipalities when province changes (and not CABA)
  useEffect(() => {
    if (filters.province && !isCABA) {
      fetchMunicipalities(filters.province)
    } else {
      clearMunicipalities()
    }
  }, [filters.province, isCABA, fetchMunicipalities, clearMunicipalities])

  // Fetch neighborhoods when province or municipality changes
  useEffect(() => {
    if (filters.province) {
      fetchNeighborhoods(filters.province, filters.municipality || undefined)
    } else {
      clearNeighborhoods()
    }
  }, [filters.province, filters.municipality, fetchNeighborhoods, clearNeighborhoods])

  const hasActiveFilters = filters.name || filters.province || filters.municipality || filters.neighborhood

  return (
    <div className="bg-kobra-teal/5 border-3 border-kobra-teal p-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-kobra-teal">
        <Search className="w-5 h-5" />
        {t('filters.title')}
      </h3>

      <div className="space-y-4">
        {/* Name search */}
        <div className="space-y-2">
          <Label htmlFor="name-filter" className="text-sm font-bold uppercase">
            {t('filters.searchByName')}
          </Label>
          <Input
            id="name-filter"
            type="text"
            placeholder={t('filters.namePlaceholder')}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="border-2 border-kobra-teal focus:ring-kobra-pink"
          />
        </div>

        {/* Province filter */}
        <div className="space-y-2">
          <Label htmlFor="province-filter" className="text-sm font-bold uppercase">
            {t('filters.province')}
          </Label>
          <select
            id="province-filter"
            value={filters.province}
            onChange={(e) => setFilter('province', e.target.value)}
            className="w-full border-2 border-kobra-teal p-2 bg-white focus:ring-kobra-pink"
          >
            <option value="">{t('filters.allProvinces')}</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {/* Municipality filter (only if not CABA) */}
        {filters.province && !isCABA && (
          <div className="space-y-2">
            <Label htmlFor="municipality-filter" className="text-sm font-bold uppercase">
              {t('filters.municipality')}
            </Label>
            <select
              id="municipality-filter"
              value={filters.municipality}
              onChange={(e) => setFilter('municipality', e.target.value)}
              className="w-full border-2 border-kobra-teal p-2 bg-white focus:ring-kobra-pink"
            >
              <option value="">{t('filters.allMunicipalities')}</option>
              {municipalities.map((municipality) => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Neighborhood filter */}
        {filters.province && (
          <div className="space-y-2">
            <Label htmlFor="neighborhood-filter" className="text-sm font-bold uppercase">
              {t('filters.neighborhood')}
            </Label>
            <select
              id="neighborhood-filter"
              value={filters.neighborhood}
              onChange={(e) => setFilter('neighborhood', e.target.value)}
              className="w-full border-2 border-kobra-teal p-2 bg-white focus:ring-kobra-pink"
            >
              <option value="">{t('filters.allNeighborhoods')}</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            onClick={() => {
              clearFilters()
              setNameInput('')
            }}
            variant="outline"
            className="w-full border-2 border-kobra-red text-kobra-red hover:bg-kobra-red hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            {t('filters.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  )
}
