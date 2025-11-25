import { Injectable } from '@angular/core';
import { API_URLS } from '../../config/app.url.config';

@Injectable({ providedIn: 'root' })
export class MediaUrlService {

  /**
   * Construit l'URL complète d'une image à partir d'un cdnUrl ou fileName
   * @param mediaUrl Le cdnUrl ou fileName du média
   * @returns L'URL complète de l'image ou null si aucune URL n'est fournie
   */
  getMediaUrl(mediaUrl?: string | null): string | null {
    if (!mediaUrl) {
      return null;
    }

    // Si l'URL est déjà complète (commence par http:// ou https://), la retourner telle quelle
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl;
    }

    // Si c'est un cdnUrl relatif, construire l'URL complète
    // Le cdnUrl peut être soit un chemin relatif, soit déjà une URL complète
    if (mediaUrl.startsWith('/')) {
      // Si c'est un chemin absolu, l'ajouter à l'URL de base du media service
      // Enlever le slash initial pour éviter les doubles slashes
      const cleanPath = mediaUrl.startsWith('/') ? mediaUrl.substring(1) : mediaUrl;
      return `${API_URLS.MEDIA_SERVICE_URL}/${cleanPath}`;
    }

    // Si c'est juste un fileName ou un chemin relatif, essayer de construire l'URL
    // D'abord, essayer comme chemin relatif dans le media service
    return `${API_URLS.MEDIA_SERVICE_URL}/${mediaUrl}`;
  }

  /**
   * Récupère l'URL d'un média par son ID
   * @param mediaId L'ID du média
   * @returns L'URL pour récupérer le média
   */
  getMediaUrlById(mediaId: string): string {
    return `${API_URLS.MEDIA_SERVICE_URL}/api/v1/medias/${mediaId}`;
  }

  /**
   * Récupère l'URL de l'image d'un média (pour affichage direct)
   * @param mediaId L'ID du média
   * @returns L'URL pour afficher l'image du média
   */
  getMediaImageUrl(mediaId: string): string {
    return `${API_URLS.MEDIA_SERVICE_URL}/api/v1/medias/${mediaId}/image`;
  }
}

