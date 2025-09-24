export interface LocationComment {
  _id?: string;
  author: string; // ID del usuario
  authorName: string;
  content: string;
  createdAt: Date | string;
}

export interface LocationImage {
  _id?: string;
  src: string;
  width: number;
  height: number;
}

export interface UserReference {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const getCreatorName = (createdBy: UserReference | string): string => {
  if (typeof createdBy === 'string') {
    return 'Usuario';
  }
  return createdBy.name;
};

export interface LocationType {
  _id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  sensations: string[];
  smells: string[];
  images: LocationImage[];
  createdAt: Date | string;
  updatedAt?: Date | string;
  createdBy: UserReference | string; // Puede ser el objeto completo o solo el ID
  commentsCount?: number;
  commentsList: LocationComment[];
}

// Tipo para crear una nueva locación (sin _id y campos generados automáticamente)
export interface NewLocation {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  sensations: string[];
  smells: string[];
  images?: File[]; // Para el formulario de creación
}

// Tipo para actualizar una locación
export interface UpdateLocation {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  sensations?: string[];
  smells?: string[];
  keepImages?: string[]; // URLs o IDs de imágenes a conservar
  newImages?: File[]; // Nuevas imágenes a subir
}
