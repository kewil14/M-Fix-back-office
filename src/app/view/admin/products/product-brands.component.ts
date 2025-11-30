import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, BrandListItem } from 'src/app/core/shared/services/product.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';

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
  ) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading = true;
    this.error = null;

    this.productService.getBrands().subscribe({
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


