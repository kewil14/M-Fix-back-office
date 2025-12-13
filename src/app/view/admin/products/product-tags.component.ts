import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, TagListItem } from 'src/app/core/shared/services/product.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-tags',
  templateUrl: './product-tags.component.html',
  styleUrls: ['./product-tags.component.scss']
})
export class ProductTagsComponent implements OnInit {

  modalRef?: BsModalRef;

  loading = false;
  error: string | null = null;
  tags: TagListItem[] = [];

  // filtres & pagination
  searchTerm: string = '';
  stateFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ALL';
  currentPage: number = 1;
  pageSize: number = 10;
  selectedWorkspaceId: string = ''; // Nouveau filtre workspace
  showWorkspaceSelectionMessage: boolean = false; // Nouveau

  workspaces$: Observable<WorkspaceDto[]> = of([]); // Liste des workspaces

  get filteredTags(): TagListItem[] {
    let result = [...this.tags];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t =>
        (t.label || '').toLowerCase().includes(term) ||
        (t.slug || '').toLowerCase().includes(term) ||
        (t.description || '').toLowerCase().includes(term)
      );
    }
    if (this.stateFilter !== 'ALL') {
      result = result.filter(t => (t.state || 'ACTIVE') === this.stateFilter);
    }
    return result;
  }

  get pagedTags(): TagListItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTags.slice(start, start + this.pageSize);
  }

  getVisibleEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredTags.length);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredTags.length / this.pageSize);
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
    
    this.loadTags();
  }

  loadWorkspaces(): void {
    this.workspaces$ = this.workspaceService.findAllWorkspaces().pipe(
      map(response => {
        console.log('[ProductTagsComponent] Workspaces loaded:', response);
        return response.status === 'SUCCESS' ? response.data : []
      })
    );
  }

  loadTags(): void {
    // Si l'utilisateur est SuperAdmin/Admin et qu'aucun workspace n'est sélectionné, ne pas charger les tags
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !this.selectedWorkspaceId) {
      this.tags = [];
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

    this.productService.getTags({ state: this.stateFilter === 'ALL' ? undefined : this.stateFilter, workspaceId: finalWorkspaceId }).subscribe({
      next: (response) => {
        if (response && response.status === 'SUCCESS') {
          this.tags = (response.data as TagListItem[]) || [];
        } else {
          this.error = response?.message || 'Impossible de charger les tags.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Une erreur est survenue lors du chargement des tags.';
        this.loading = false;
      }
    });
  }

  onViewTag(tag: TagListItem): void {
    this.router.navigate(['/admin/product-tags/detail', tag.id]);
  }

  onEditTag(tag: TagListItem): void {
    this.router.navigate(['/admin/product-tags/edit', tag.id]);
  }

  onDeleteTag(tag: TagListItem): void {
    const initialState = {
      title: 'Supprimer le tag',
      message: `Êtes-vous sûr de vouloir supprimer le tag "${tag.label}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, { initialState });

    this.modalRef.content?.onConfirm.subscribe(() => {
      this.productService.deleteTag(tag.id).subscribe({
        next: () => {
          this.loadTags();
          this.modalRef?.hide();
        },
        error: () => {
          this.error = 'Erreur lors de la suppression du tag.';
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
    console.log('[ProductTagsComponent] Workspace changed, loading tags for workspaceId:', this.selectedWorkspaceId);
    this.loadTags();
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
    this.loadTags();
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