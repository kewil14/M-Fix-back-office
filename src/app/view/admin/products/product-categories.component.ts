import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, CategoryTreeItem } from 'src/app/core/shared/services/product.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-categories',
  templateUrl: './product-categories.component.html',
  styleUrls: ['./product-categories.component.scss']
})
export class ProductCategoriesComponent implements OnInit {

  modalRef?: BsModalRef;

  loading = false;
  error: string | null = null;
  categories: CategoryTreeItem[] = [];

  // liste aplatie pour l'affichage
  flatCategories: { id: string; labelPath: string; raw: CategoryTreeItem }[] = [];

  // filtres & pagination
  searchTerm: string = '';
  stateFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ALL';
  currentPage: number = 1;
  pageSize: number = 10;
  selectedWorkspaceId: string = ''; // Nouveau filtre workspace
  showWorkspaceSelectionMessage: boolean = false; // Nouveau

  workspaces$: Observable<WorkspaceDto[]> = of([]); // Liste des workspaces

  get filteredCategories(): { id: string; labelPath: string; raw: CategoryTreeItem }[] {
    let result = [...this.flatCategories];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.labelPath.toLowerCase().includes(term) ||
        (c.raw.description || '').toLowerCase().includes(term)
      );
    }
    if (this.stateFilter !== 'ALL') {
      result = result.filter(c => (c.raw.state || 'ACTIVE') === this.stateFilter);
    }
    return result;
  }

  get pagedCategories(): { id: string; labelPath: string; raw: CategoryTreeItem }[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCategories.slice(start, start + this.pageSize);
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
    
    this.loadCategories();
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

  loadCategories(): void {
    // Si l'utilisateur est SuperAdmin/Admin et qu'aucun workspace n'est sélectionné, ne pas charger les catégories
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !this.selectedWorkspaceId) {
      this.categories = [];
      this.flatCategories = [];
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

    this.productService.getCategoriesTree({ workspaceId: finalWorkspaceId }).subscribe({
      next: (response) => {
        if (response && response.status === 'SUCCESS') {
          this.categories = (response.data as CategoryTreeItem[]) || [];
          this.flatCategories = [];
          (this.categories || []).forEach(cat => this.flattenCategory(cat));
        } else {
          this.error = response?.message || 'Impossible de charger les catégories.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Une erreur est survenue lors du chargement des catégories.';
        this.loading = false;
      }
    });
  }

  private flattenCategory(cat: CategoryTreeItem, prefix: string = ''): void {
    const labelPath = prefix ? `${prefix} / ${cat.label}` : cat.label;
    this.flatCategories.push({ id: cat.id, labelPath, raw: cat });
    if (cat.subcategories && cat.subcategories.length) {
      cat.subcategories.forEach(sub => this.flattenCategory(sub, labelPath));
    }
  }

  onViewCategory(cat: { id: string; labelPath: string; raw: CategoryTreeItem }): void {
    this.router.navigate(['/admin/product-categories/detail', cat.id]);
  }

  onEditCategory(cat: { id: string; labelPath: string; raw: CategoryTreeItem }): void {
    this.router.navigate(['/admin/product-categories/edit', cat.id]);
  }

  onDeleteCategory(cat: { id: string; labelPath: string; raw: CategoryTreeItem }): void {
    const initialState = {
      title: 'Supprimer la catégorie',
      message: `Voulez-vous vraiment supprimer la catégorie "${cat.labelPath}" ?`,
      itemName: cat.labelPath,
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
          this.productService.deleteCategory(cat.id).subscribe({
            next: () => {
              this.loadCategories();
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
    console.log('[ProductCategoriesComponent] Workspace changed, loading categories for workspaceId:', this.selectedWorkspaceId);
    this.loadCategories();
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
    this.loadCategories();
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCategories.length / this.pageSize));
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getVisibleEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.filteredCategories.length ? this.filteredCategories.length : end;
  }
}


