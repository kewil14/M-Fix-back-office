import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, TagListItem } from 'src/app/core/shared/services/product.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit {

  tagId: string | null = null;
  isEditMode = false;

  loading = false;
  saving = false;
  loadError: string | null = null;
  saveError: string | null = null;
  saveSuccess: string | null = null;

  // Workspace selection
  workspaces$: Observable<WorkspaceDto[]> = of([]);
  selectedWorkspaceId: string = '';
  showWorkspaceSelectionMessage: boolean = false;

  label = '';
  slug = '';
  description = '';
  state: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ACTIVE';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private workspaceService: WorkspaceService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tagId = id;
      this.isEditMode = true;
      this.loadTag(id);
    }
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

    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.showWorkspaceSelectionMessage = true;
    } else {
      const tokenWorkspaceId = this.permissionService.getWorkspaceId();
      if (tokenWorkspaceId) {
        this.selectedWorkspaceId = tokenWorkspaceId;
        this.showWorkspaceSelectionMessage = false;
      } else {
        this.showWorkspaceSelectionMessage = true;
      }
    }
  }

  onWorkspaceChange(): void {
    if (this.selectedWorkspaceId) {
      this.showWorkspaceSelectionMessage = false;
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/product-tags']);
  }

  loadTag(id: string): void {
    this.loading = true;
    this.loadError = null;

    this.productService.getTagById(id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          const tag: TagListItem = res.data as TagListItem;
          this.label = tag.label;
          this.slug = tag.slug;
          this.description = tag.description || '';
          this.state = (tag.state as any) || 'ACTIVE';
          if (this.isEditMode) {
            this.selectedWorkspaceId = (tag as any).workspace_id;
            this.showWorkspaceSelectionMessage = false;
          }
        } else {
          this.loadError = res?.message || 'Impossible de charger le tag.';
        }
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement du tag.';
        this.loading = false;
      }
    });
  }

  onSlugChange(): void {
    // Générer automatiquement le slug à partir du label
    this.slug = this.label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  onSubmit(): void {
    this.saveError = null;
    this.saveSuccess = null;

    if (!this.selectedWorkspaceId) {
      this.saveError = 'Veuillez sélectionner un workspace.';
      return;
    }

    if (!this.label.trim() || !this.slug.trim()) {
      this.saveError = 'Le label et le slug sont obligatoires.';
      return;
    }

    const body: any = {
      label: this.label.trim(),
      slug: this.slug.trim(),
      description: this.description?.trim() || undefined,
      state: this.state,
      workspace_id: this.selectedWorkspaceId,
    };

    this.saving = true;

    const obs = this.isEditMode && this.tagId
      ? this.productService.updateTag(this.tagId, body)
      : this.productService.createTag(body);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = this.isEditMode
          ? 'Tag mis à jour avec succès.'
          : 'Tag créé avec succès.';
        if (!this.isEditMode) {
          setTimeout(() => {
            this.router.navigate(['/admin/product-tags']);
          }, 1500);
        }
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || (this.isEditMode
          ? 'Erreur lors de la mise à jour du tag.'
          : 'Erreur lors de la création du tag.');
      }
    });
  }
}






