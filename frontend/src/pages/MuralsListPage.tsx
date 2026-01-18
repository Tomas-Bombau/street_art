import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useMuralsStore } from '@/stores/muralsStore'
import { useFilterOptionsStore } from '@/stores/filterOptionsStore'
import { useAddMuralStore } from '@/stores/addMuralStore'
import MuralCard from '@/components/murals/MuralCard'
import MuralFilters from '@/components/murals/MuralFilters'
import MuralPagination from '@/components/murals/MuralPagination'
import AddMuralModal from '@/components/murals/AddMuralModal'
import LanguageToggle from '@/components/LanguageToggle'
import { MapPin, Plus, ArrowLeft, Loader2 } from 'lucide-react'

export default function MuralsListPage() {
  const { t } = useTranslation()
  const { murals, isLoading, pagination, fetchMurals } = useMuralsStore()
  const { fetchProvinces } = useFilterOptionsStore()
  const { openModal, isModalOpen } = useAddMuralStore()

  useEffect(() => {
    fetchMurals()
    fetchProvinces()
  }, [fetchMurals, fetchProvinces])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-kobra-teal text-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-kobra-pink hover:text-kobra-pink/80 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl geometric">{t('murals.title')}</h1>
              <p className="text-kobra-yellow handwritten text-lg">{t('murals.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle variant="light" />
            <Link to="/murals/map">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-kobra-teal"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('murals.viewMap')}
              </Button>
            </Link>
            <Button
              onClick={openModal}
              className="bg-kobra-pink text-white hover:bg-kobra-pink/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('murals.addMural')}
            </Button>
          </div>
        </div>
      </header>

      {/* Rainbow stripe (7 colors) */}
      <div className="h-2 flex">
        <div className="flex-1 bg-kobra-red"></div>
        <div className="flex-1 bg-kobra-orange"></div>
        <div className="flex-1 bg-kobra-yellow"></div>
        <div className="flex-1 bg-kobra-green"></div>
        <div className="flex-1 bg-kobra-teal"></div>
        <div className="flex-1 bg-kobra-blue"></div>
        <div className="flex-1 bg-kobra-purple"></div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <MuralFilters />
          </aside>

          {/* Murals grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-kobra-pink" />
                <span className="ml-3 text-lg">{t('murals.loading')}</span>
              </div>
            ) : murals.length === 0 ? (
              <div className="text-center py-20">
                {/* Geometric diamond decoration */}
                <div className="mb-4 flex justify-center">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="text-kobra-pink">
                    <polygon points="32,4 60,32 32,60 4,32" fill="none" stroke="currentColor" strokeWidth="3"/>
                    <polygon points="32,16 48,32 32,48 16,32" fill="currentColor"/>
                  </svg>
                </div>
                <h2 className="text-2xl mb-2 geometric">{t('murals.noMurals')}</h2>
                <p className="text-muted-foreground mb-6">
                  {t('murals.noMuralsHint')}
                </p>
                <Button
                  onClick={openModal}
                  className="bg-kobra-pink text-white hover:bg-kobra-pink/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('murals.addFirstMural')}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-muted-foreground">
                  {t('murals.showing', { count: murals.length, total: pagination.total_count })}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {murals.map((mural) => (
                    <MuralCard key={mural.id} mural={mural} />
                  ))}
                </div>
                <div className="mt-8">
                  <MuralPagination />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Mural Modal */}
      {isModalOpen && <AddMuralModal />}
    </div>
  )
}
