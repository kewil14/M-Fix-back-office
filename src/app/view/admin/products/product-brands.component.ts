import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, BrandListItem } from 'src/app/core/shared/services/product.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-brands',
  templateUrl: './product-brands.component.html',
  styleUrls: ['./product-brands.component.scss']
})
export class ProductBrandsComponent implements OnInit {

  modalRef?: BsModalRef;

  loading = false;
  error: string | null = null;
  brands: BrandListItem[] = [];

  // filtres & pagination (simples, côté client)
  searchTerm: string = '';
  stateFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ALL';
  currentPage: number = 1;
  pageSize: number = 10;
  selectedWorkspaceId: string = ''; // Nouveau filtre workspace
  showWorkspaceSelectionMessage: boolean = false; // Nouveau

  workspaces$: Observable<WorkspaceDto[]> = of([]); // Liste des workspaces

  get filteredBrands(): BrandListItem[] {
    let result = [...this.brands];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(b =>
        (b.label || '').toLowerCase().includes(term) ||
        (b.description || '').toLowerCase().includes(term)
      );
    }
    if (this.stateFilter !== 'ALL') {
      result = result.filter(b => (b.state || 'ACTIVE') === this.stateFilter);
    }
    return result;
  }

  get pagedBrands(): BrandListItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBrands.slice(start, start + this.pageSize);
  }

  constructor(
    private router: Router,
    private productService: ProductService,
    public mediaUrlService: MediaUrlService,
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
    
    this.loadBrands();
  }

  loadWorkspaces(): void {
    // Utiliser getWorkspaces pour obtenir les vrais workspaces (espaces) au lieu des workspace admins
    this.workspaces$ = this.workspaceService.getWorkspaces({ page: 0, size: 1000, isActive: true }).pipe(
      map(response => {
        if (response.status === 'SUCCESS' && response.data?.content) {
          return response.data.content.map((ws: any) => ({
            id: ws.id,
            name: ws.name,
            adminName: undefined
          }));
        }
        return [];
      })
    );
  }

  loadBrands(): void {
    // Si l'utilisateur est SuperAdmin/Admin et qu'aucun workspace n'est sélectionné, ne pas charger les marques
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !this.selectedWorkspaceId) {
      this.brands = [];
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

    this.productService.getBrands({ workspaceId: finalWorkspaceId }).subscribe({
      next: (response) => {
        if (response && response.status === 'SUCCESS') {
          this.brands = (response.data as BrandListItem[]) || [];
        } else {
          this.error = response?.message || 'Impossible de charger les marques.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Une erreur est survenue lors du chargement des marques.';
        this.loading = false;
      }
    });
  }

  onViewBrand(brand: BrandListItem): void {
    this.router.navigate(['/admin/product-brands/detail', brand.id]);
  }

  onEditBrand(brand: BrandListItem): void {
    this.router.navigate(['/admin/product-brands/edit', brand.id]);
  }

  onDeleteBrand(brand: BrandListItem): void {
    const initialState = {
      title: 'Supprimer la marque',
      message: `Voulez-vous vraiment supprimer la marque "${brand.label}" ?`,
      itemName: brand.label,
      confirmBtnText: 'Supprimer',
      cancelBtnText: 'Annuler'
    };

    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });

    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.productService.deleteBrand(brand.id).subscribe({
            next: () => {
              this.loadBrands();
            }
          });
        }
      });
    }
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
    console.log('[ProductBrandsComponent] Workspace changed, loading brands for workspaceId:', this.selectedWorkspaceId);
    this.loadBrands();
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
    this.loadBrands();
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBrands.length / this.pageSize));
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getVisibleEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.filteredBrands.length ? this.filteredBrands.length : end;
  }
}


