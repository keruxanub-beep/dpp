export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string | null;
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large' | null;
  description: string;
  image_url: string | null;
  location: string;
  status: 'available' | 'adopted' | 'pending';
  created_by: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  pet_id: string;
  created_at: string;
}
