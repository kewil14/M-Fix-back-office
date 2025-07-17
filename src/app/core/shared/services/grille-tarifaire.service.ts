import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { RequestResultPaginateDto } from '../dtos/request-result-paginate-dto.modal';
import { GrilleTarifaire } from '../models/grille-tarifaire.modal';
import { GrilleRequestDto } from '../dtos/grille-request-dto.modal';

@Injectable({ providedIn: 'root' })
export class GrilleTarifaireService {

  constructor(
    private http: HttpClient
  ) { }
  
  /**
   * The Service get all the grilles
   * @param 
   * @returns Observable<Grille>
   */
  getAllGrille(): Observable<RequestResultDto<GrilleTarifaire[]>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/grilles`).pipe(share());
  }

  /**
   * The Service get grilles by id
   * @param 
   * @returns Observable<Grille>
   */
  getGrilleById(idGrille: string,): Observable<RequestResultDto<GrilleTarifaire>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/grilles/${idGrille}`).pipe(share());
  }


  /**
   * The Service update the grilles
   * @param 
   * @returns Observable<Grille>
   */
  updateGrille(grille: GrilleRequestDto): Observable<RequestResultDto<GrilleTarifaire>> {
    return this.http.put(API_URLS.CUSTOMERS_URL + `/grilles/update`, grille).pipe(share());
  }

  /**
   * delete grilles
   * @param
   * @returns Observable<RequestResultDto<string>>
   */
  deleteGrille(id: string): Observable<RequestResultDto<string>> {
    return this.http.delete(API_URLS.CUSTOMERS_URL + `/grilles/${id}`).pipe(share());
  }
  
  /**
   * Le service create the grilles
   * @param  
   * @returns
   */
  createGrille(grille: GrilleRequestDto): Observable<RequestResultDto<GrilleTarifaire>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/grilles/create`, grille).pipe(share());
  }

  
}






		
			
