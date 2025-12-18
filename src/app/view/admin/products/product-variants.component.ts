import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService, ProductDetail, ProductListItem, ProductSearchParams } from 'src/app/core/shared/services/product.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-product-variants',
  templateUrl: './product-variants.component.html',
  styleUrls: ['./product-variants.component.scss']
})
export class ProductVariantsComponent implements OnInit {

  loading = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;

  products: ProductListItem[] = [];
  productSearch: string = '';
  selectedProductId: string = '';
  product: ProductDetail | null = null;
  variants: any[] = [];

  // Workspace selection
  workspaces$: Observable<WorkspaceDto[]> = of([]);
  selectedWorkspaceId: string = '';
  showWorkspaceSelectionMessage: boolean = false;
  isSuperAdmin: boolean = false;
  isAdmin: boolean = false;
  isAdminOrSuperAdmin: boolean = false;
  isLoadingWorkspaces: boolean = false;

  // Modal pour le formulaire variant
  @ViewChild('variantModal') variantModalTemplate!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModalTemplate!: TemplateRef<any>;
  modalRef?: BsModalRef;
  deleteModalRef?: BsModalRef;
  editingVariantId: string | null = null;
  variantToDelete: any = null;
  variantLabel: string = '';
  variantDescription: string = '';
  variantPrice: number | null = null;
  variantSku: string = '';
  variantBarcode: string = '';
  variantState: string = 'ACTIVE';

  constructor(
    private productService: ProductService,
    public permissionService: PermissionService,
    private workspaceService: WorkspaceService,
    private modalService: BsModalService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérifier si c'est un super admin ou admin
    this.isSuperAdmin = this.permissionService.isSuperAdmin();
    this.isAdmin = this.permissionService.isAdmin();
    this.isAdminOrSuperAdmin = this.isSuperAdmin || this.isAdmin;
    
    // Récupérer workspaceId depuis le token
    this.selectedWorkspaceId = this.permissionService.getWorkspaceId() || '';
    
    this.loadWorkspaces();
    
    // Si admin/super admin, charger les workspaces puis charger les produits
    // Si non-admin et workspaceId existe, charger directement les produits
    if (this.isAdminOrSuperAdmin) {
      if (!this.selectedWorkspaceId) {
        this.showWorkspaceSelectionMessage = true;
      }
    } else if (this.selectedWorkspaceId) {
      this.loadProducts();
    }
    
    // Vérifier les paramètres de requête pour ouvrir le modal d'édition
    this.route.queryParams.subscribe(params => {
      if (params['productId'] && params['variantId']) {
        this.selectedProductId = params['productId'];
        this.loadVariants();
        // Attendre que les variants soient chargés avant d'ouvrir le modal
        setTimeout(() => {
          const variant = this.variants.find((v: any) => v.id === params['variantId']);
          if (variant && this.variantModalTemplate) {
            this.openVariantModal(this.variantModalTemplate, variant);
          }
        }, 1000);
      }
    });
  }

  loadWorkspaces(): void {
    // Si admin/super admin, charger la liste des workspaces
    if (this.isAdminOrSuperAdmin) {
      this.isLoadingWorkspaces = true;
      // Utiliser getWorkspaces pour obtenir les vrais workspaces (espaces) au lieu des workspace admins
      this.workspaces$ = this.workspaceService.getWorkspaces({ page: 0, size: 1000, isActive: true }).pipe(
        map(response => {
          this.isLoadingWorkspaces = false;
          if (response.status === 'SUCCESS' && response.data?.content) {
            const workspaces = response.data.content.map((ws: any) => ({
              id: ws.id,
              name: ws.name,
              adminName: undefined
            }));
            // Utiliser le workspaceId du token s'il existe, sinon le premier workspace
            const tokenWorkspaceId = this.permissionService.getWorkspaceId();
            if (tokenWorkspaceId && workspaces.some(ws => ws.id === tokenWorkspaceId)) {
              this.selectedWorkspaceId = tokenWorkspaceId;
              this.showWorkspaceSelectionMessage = false;
              this.loadProducts();
            } else if (workspaces.length > 0 && !this.selectedWorkspaceId) {
              this.selectedWorkspaceId = workspaces[0].id;
              this.showWorkspaceSelectionMessage = false;
              this.loadProducts();
            }
            return workspaces;
          }
          return [];
        })
      );
    }
  }

  onWorkspaceChange(): void {
    if (this.selectedWorkspaceId) {
      this.showWorkspaceSelectionMessage = false;
      // Réinitialiser les sélections précédentes
      this.productSearch = '';
      this.selectedProductId = '';
      this.product = null;
      this.variants = [];
      this.resetVariantForm();
      // Recharger les produits pour le nouveau workspace
      this.loadProducts();
    } else {
      this.productSearch = '';
      this.products = [];
      this.selectedProductId = '';
      this.product = null;
      this.variants = [];
      this.resetVariantForm();
    }
  }

  loadProducts(): void {
    // Si l'utilisateur est SuperAdmin/Admin et qu'aucun workspace n'est sélectionné, ne pas charger les produits
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !this.selectedWorkspaceId) {
      this.products = [];
      this.showWorkspaceSelectionMessage = true;
      return;
    }
    this.showWorkspaceSelectionMessage = false;

