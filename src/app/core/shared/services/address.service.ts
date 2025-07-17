import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { catchError, map, Observable, of, share } from 'rxjs';
import { AddressNominatimResponseDto } from '../dtos/address-nominatim-response-dto';

@Injectable({ providedIn: 'root' })
export class AddressService {

  constructor(
    private http: HttpClient
  ) { }
  
  /**
   * The Service get all address of specific query
   * @param 
   * @returns Observable<Avis>
   */
  getAllAddress(query: string): Observable<AddressNominatimResponseDto[]> {
    return this.http.get<any>(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`)
          .pipe(
            map(response => response.features.map((feat: any) => ({
              label: feat.properties.label,
              city: feat.properties.city,
              postcode: feat.properties.postcode,
              context: feat.properties.context,
              coordinates: feat.geometry.coordinates
            }))),
            catchError(error => {
              console.error('Erreur lors de la recherche d\'adresses', error);
              return of([]);
            })
          );
  }


  
}






		
			
