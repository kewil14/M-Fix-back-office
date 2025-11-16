import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectauthentificationState } from 'src/app/core/core.state';
import { AuthentificationState } from 'src/app/core/shared/stores/authentification/authentification.state';
import { 
  createEmployee, 
  createEmployeeOk, 
  erreursAuthentification 
} from 'src/app/core/shared/stores/authentification/authentification.actions';
import { createEmployeeNew, addEmployee, erreurEmployees } from 'src/app/core/shared/stores/employee/employee.actions';
import { CreateEmployeeDto } from 'src/app/core/shared/dtos/create-employee-dto.modal';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss']
})
export class CreateEmployeeComponent implements OnInit, OnDestroy {
  employeeForm: FormGroup;
  submitted = false;
  
  authentificationState$!: Observable<AuthentificationState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  modalRef?: BsModalRef;

  employeeTypes = [
    { value: 'EMPLOYEE', label: 'Employé Standard' },
    { value: 'SHOP_MANAGER', label: 'Manager de Boutique' },
    { value: 'TECHNICIAN', label: 'Technicien' },
    { value: 'DELIVERER', label: 'Livreur' }
  ];

  managerLevels = ['JUNIOR', 'MID', 'SENIOR'];
  vehicleTypes = ['MOTO', 'CAR', 'VAN', 'BIKE'];
  workspaces: WorkspaceDto[] = [];
  isLoadingWorkspaces: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private storeService: Store,
    private actionService: Actions,
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private workspaceService: WorkspaceService
  ) {
    this.modalRef = bsModalRef;
  }

  ngOnInit() {
    this.authentificationState$ = this.storeService.select(selectauthentificationState).pipe();
    this.initForm();
    this.actionEmployee();
    this.loadWorkspaces();
    
    this.employeeForm.get('userType')?.valueChanges.subscribe(type => {
      this.updateFormValidation(type);
    });
  }

  loadWorkspaces(): void {
    this.isLoadingWorkspaces = true;
    this.workspaceService.findAllWorkspaces().subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data) {
          this.workspaces = response.data;
        }
        this.isLoadingWorkspaces = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des workspaces:', error);
        this.isLoadingWorkspaces = false;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm(): void {
    this.employeeForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userType: ['EMPLOYEE', [Validators.required]],
      workspaceId: ['', [Validators.required]],
      shopId: [''],
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

  updateFormValidation(userType: string) {
    const employeeCode = this.employeeForm.get('employeeCode');
    const managerLevel = this.employeeForm.get('managerLevel');
    const specialization = this.employeeForm.get('specialization');
    const vehicleType = this.employeeForm.get('vehicleType');
    const licenseNumber = this.employeeForm.get('licenseNumber');

    employeeCode?.clearValidators();
    managerLevel?.clearValidators();
    specialization?.clearValidators();
    vehicleType?.clearValidators();
    licenseNumber?.clearValidators();
    if (userType === 'EMPLOYEE') {
      employeeCode?.setValidators([Validators.required]);
    } else if (userType === 'SHOP_MANAGER') {
      managerLevel?.setValidators([Validators.required]);
    } else if (userType === 'TECHNICIAN') {
      specialization?.setValidators([Validators.required]);
    } else if (userType === 'DELIVERER') {
      vehicleType?.setValidators([Validators.required]);
      licenseNumber?.setValidators([Validators.required]);
    }

    employeeCode?.updateValueAndValidity();
    managerLevel?.updateValueAndValidity();
    specialization?.updateValueAndValidity();
    vehicleType?.updateValueAndValidity();
    licenseNumber?.updateValueAndValidity();
  }

  get f() {
    return this.employeeForm.controls;
  }

  get currentUserType() {
    return this.employeeForm.get('userType')?.value;
  }

  actionEmployee(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreursAuthentification)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),

      this.actionService.pipe(ofType(createEmployeeOk)).subscribe(
        ({user}) => {
          console.log('Employé créé avec succès:', user);
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Employé créé avec succès! Un email d\'invitation a été envoyé.', dismissible: false}
          );
          setTimeout(() => {
            this.bsModalRef.hide();
            this.employeeForm.reset();
            this.submitted = false;
          }, 2000);
        }
      ),
      this.actionService.pipe(ofType(addEmployee)).subscribe(
        ({employee}) => {
          console.log('Employé créé avec succès:', employee);
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Employé créé avec succès! Un email d\'invitation a été envoyé.', dismissible: false}
          );
          setTimeout(() => {
            this.bsModalRef.hide();
            this.employeeForm.reset();
            this.submitted = false;
          }, 2000);
        }
      ),
      this.actionService.pipe(ofType(erreurEmployees)).subscribe(
        ({messages}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
          );
        }
      )
    );
  }

  onSubmit() {
    this.submitted = true;

    if (this.employeeForm.invalid) {
      return;
    }

    const formValue = this.employeeForm.value;
    const createEmployeeDto: CreateEmployeeDto = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      userType: formValue.userType,
      workspaceId: formValue.workspaceId,
      shopId: formValue.shopId || undefined,
      roleIds: []
    };

    if (formValue.userType === 'EMPLOYEE') {
      createEmployeeDto.employeeCode = formValue.employeeCode;
      createEmployeeDto.department = formValue.department;
    } else if (formValue.userType === 'SHOP_MANAGER') {
      createEmployeeDto.managerLevel = formValue.managerLevel;
    } else if (formValue.userType === 'TECHNICIAN') {
      createEmployeeDto.specialization = formValue.specialization;
      createEmployeeDto.certifications = formValue.certifications;
      createEmployeeDto.skillLevel = formValue.skillLevel;
    } else if (formValue.userType === 'DELIVERER') {
      createEmployeeDto.vehicleType = formValue.vehicleType;
      createEmployeeDto.licenseNumber = formValue.licenseNumber;
      createEmployeeDto.deliveryZones = formValue.deliveryZones;
    }

    this.storeService.dispatch(createEmployeeNew({createEmployeeDto}));
  }

  closeModal() {
    this.bsModalRef.hide();
    this.employeeForm.reset();
    this.submitted = false;
  }
}