    const params: ProductSearchParams = {
      q: this.productSearch || undefined,
      state: 'ACTIVE',
      page: 1,
      page_size: 50,
      workspace_id: this.selectedWorkspaceId || undefined
    };
    
    this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products = res.data || [];
      },
      error: (err) => {
        console.error('[ProductVariantsComponent] Error loading products:', err);
        this.errorMsg = 'Erreur lors du chargement des produits.';
      }
    });
  }

  loadVariants(): void {
    this.errorMsg = null;
    this.successMsg = null;
    this.product = null;
    this.variants = [];
    this.resetVariantForm();

    if (!this.selectedProductId) {
      this.errorMsg = 'Veuillez sélectionner un produit.';
      return;
    }

    this.loading = true;

    // Charger le produit et les variants en parallèle
    let productLoaded = false;
    let variantsLoaded = false;

    const checkComplete = () => {
      if (productLoaded && variantsLoaded) {
        this.loading = false;
      }
    };

    this.productService.getProductById(this.selectedProductId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.product = res.data as ProductDetail;
        } else {
          this.errorMsg = res?.message || 'Erreur lors du chargement du produit.';
        }
        productLoaded = true;
        checkComplete();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du chargement du produit.';
        productLoaded = true;
        checkComplete();
      }
    });

    this.productService.getVariantsForProduct(this.selectedProductId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          // le backend peut retourner data = [] ou un objet; on force en tableau
          const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
          this.variants = data || [];
        } else {
          this.errorMsg = res?.message || 'Impossible de charger les variants du produit.';
        }
        variantsLoaded = true;
        checkComplete();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du chargement des variants.';
        variantsLoaded = true;
        checkComplete();
      }
    });
  }

  openVariantModal(template: TemplateRef<any>, variant?: any): void {
    this.errorMsg = null;
    this.successMsg = null;
    
    if (variant) {
      // Mode édition
      this.editingVariantId = variant.id || null;
      this.variantLabel = variant.label || '';
      this.variantDescription = variant.description || '';
      this.variantPrice = variant.price ?? null;
      this.variantSku = variant.sku || '';
      this.variantBarcode = variant.barcode || '';
      this.variantState = variant.state || 'ACTIVE';
    } else {
      // Mode création
      this.resetVariantForm();
    }
    
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg',
      backdrop: 'static'
    });
  }

  resetVariantForm(): void {
    this.editingVariantId = null;
    this.variantLabel = '';
    this.variantDescription = '';
    this.variantPrice = null;
    this.variantSku = '';
    this.variantBarcode = '';
    this.variantState = 'ACTIVE';
  }

  saveVariant(): void {
    this.successMsg = null;
    this.errorMsg = null;

    if (!this.selectedProductId) {
      this.errorMsg = 'Veuillez d\'abord sélectionner un produit.';
      return;
    }

    if (!this.variantLabel || this.variantPrice === null || !this.variantSku) {
      this.errorMsg = 'Merci de renseigner au minimum le label, le prix et le SKU du variant.';
      return;
    }

    const body: any = {
      label: this.variantLabel,
      description: this.variantDescription || undefined,
      price: this.variantPrice,
      sku: this.variantSku,
      barcode: this.variantBarcode || undefined,
      state: this.variantState || 'ACTIVE',
    };

    this.loading = true;

    const obs = this.editingVariantId
      ? this.productService.updateVariant(this.selectedProductId, this.editingVariantId, body)
      : this.productService.createVariant(this.selectedProductId, body);

    obs.subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.successMsg = this.editingVariantId
            ? 'Variant mis à jour avec succès.'
            : 'Variant créé avec succès.';
          this.resetVariantForm();
          this.modalRef?.hide();
          this.loadVariants();
        } else {
          this.errorMsg = res?.message || 'Erreur lors de l\'enregistrement du variant.';
          this.loading = false;
        }
      },
      error: () => {
        this.errorMsg = 'Erreur lors de l\'enregistrement du variant.';
        this.loading = false;
      }
    });
  }

  onViewVariant(variant: any): void {
    if (variant?.id && this.selectedProductId) {
      this.router.navigate(['/admin/product-variants/detail', this.selectedProductId, variant.id]);
    }
  }

  openDeleteModal(template: TemplateRef<any>, variant: any): void {
    if (!variant?.id) {
      this.errorMsg = 'Variant invalide.';
      return;
    }
    
    this.variantToDelete = variant;
    this.errorMsg = null;
    this.successMsg = null;
    
    this.deleteModalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered',
      backdrop: 'static'
    });
  }

  confirmDelete(): void {
    if (!this.selectedProductId || !this.variantToDelete?.id) {
      this.errorMsg = 'Produit ou variant invalide.';
      this.deleteModalRef?.hide();
      return;
    }

    this.loading = true;

    this.productService.deleteVariant(this.selectedProductId, this.variantToDelete.id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.successMsg = `Variant "${this.variantToDelete.label}" supprimé avec succès.`;
          this.deleteModalRef?.hide();
          this.variantToDelete = null;
          this.loadVariants();
        } else {
          this.errorMsg = res?.message || 'Erreur lors de la suppression du variant.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la suppression du variant.';
        this.loading = false;
      }
    });
  }

  cancelDelete(): void {
    this.deleteModalRef?.hide();
    this.variantToDelete = null;
  }
}
