import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/core/shared/services/product.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';

@Component({
  selector: 'app-product-analytics',
  templateUrl: './product-analytics.component.html',
  styleUrls: ['./product-analytics.component.scss']
})
export class ProductAnalyticsComponent implements OnInit {

  loading = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;

  // Onglet actif
  activeTab: 'tag' | 'produit' = 'produit';

  startDate = '';
  endDate = '';
  workspaceId = '';
  shopId = '';
  selectedMetrics: string[] = ['views', 'sales', 'stock'];

  workspaces: WorkspaceDto[] = [];
  shops: ShopResponseDto[] = [];

  report: any = null;

  constructor(
    private productService: ProductService,
    private shopService: ShopService,
    private permissionService: PermissionService,
    private workspaceService: WorkspaceService,
  ) {}

  ngOnInit(): void {
    this.initDefaultDates();
    this.loadWorkspaces();
  }

  private initDefaultDates(): void {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    // Format ISO 8601 avec heure (date-time)
    // Début de la journée pour start_date
    weekAgo.setHours(0, 0, 0, 0);
    this.startDate = weekAgo.toISOString();
    
    // Fin de la journée pour end_date
    now.setHours(23, 59, 59, 999);
    this.endDate = now.toISOString();
  }

  private loadWorkspaces(): void {
    this.workspaceService.findAllWorkspaces().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.workspaces = res.data;

          // Pré-sélectionner le workspace du token si présent
          const tokenWorkspaceId = this.permissionService.getWorkspaceId();
          if (tokenWorkspaceId && this.workspaces.some(w => w.id === tokenWorkspaceId)) {
            this.workspaceId = tokenWorkspaceId;
            this.loadShopsForWorkspace();
          }
        }
      },
      error: () => {
        // silencieux
      }
    });
  }

  loadShopsForWorkspace(): void {
    this.shops = [];
    this.shopId = '';

    if (!this.workspaceId) {
      return;
    }

    this.shopService.getShopsByWorkspace(this.workspaceId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.shops = res.data;
        }
      },
      error: () => {
        // silencieux
      }
    });
  }

  // Convertir une date ISO en format datetime-local pour l'input HTML
  getDateTimeLocalValue(dateString: string): string {
    if (!dateString) return '';
    
    // Si c'est déjà au format ISO, extraire la partie date-time
    if (dateString.includes('T')) {
      return dateString.slice(0, 16); // YYYY-MM-DDTHH:mm
    }
    
    // Si c'est au format YYYY-MM-DD, ajouter l'heure 00:00
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString + 'T00:00';
    }
    
    return dateString;
  }

  // Convertir la valeur datetime-local en ISO 8601
  onStartDateChange(value: string): void {
    if (value) {
      const date = new Date(value);
      this.startDate = date.toISOString();
    }
  }

  onEndDateChange(value: string): void {
    if (value) {
      const date = new Date(value);
      // Mettre à la fin de la journée
      date.setHours(23, 59, 59, 999);
      this.endDate = date.toISOString();
    }
  }

  onSubmit(): void {
    this.errorMsg = null;
    this.successMsg = null;
    this.report = null;

    if (!this.startDate || !this.endDate) {
      this.errorMsg = 'Veuillez renseigner une période (date de début et date de fin).';
      return;
    }

    if (!this.shopId) {
      this.errorMsg = 'Veuillez sélectionner une boutique (shop).';
      return;
    }

    this.loading = true;

    // Convertir les dates au format ISO 8601 (date-time) si elles sont au format date simple
    let startDateISO = this.startDate;
    let endDateISO = this.endDate;
    
    // Si les dates sont au format YYYY-MM-DD, les convertir en ISO 8601
    if (this.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const start = new Date(this.startDate);
      start.setHours(0, 0, 0, 0);
      startDateISO = start.toISOString();
    }
    
    if (this.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      endDateISO = end.toISOString();
    }

    // Métriques : par défaut "views,sales,stock" si aucune sélectionnée
    const metrics = (this.selectedMetrics && this.selectedMetrics.length > 0)
      ? this.selectedMetrics.join(',')
      : 'views,sales,stock';

    const params: { start_date: string; end_date: string; shop_id: string; metrics: string } = {
      start_date: startDateISO,
      end_date: endDateISO,
      shop_id: this.shopId,
      metrics: metrics
    };

    this.productService.getAnalyticsReport(params).subscribe({
      next: (data) => {
        if (data && data.status === 'SUCCESS') {
          this.report = data.data || data;
          this.successMsg = 'Rapport généré avec succès.';
        } else {
          this.report = data?.data || data;
          this.successMsg = 'Rapport généré avec succès.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la génération du rapport analytique.';
        this.loading = false;
      }
    });
  }
}


