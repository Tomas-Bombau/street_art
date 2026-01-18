import type { Mural } from '@/types'
import { getThumbnailUrl } from '@/lib/cloudinary'
import { MapPin } from 'lucide-react'

interface MuralCardProps {
  mural: Mural
}

export default function MuralCard({ mural }: MuralCardProps) {
  return (
    <div className="group bg-white border-3 border-kobra-teal kobra-border hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={getThumbnailUrl(mural.image_url, 400, 300)}
          alt={mural.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Province badge */}
        <div className="absolute top-2 right-2 bg-kobra-gradient text-white px-2 py-1 text-xs font-bold">
          {mural.province.includes('Ciudad') ? 'CABA' : 'GBA'}
        </div>
        {/* Rainbow accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-kobra-red"></div>
          <div className="flex-1 bg-kobra-orange"></div>
          <div className="flex-1 bg-kobra-yellow"></div>
          <div className="flex-1 bg-kobra-green"></div>
          <div className="flex-1 bg-kobra-blue"></div>
          <div className="flex-1 bg-kobra-purple"></div>
          <div className="flex-1 bg-kobra-pink"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-1 text-kobra-teal">{mural.name}</h3>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-kobra-pink" />
          <span className="line-clamp-2">
            {mural.neighborhood && `${mural.neighborhood}, `}
            {mural.municipality && `${mural.municipality}, `}
            {mural.province}
          </span>
        </div>
      </div>
    </div>
  )
}
