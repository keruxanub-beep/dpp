import { Link } from 'react-router-dom';
import { MapPin, Heart, PawPrint } from 'lucide-react';
import { useState } from 'react';
import type { Pet } from '../lib/types';

const speciesLabels: Record<string, string> = {
  dog: 'Собака', cat: 'Кошка', bird: 'Птица', rabbit: 'Кролик', other: 'Другое',
};
const speciesEmoji: Record<string, string> = {
  dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐇', other: '🐾',
};
const statusLabels: Record<string, string> = {
  available: 'Доступен', adopted: 'Усыновлён', pending: 'Ожидание',
};
const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700', adopted: 'bg-gray-100 text-gray-500', pending: 'bg-yellow-100 text-yellow-700',
};

const petImages: Record<string, string> = {
  dog: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=600',
  cat: 'https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=600',
  bird: 'https://images.pexels.com/photos/45853/cockatiel-parrot-yellow-45853.jpeg?auto=compress&cs=tinysrgb&w=600',
  rabbit: 'https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg?auto=compress&cs=tinysrgb&w=600',
  other: 'https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg?auto=compress&cs=tinysrgb&w=600',
};

interface PetCardProps {
  pet: Pet;
  isFavorited?: boolean;
  onToggleFavorite?: (petId: string, isFavorited: boolean) => void;
}

export default function PetCard({ pet, isFavorited = false, onToggleFavorite }: PetCardProps) {
  const defaultImg = pet.image_url || petImages[pet.species] || petImages.other;
  const [imgSrc, setImgSrc] = useState(defaultImg);
  const [imgError, setImgError] = useState(false);

  function handleImgError() {
    if (!imgError) {
      setImgError(true);
      const fallback = petImages[pet.species] || petImages.other;
      if (imgSrc !== fallback) {
        setImgSrc(fallback);
      }
    }
  }

  return (
    <Link
      to={`/pets/${pet.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden bg-orange-50">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={pet.name}
            loading="lazy"
            onError={handleImgError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PawPrint className="w-16 h-16 text-orange-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[pet.status]}`}>
            {statusLabels[pet.status]}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(pet.id, isFavorited);
            }}
            className={`w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
              isFavorited
                ? 'text-red-500 hover:text-red-600 scale-110'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-medium">
            {speciesEmoji[pet.species]} {speciesLabels[pet.species]}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{pet.name}</h3>
        {pet.breed && <p className="text-sm text-gray-500 mt-0.5">{pet.breed}</p>}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span>{pet.age}</span>
          <span>{pet.gender === 'male' ? 'Мальчик' : 'Девочка'}</span>
          {pet.size && <span className="capitalize">{pet.size === 'small' ? 'Маленький' : pet.size === 'medium' ? 'Средний' : 'Большой'}</span>}
        </div>
        <div className="flex items-center gap-1 mt-3 text-sm text-gray-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>{pet.location}</span>
        </div>
      </div>
    </Link>
  );
}
