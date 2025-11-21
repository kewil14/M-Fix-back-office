import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectEmployeeState } from 'src/app/core/core.state';
import { UpdateEmployeeDto } from 'src/app/core/shared/dtos/update-employee-dto';
import { findEmployeeById, updateEmployee, setEmployee, erreurEmployees } from 'src/app/core/shared/stores/employee/employee.actions';
import { EmployeeState } from 'src/app/core/shared/stores/employee/employee.state';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';

@Component({
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent implements OnInit, OnDestroy {
  employeeForm: FormGroup;
  submitted = false;
  employeeId: string | null = null;
  currentUserTypeValue: string = '';
  
  employeeState$!: Observable<EmployeeState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  formPopulated: boolean = false;
  isUpdating: boolean = false; // Flag pour distinguer le chargement initial de la mise à jour
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  breadCrumbItems: Array<{}> = [];
  
  workspaces: WorkspaceDto[] = [];
  shops: ShopResponseDto[] = [];
  isLoadingWorkspaces: boolean = false;
  isLoadingShops: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private actionService: Actions,
    private translateService: TranslateService,
    private shopService: ShopService,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.ADMIN') },
      { label: 'Employés', routerLink: '/admin/employees' },
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.EDIT'), active: true }
    ];
    
    this.employeeState$ = this.storeService.select(selectEmployeeState).pipe();
    this.initForm();
    this.actionEmployee();
    this.loadWorkspaces();
    
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.loadEmployee();
      }
    });

    // Charger les shops quand le workspace change
    this.employeeForm.get('workspaceId')?.valueChanges.subscribe(workspaceId => {
      if (workspaceId) {
        this.loadShops(workspaceId);
      } else {
        this.shops = [];
        this.employeeForm.patchValue({ shopId: '' });
      }
    });

    this.subscriptions.push(
      this.employeeState$.subscribe(state => {
        console.log('EmployeeEditComponent - State changed:', {
          dataState: state.dataState,
          employeeId: state.employee?.id,
          currentEmployeeId: this.employeeId,
          formPopulated: this.formPopulated
        });
        
        if (state.dataState === DataStateEnum.SUCCESS && state.employee) {
          if (state.employee.id === this.employeeId && !this.formPopulated) {
            console.log('EmployeeEditComponent - Populating form with employee:', state.employee);
            // Attendre un peu pour s'assurer que le formulaire est initialisé
            setTimeout(() => {
              this.populateForm(state.employee);
              this.formPopulated = true;
            }, 100);
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm() {
    this.employeeForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: [''],
      birthDate: [''],
      preferredLanguage: [''],
      timezone: [''],
      workspaceId: [''],
      shopId: [''],
      roleIds: [[]],
      employeeCode: [''],
      department: [''],
      managerLevel: [''],
      specialization: [''],
      certifications: [''],
      skillLevel: [1, [Validators.min(1), Validators.max(5)]],
      vehicleType: [''],
      licenseNumber: [''],
      deliveryZones: ['']
    });
  }

  populateForm(employee: any): void {
    console.log('Populating form with employee:', employee);
    
    // Sauvegarder le type d'utilisateur
    this.currentUserTypeValue = employee.type || '';
    
    // Formater la date de naissance si elle existe
    let birthDateFormatted = '';
    if (employee.birthDate) {
      try {
        const date = new Date(employee.birthDate);
        if (!isNaN(date.getTime())) {
          birthDateFormatted = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error formatting birthDate:', e);
      }
    }

    // Extraire les IDs des rôles
    const roleIds = employee.roles ? employee.roles.map((r: any) => r.id || r).filter((id: any) => id) : [];

    // Utiliser patchValue pour mettre à jour le formulaire
    this.employeeForm.patchValue({
      email: employee.email || '',
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      phoneNumber: employee.phoneNumber || '',
      birthDate: birthDateFormatted,
      preferredLanguage: employee.preferredLanguage || '',
      timezone: employee.timezone || '',
      workspaceId: employee.workspaceId || '',
      shopId: employee.shopId || '',
      roleIds: roleIds,
      employeeCode: employee.employeeCode || '',
      department: employee.department || '',
      managerLevel: employee.managerLevel || '',
      specialization: employee.specialization || '',
      certifications: employee.certifications || '',
      skillLevel: employee.skillLevel || 1,
      vehicleType: employee.vehicleType || '',
      licenseNumber: employee.licenseNumber || '',
      deliveryZones: employee.deliveryZones || ''
    }, { emitEvent: false });

    // Charger les shops si workspaceId est présent
    if (employee.workspaceId) {
      this.loadShops(employee.workspaceId);
    }

    console.log('Form values after patchValue:', this.employeeForm.value);
    console.log('Current user type:', this.currentUserTypeValue);
  }

  loadEmployee(): void {
    if (this.employeeId) {
      this.storeService.dispatch(findEmployeeById({ employeeId: this.employeeId }));
    }
  }

  loadWorkspaces(): void {
    this.isLoadingWorkspaces = true;
    this.workspaceService.getWorkspaces({ page: 0, size: 1000, isActive: true }).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data?.content) {
          this.workspaces = response.data.content.map(ws => ({
            id: ws.id,
            name: ws.name,
            adminName: undefined
          }));
        }
        this.isLoadingWorkspaces = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des workspaces:', error);
        this.isLoadingWorkspaces = false;
      }
    });
  }

  loadShops(workspaceId: string): void {
    if (!workspaceId) {
      this.shops = [];
      return;
    }
    
    this.isLoadingShops = true;
    this.shopService.getShops(workspaceId).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data) {
          this.shops = response.data;
        } else {
          this.shops = [];
        }
        this.isLoadingShops = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des shops:', error);
        this.shops = [];
        this.isLoadingShops = false;
      }
    });
  }

  actionEmployee() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurEmployees)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
        this.isUpdating = false; // Réinitialiser le flag en cas d'erreur
      }),
      // Écouter updateEmployee pour savoir quand une mise à jour est en cours
      this.actionService.pipe(ofType(updateEmployee)).subscribe(() => {
        this.isUpdating = true; // Marquer qu'une mise à jour est en cours
      }),
      // Rediriger seulement si c'est après une mise à jour (pas après le chargement initial)
      this.actionService.pipe(ofType(setEmployee)).subscribe(() => {
        if (this.isUpdating) {
          // C'est une mise à jour réussie, rediriger vers le détail
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Employé mis à jour avec succès!', dismissible: false}
          );
          setTimeout(() => {
            this.router.navigate(['/admin/employees/detail', this.employeeId]);
          }, 1000);
          this.isUpdating = false; // Réinitialiser le flag
        }
        // Si isUpdating est false, c'est juste le chargement initial, ne pas rediriger
      })
    );
  }

  get f() { return this.employeeForm.controls; }

  get currentUserType(): string {
    return this.currentUserTypeValue;
  }

  onSubmit() {
    this.submitted = true;
    if (this.employeeForm.invalid || !this.employeeId) {
      return;
    }

    const formValue = this.employeeForm.value;
    const updateEmployeeDto: UpdateEmployeeDto = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phoneNumber: formValue.phoneNumber || undefined,
      birthDate: formValue.birthDate || undefined,
      preferredLanguage: formValue.preferredLanguage || undefined,
      timezone: formValue.timezone || undefined,
      shopId: formValue.shopId && formValue.shopId.trim() !== '' ? formValue.shopId.trim() : undefined,
      roleIds: formValue.roleIds || [],
      employeeCode: formValue.employeeCode || undefined,
      department: formValue.department || undefined,
      managerLevel: formValue.managerLevel || undefined,
      specialization: formValue.specialization || undefined,
      certifications: formValue.certifications || undefined,
      skillLevel: formValue.skillLevel || undefined,
      vehicleType: formValue.vehicleType || undefined,
      licenseNumber: formValue.licenseNumber || undefined,
      deliveryZones: formValue.deliveryZones || undefined
    };

    console.log('Updating employee with DTO:', updateEmployeeDto);
    this.storeService.dispatch(updateEmployee({ employeeId: this.employeeId, updateEmployeeDto }));
  }

  onCancel() {
    this.router.navigate(['/admin/employees/detail', this.employeeId]);
  }
}

