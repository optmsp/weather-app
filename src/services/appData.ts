/**
 * Service for managing user-specific app data like favorites and history.
 * Communicates with the backend API endpoints.
 */

import type { WeatherData } from './weather';
import { useAuthStore } from '../stores/auth';

export interface HistoryEntry {
  id?: string;
  type: 'search' | 'login';
  userId: string;
  timestamp: string;
  details: {
    query?: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
    success?: boolean;
  };
}

export interface FavoriteLocation {
  id?: string;
  userId: string;
  city: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

/**
 * Fetches user's favorite locations from the backend
 */
export async function getFavorites(): Promise<FavoriteLocation[]> {
  const auth = useAuthStore();
  if (!auth.token) return [];

  try {
    const response = await fetch('/api/favorites', {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch favorites');
    return await response.json();
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

/**
 * Adds a new favorite location
 */
export async function addFavorite(weatherData: WeatherData): Promise<FavoriteLocation | null> {
  const auth = useAuthStore();
  if (!auth.token || !auth.user?.id) return null;

  try {
    const favorite: Omit<FavoriteLocation, 'id'> = {
      userId: auth.user.id,
      city: weatherData.location,
      coordinates: {
        lat: weatherData.coordinates.latitude,
        lon: weatherData.coordinates.longitude
      }
    };

    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify(favorite),
    });

    if (!response.ok) throw new Error('Failed to add favorite');
    return await response.json();
  } catch (error) {
    console.error('Error adding favorite:', error);
    return null;
  }
}

/**
 * Removes a favorite location
 */
export async function removeFavorite(favoriteId: string): Promise<boolean> {
  const auth = useAuthStore();
  if (!auth.token) return false;

  try {
    const response = await fetch(`/api/favorites/${favoriteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      }
    });

    if (!response.ok) throw new Error('Failed to remove favorite');
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
}

/**
 * Fetches user's history entries
 */
export async function getHistory(): Promise<HistoryEntry[]> {
  const auth = useAuthStore();
  if (!auth.token) return [];

  try {
    const response = await fetch('/api/history', {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

/**
 * Adds a new history entry
 */
export async function addHistory(entry: Omit<HistoryEntry, 'id'>): Promise<HistoryEntry | null> {
  const auth = useAuthStore();
  if (!auth.token) return null;

  try {
    const response = await fetch('/api/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) throw new Error('Failed to add history entry');
    return await response.json();
  } catch (error) {
    console.error('Error adding history entry:', error);
    return null;
  }
}
