import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subscription} from 'rxjs';
import { AuthorisationKeyEnum, OperationEnum, DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectRoleState } from 'src/app/core/core.state';
import { CreateRoleDto } from 'src/app/core/shared/dtos/create-role-dto';
import { RoleFin } from 'src/app/core/shared/models/users/role-fin.modal';
import { addRole, createRoleAdmin, erreurRoles, createRoleNew } from 'src/app/core/shared/stores/role/role.actions';
import { CreateRoleRequestDto } from 'src/app/core/shared/dtos/create-role-request-dto';
import { RoleState } from 'src/app/core/shared/stores/role/role.state';



@Component({
  selector: 'loto-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {
  
  @Input() role$!: BehaviorSubject<{role: RoleFin, operation: string}>;
  // @Input() category$!: BehaviorSubject<{category: Category, operation: string}>;
  @Input() loading$!: BehaviorSubject<boolean>;
  @Output() onRole = new EventEmitter<{role: RoleFin, operation: string}>();
  // @Output() onCategory = new EventEmitter<{category: Category, operation: string}>();
  selectedItems: any[] = [];
  roleForm!: FormGroup;
  isRoleSubmitted: boolean = false;
  operattion: string = OperationEnum.CREATE;
  currentRole: RoleFin = {};
  selectedPermissionIds: string[] = [];

  autorisationState$: Observable<RoleState>;

  subscriptions: Subscription[] = [];


  // currentCategory: Category = {};
  operationEnum: typeof OperationEnum = OperationEnum;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
   AuthorisationKeyEnumArray = [
    { name: 'ADD_DOCUMENT_TO_USER', value: 'ADD_DOCUMENT_TO_USER' },
    { name: 'BLOCK_USER', value: 'BLOCK_USER' },
    { name: 'CREATE_ADDRESS', value: 'CREATE_ADDRESS' },
    { name: 'CREATE_ROLE', value: 'CREATE_ROLE' },
    { name: 'CREATE_SAAS_USER', value: 'CREATE_SAAS_USER' },
    { name: 'CREATE_USER', value: 'CREATE_USER' },
    { name: 'DELETE_ADDRESS', value: 'DELETE_ADDRESS' },
    { name: 'DELETE_ROLE', value: 'DELETE_ROLE' },
    { name: 'DELETE_SAAS_USER', value: 'DELETE_SAAS_USER' },
    { name: 'DELETE_USER', value: 'DELETE_USER' },
    { name: 'GET_ALL_ADDRESS', value: 'GET_ALL_ADDRESS' },
    { name: 'GET_ALL_AUTHORISATIONS', value: 'GET_ALL_AUTHORISATIONS' },
    { name: 'GET_ALL_SAAS_USERS', value: 'GET_ALL_SAAS_USERS' },
    { name: 'GET_DOCUMENT_OF_USER', value: 'GET_DOCUMENT_OF_USER' },
    { name: 'GET_MY_ADDRESS', value: 'GET_MY_ADDRESS' },
    { name: 'GET_ROLE', value: 'GET_ROLE' },
    { name: 'GET_SAAS_USER', value: 'GET_SAAS_USER' },
    { name: 'GET_USERS', value: 'GET_USERS' },
    { name: 'GET_USER_DETAILS', value: 'GET_USER_DETAILS' },
    { name: 'NOT_SPECIFY', value: 'NOT_SPECIFY' },
    { name: 'REMOVE_DOCUMENT_TO_USER', value: 'REMOVE_DOCUMENT_TO_USER' },
    { name: 'UNBLOCK_USER', value: 'UNBLOCK_USER' },
    { name: 'UPDATE_ADDRESS', value: 'UPDATE_ADDRESS' },
    { name: 'UPDATE_MY_INFOS', value: 'UPDATE_MY_INFOS' },
    { name: 'UPDATE_PASSWORD', value: 'UPDATE_PASSWORD' },
    { name: 'UPDATE_ROLE', value: 'UPDATE_ROLE' },
    { name: 'UPDATE_SAAS_USER', value: 'UPDATE_SAAS_USER' },
    { name: 'UPDATE_USER', value: 'UPDATE_USER' }
  ];


Groups:typeof AuthorisationKeyEnum  = AuthorisationKeyEnum
  constructor(
    private fb: FormBuilder,
    private storeService: Store,
    private router: Router,
    private toastr: ToastrService,
    private actionService: Actions,
    
  ) {}

  ngOnInit(): void {

    this.autorisationState$ = this.storeService.select(selectRoleState);
   
    this.initCreateRole();
    if(this.role$){
      this.role$.subscribe((data) => {
          this.operattion = data.operation;
          this.currentRole = data.role;
          if(data.operation == OperationEnum.CREATE) {
            this.initCreateRole();
          } else {
            this.editRole(data.role);
          }
        });
    }else{
      // this.category$.subscribe((data) => {
      //     this.operattion = data.operation;
      //     this.currentCategory = data.category;
      //     if(data.operation == OperationEnum.CREATE) {
      //       this.initCreateRole();
      //     } else {
      //       this.editCategory(data.category);
      //     }
      //   });
    }
    // this.role$.subscribe((data) => {
    //   this.operattion = data.operation;
    //   this.currentRole = data.role;
    //   if(data.operation == OperationEnum.CREATE) {
    //     this.initCreateRole();
    //   } else {
    //     this.editRole(data.role);
    //   }
    // });
    // this.category$.subscribe((data) => {
    //   this.operattion = data.operation;
    //   this.currentCategory = data.category;
    //   if(data.operation == OperationEnum.CREATE) {
    //     this.initCreateRole();
    //   } else {
    //     this.editCategory(data.category);
    //   }
    // });
    this.actionRole();
  }


  actionRole(){
        this.subscriptions.push(
          this.actionService.pipe(ofType(addRole)).subscribe((state) => {
            this.toastr.success('Rôle créé avec succès !');
            setTimeout(() => {
              // je redirige vers la liste complète des rôles
              this.router.navigate(['/admin/autorisation/role']);
            }, 2000)
          }),
          
          this.actionService.pipe(ofType(createRoleNew)).subscribe(() => {
            // L'effet gère déjà la redirection, mais on peut ajouter un toast ici si nécessaire
          }),
  
          this.actionService.pipe(ofType(erreurRoles)).subscribe(({messages}) => {
            // envoyer une popup d'erreur   
            this.toastr.error(messages || 'Une erreur est survenue lors de la création du rôle');
          }),
      )
    }
  getAuthorisationKeys(): string[] {
    return Object.values(AuthorisationKeyEnum);
  }

  createRole(){
    if(this.roleForm.invalid) {
      return;
    }
    
    // Générer le code à partir du nom du rôle si non fourni, sinon formater le code saisi
    let code = this.roleForm.value.code;
    if (!code || code.trim() === '') {
      // Générer le code à partir du nom du rôle
      code = this.generateRoleCodeFromName(this.roleForm.value.name);
    } else {
      // Formater le code saisi pour respecter le format requis (MAJUSCULES_AVEC_UNDERSCORES)
      code = this.formatCodeToUpperCase(code);
    }
    
    // Mapper les authorisationKeys vers permissionIds
    const permissionIds = this.roleForm.value.authorisationKeys || [];
    
    const form: CreateRoleRequestDto = {
      name: this.roleForm.value.name,
      code: code,
      description: this.roleForm.value.description || '',
      permissionIds: permissionIds,
      workspaceId: undefined, // Optionnel, peut être ajouté plus tard
      permissionConstraints: undefined // Optionnel
    };
    
    this.storeService.dispatch(createRoleNew({role: form}));
  }

  generateRoleCodeFromName(roleName: string): string {
    // Générer un code à partir du nom du rôle en majuscules avec underscores
    if (!roleName) return '';
    
    return roleName
      .toUpperCase()
      .trim()
      .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
      .replace(/[^A-Z0-9_]/g, '') // Supprimer les caractères spéciaux (garder seulement lettres, chiffres et underscores)
      .replace(/_+/g, '_') // Remplacer les underscores multiples par un seul
      .replace(/^_+|_+$/g, ''); // Supprimer les underscores en début et fin
  }

  formatCodeToUpperCase(code: string): string {
    // Convertir le code en majuscules et remplacer les espaces/tirets par des underscores
    if (!code) return '';
    return code
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/-/g, '_')
      .replace(/[^A-Z0-9_]/g, '') // Supprimer les caractères non autorisés
      .replace(/_+/g, '_') // Remplacer les underscores multiples par un seul
      .replace(/^_+|_+$/g, ''); // Supprimer les underscores en début et fin
  }
  get role() { return this.roleForm.controls; }

  initCreateRole(): void {
    this.roleForm = this.fb.group({
      name: [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      code: [null],
      description: [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(200)])],
      authorisationKeys: [null,],
    });
  }

  editRole(role: RoleFin): void {
    this.roleForm = this.fb.group({
      id: role.roleCode,
      name: [role.roleName, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      description: [role.roleDescription, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(200)])],
    });
  }
  editCategory(category: any): void {
    this.roleForm = this.fb.group({
      id: category.id,
      name: [category.name, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      description: [category.description, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(200)])],
    });
  }

  updateRole(): void {
    this.isRoleSubmitted = true;
    if(this.roleForm.invalid) {
      return;
    }
    
    // Si c'est une création, utiliser le nouveau endpoint
    if(this.operattion === OperationEnum.CREATE) {
      this.createRole();
      return;
    }
    
    // Pour la mise à jour, utiliser l'ancien système pour l'instant
    if(this.role$){
      this.loading$.next(true);
      this.onRole.emit({role: this.roleForm.value, operation: this.operattion});
    }
  }
  updateCategory(): void {
    this.isRoleSubmitted = true;
    if(this.roleForm.invalid) {
      return;
    }
    this.loading$.next(true);
    // this.onCategory.emit({category: this.roleForm.value, operation: this.operattion});
  }

  cancel() : void{
    if(this.operattion == OperationEnum.CREATE) {
      this.initCreateRole();
    } else {
      this.editRole(this.currentRole);
    }
  }

  onNameBlur(): void {
    // Générer automatiquement le code à partir du nom quand l'utilisateur quitte le champ nom
    const nameControl = this.roleForm.get('name');
    const codeControl = this.roleForm.get('code');
    
    if (nameControl && codeControl && nameControl.value) {
      const generatedCode = this.generateRoleCodeFromName(nameControl.value);
      if (generatedCode) {
        codeControl.setValue(generatedCode, { emitEvent: false });
      }
    }
  }

  onCodeBlur(): void {
    // Formater le code quand l'utilisateur quitte le champ (si modifié manuellement)
    const codeControl = this.roleForm.get('code');
    if (codeControl && codeControl.value) {
      const formattedCode = this.formatCodeToUpperCase(codeControl.value);
      codeControl.setValue(formattedCode, { emitEvent: false });
    }
  }
}