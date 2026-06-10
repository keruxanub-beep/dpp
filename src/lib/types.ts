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

export interface AdoptionRequest {
  id: string;
  user_id: string;
  pet_id: string;
  status: 'pending' | 'approved' | 'rejected';
  full_name: string;
  phone: string;
  email: string;
  home_type: '' | 'apartment' | 'house' | 'other';
  has_other_pets: boolean;
  other_pets_desc: string | null;
  experience: string | null;
  reason: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  pet?: Pet;
  user_profile?: { full_name: string | null; email: string };
}
