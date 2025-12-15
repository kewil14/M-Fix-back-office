import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from 'src/app/core/shared/services/product.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ChartComponent } from 'ng-apexcharts';

@Component({
  selector: 'app-product-analytics',
  templateUrl: './product-analytics.component.html',
  styleUrls: ['./product-analytics.component.scss']
})
export class ProductAnalyticsComponent implements OnInit {
  @ViewChild('analyticsChart') chart!: ChartComponent;

  loading = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;


  startDate = '';
  endDate = '';
  workspaceId = '';
  shopId = '';
  selectedMetrics: string[] = ['views', 'sales', 'stock'];
  allMetrics: string[] = ['views', 'sales', 'stock'];

  workspaces: WorkspaceDto[] = [];
  shops: ShopResponseDto[] = [];

  report: any = null;

  // Configuration du diagramme en bande
  chartOptions: any = {};

  constructor(
    private productService: ProductService,
    private shopService: ShopService,
    public permissionService: PermissionService,
    private workspaceService: WorkspaceService,
  ) {}

  ngOnInit(): void {
    this.initDefaultDates();
    
    // Pour WORKSPACE_ADMIN, SHOP_MANAGER et EMPLOYEE, utiliser automatiquement le workspaceId du token
    // Pour ADMIN et SUPER_ADMIN, charger la liste des workspaces pour sélection
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.loadWorkspaces();
    } else {
      // Pour les autres rôles, utiliser le workspaceId du token
      const tokenWorkspaceId = this.permissionService.getWorkspaceId();
      if (tokenWorkspaceId) {
        this.workspaceId = tokenWorkspaceId;
        this.loadShopsForWorkspace();
      }
    }
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
    // Pour ADMIN et SUPER_ADMIN, utiliser getWorkspaces pour obtenir les vrais workspaces (espaces)
    this.workspaceService.getWorkspaces({ page: 0, size: 1000, isActive: true }).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data?.content) {
          this.workspaces = response.data.content.map((ws: any) => ({
            id: ws.id,
            name: ws.name,
            adminName: undefined
          }));
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
          this.updateChart();
        } else {
          this.report = data?.data || data;
          this.successMsg = 'Rapport généré avec succès.';
          this.updateChart();
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la génération du rapport analytique.';
        this.loading = false;
      }
    });
  }

  private updateChart(): void {
    if (!this.report) {
      return;
    }

    // Préparer les données pour le diagramme en bande
    const categories: string[] = [];
    const viewsData: number[] = [];
    const salesData: number[] = [];
    const stockData: number[] = [];

    // Si on a des produits dans le rapport
    if (this.report.top_selling_products && Array.isArray(this.report.top_selling_products)) {
      this.report.top_selling_products.forEach((product: any) => {
        const productName = product.label || product.name || 'Produit inconnu';
        categories.push(productName.length > 20 ? productName.substring(0, 20) + '...' : productName);
        
        if (this.selectedMetrics.includes('views')) {
          viewsData.push(product.views || 0);
        }
        if (this.selectedMetrics.includes('sales')) {
          salesData.push(product.sales || product.quantity || 0);
        }
        if (this.selectedMetrics.includes('stock')) {
          stockData.push(product.available_stock || product.stock || 0);
        }
      });
    }

    // Si on n'a pas de produits mais qu'on a des données agrégées, créer un graphique avec les totaux
    if (categories.length === 0) {
      categories.push('Total');
      if (this.selectedMetrics.includes('views')) {
        viewsData.push(this.report.total_views || 0);
      }
      if (this.selectedMetrics.includes('sales')) {
        salesData.push(this.report.total_sales || 0);
      }
      if (this.selectedMetrics.includes('stock')) {
        stockData.push(0); // Pas de stock total dans le résumé
      }
    }

    // Préparer les séries pour le graphique
    const series: any[] = [];
    const seriesNames: string[] = [];

    if (this.selectedMetrics.includes('views') && viewsData.length > 0) {
      series.push({
        name: 'Vues',
        data: viewsData
      });
      seriesNames.push('Vues');
    }

    if (this.selectedMetrics.includes('sales') && salesData.length > 0) {
      series.push({
        name: 'Ventes',
        data: salesData
      });
      seriesNames.push('Ventes');
    }

    if (this.selectedMetrics.includes('stock') && stockData.length > 0) {
      series.push({
        name: 'Stock',
        data: stockData
      });
      seriesNames.push('Stock');
    }

    // Configuration du diagramme en bande
    this.chartOptions = {
      series: series,
      chart: {
        type: 'bar',
        height: 400,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758']
        }
      },
      xaxis: {
        categories: categories,
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Valeurs'
        }
      },
      title: {
        text: 'Analyse des performances des produits',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val.toLocaleString('fr-FR');
          }
        }
      },
      colors: ['#556ee6', '#34c38f', '#f1b44c']
    };
  }

  /**
   * Gère la sélection/désélection des métriques
   * Sélectionner une métrique sélectionne toutes les autres
   * Désélectionner une métrique désélectionne toutes les autres
   */
  onMetricChange(metric: string, event: any): void {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      // Si on sélectionne une métrique, sélectionner toutes les métriques
      this.selectedMetrics = [...this.allMetrics];
    } else {
      // Si on désélectionne une métrique, désélectionner toutes les métriques
      this.selectedMetrics = [];
    }
  }

  /**
   * Vérifie si une métrique est sélectionnée
   */
  isMetricSelected(metric: string): boolean {
    return this.selectedMetrics.includes(metric);
  }
}


