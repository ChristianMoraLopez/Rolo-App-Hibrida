import { LocationComment, UserReference } from './location-types';
import { Comment, User, Role, AuthProvider } from './types';

export function mapLocationCommentToComment(
  locationComment: LocationComment,
  locationId: string
): Comment {
  // Create a user object matching the Comment type exactly
  const user: User = {
    _id: typeof locationComment.author === 'string'
      ? locationComment.author
      : (locationComment.author as UserReference)?._id || '',
    name: locationComment.authorName || 'Usuario',
    email: typeof locationComment.author === 'object'
      ? (locationComment.author as UserReference)?.email || ''
      : '',
    password: undefined,
    role: 'visitor' as Role, // Explicitly typed as Role
    avatar: typeof locationComment.author === 'object'
      ? (locationComment.author as UserReference)?.avatar || ''
      : '',
    authProvider: 'email' as AuthProvider, // Explicitly typed as AuthProvider
    createdAt: new Date(), // Default creation date
    googleId: undefined,
    location: undefined
  };

  return {
    id: locationComment._id || '',
    content: locationComment.content,
    createdAt: new Date(locationComment.createdAt),
    user,
    locationId
  };
}
