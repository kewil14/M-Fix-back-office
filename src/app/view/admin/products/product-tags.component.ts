import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, TagListItem } from 'src/app/core/shared/services/product.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';

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
  ) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.loading = true;
    this.error = null;

    this.productService.getTags().subscribe({
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


