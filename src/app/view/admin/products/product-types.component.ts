import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, ProductTypeListItem } from 'src/app/core/shared/services/product.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-types',
  templateUrl: './product-types.component.html',
  styleUrls: ['./product-types.component.scss']
})
export class ProductTypesComponent implements OnInit {

  modalRef?: BsModalRef;

  loading = false;
  error: string | null = null;
  productTypes: ProductTypeListItem[] = [];

  // filtres & pagination
  searchTerm: string = '';
  stateFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ALL';
  currentPage: number = 1;
  pageSize: number = 10;
  selectedWorkspaceId: string = ''; // Nouveau filtre workspace
  showWorkspaceSelectionMessage: boolean = false; // Nouveau

  workspaces$: Observable<WorkspaceDto[]> = of([]); // Liste des workspaces

  get filteredProductTypes(): ProductTypeListItem[] {
    let result = [...this.productTypes];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(pt =>
        (pt.label || '').toLowerCase().includes(term) ||
        (pt.description || '').toLowerCase().includes(term)
      );
    }
    if (this.stateFilter !== 'ALL') {
      result = result.filter(pt => (pt.state || 'ACTIVE') === this.stateFilter);
    }
    return result;
  }

  get pagedProductTypes(): ProductTypeListItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProductTypes.slice(start, start + this.pageSize);
  }

  getVisibleEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProductTypes.length);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredProductTypes.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  constructor(
    private router: Router,
    private productService: ProductService,
    private modalService: BsModalService,
    public permissionService: PermissionService, // Public pour l'utiliser dans le template
    private workspaceService: WorkspaceService, // Injecter WorkspaceService
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces(); // Charger les workspaces

    // Déterminer si le message de sélection de workspace doit être affiché
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.showWorkspaceSelectionMessage = true;
    }
    
    this.loadProductTypes();
  }

  loadWorkspaces(): void {
    this.workspaces$ = this.workspaceService.findAllWorkspaces().pipe(
      map(response => {
        console.log('[ProductTypesComponent] Workspaces loaded:', response);
        return response.status === 'SUCCESS' ? response.data : []
      })
    );
  }

  loadProductTypes(): void {
    // Si l'utilisateur est SuperAdmin/Admin et qu'aucun workspace n'est sélectionné, ne pas charger les types de produits
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !this.selectedWorkspaceId) {
      this.productTypes = [];
      this.showWorkspaceSelectionMessage = true;
      this.loading = false; // Assurez-vous que le loading est à false
      return;
    }
    this.showWorkspaceSelectionMessage = false; // Cacher le message si un workspace est sélectionné ou si l'utilisateur n'est pas SuperAdmin/Admin

    this.loading = true;
    this.error = null;

    // Passer le workspaceId au service
    const finalWorkspaceId = this.selectedWorkspaceId || 
                             (this.permissionService.isWorkspaceAdmin() ? this.permissionService.getWorkspaceId() : undefined);

    this.productService.getProductTypes({ workspace_id: finalWorkspaceId }).subscribe({
      next: (response) => {
        if (response && response.status === 'SUCCESS') {
          // La réponse peut être un tableau ou un objet avec pagination
          if (Array.isArray(response.data)) {
            this.productTypes = response.data;
          } else if (response.data?.content) {
            this.productTypes = response.data.content;
          } else if (response.data?.data) {
            this.productTypes = response.data.data;
          } else {
            this.productTypes = [];
          }
        } else {
          this.error = response?.message || 'Impossible de charger les types de produits.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Une erreur est survenue lors du chargement des types de produits.';
        this.loading = false;
      }
    });
  }

  onViewProductType(pt: ProductTypeListItem): void {
    this.router.navigate(['/admin/product-types/detail', pt.id]);
  }

  onEditProductType(pt: ProductTypeListItem): void {
    this.router.navigate(['/admin/product-types/edit', pt.id]);
  }

  onDeleteProductType(pt: ProductTypeListItem): void {
    const initialState = {
      title: 'Supprimer le type de produit',
      message: `Êtes-vous sûr de vouloir supprimer le type de produit "${pt.label}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, { initialState });

    this.modalRef.content?.onConfirm.subscribe(() => {
      this.productService.deleteProductType(pt.id).subscribe({
        next: () => {
          this.loadProductTypes();
          this.modalRef?.hide();
        },
        error: () => {
          this.error = 'Erreur lors de la suppression du type de produit.';
          this.modalRef?.hide();
        }
      });
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  onWorkspaceChange(): void {
    this.currentPage = 1;
    this.showWorkspaceSelectionMessage = false; // Cacher le message dès qu'un workspace est sélectionné
    console.log('[ProductTypesComponent] Workspace changed, loading product types for workspaceId:', this.selectedWorkspaceId);
    this.loadProductTypes();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.stateFilter = 'ALL';
    this.selectedWorkspaceId = ''; // Réinitialiser le filtre workspace
    this.currentPage = 1;
    
    // Si l'utilisateur est SuperAdmin/Admin, réafficher le message après réinitialisation
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.showWorkspaceSelectionMessage = true;
    }
    this.loadProductTypes();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }
}

