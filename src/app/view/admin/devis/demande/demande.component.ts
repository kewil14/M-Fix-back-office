import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectDemandeState } from 'src/app/core/core.state';
import { Demande } from 'src/app/core/shared/models/demande.modal';
import { findAllDemandes, erreurDemandes, loadDemandes } from 'src/app/core/shared/stores/demande/demande.actions';
import { DemandeState } from 'src/app/core/shared/stores/demande/demande.state';

@Component({
  selector: 'app-demande',
  templateUrl: './demande.component.html',
  styleUrls: ['./demande.component.scss']
})
export class DemandeComponent implements OnInit, OnDestroy {
  
  breadCrumbItems!: Array<{}>;
  demandeState$!: Observable<DemandeState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  // Filtres et pagination
  searchTerm: string = '';
  stateFilter: string = '';
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(
    private storeService: Store,
    private actionService: Actions,
    private router: Router
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Demandes', active: true }];
    this.demandeState$ = this.storeService.select(selectDemandeState).pipe();
    this.actionDemande();
    this.loadDemandes();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  actionDemande(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurDemandes)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(loadDemandes)).subscribe(
        ({demandes}) => {
          console.log('Demandes chargées:', demandes);
        }
      )
    );
  }

  loadDemandes() {
    this.storeService.dispatch(findAllDemandes({
      state: this.stateFilter || undefined,
      page: this.currentPage,
      size: this.pageSize,
      sort: 'dateDemande,desc'
    }));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadDemandes();
  }

  onStateFilterChange(): void {
    this.currentPage = 0;
    this.loadDemandes();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadDemandes();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadDemandes();
  }

  getPageNumbers(state: DemandeState): number[] {
    if (!state || !state.demandes) return [];
    const totalPages = Math.ceil(state.demandes.length / this.pageSize);
    if (totalPages === 0) return [];
    const pages: number[] = [];
    const maxPages = Math.min(5, totalPages);
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get Math() {
    return Math;
  }

  onView(demande: Demande): void {
    // Rediriger vers la page de détail si nécessaire
    // this.router.navigate(['/admin/devis/demande/detail', demande.id]);
  }

  onEdit(demande: Demande): void {
    // Rediriger vers la page d'édition si nécessaire
    // this.router.navigate(['/admin/devis/demande/edit', demande.id]);
  }

  getAddressString(address: any): string {
    if (!address) return 'N/A';
    return `${address.street || ''} ${address.city || ''} ${address.postalCode || ''}`.trim() || 'N/A';
  }
}
