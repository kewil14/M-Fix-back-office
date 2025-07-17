import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { OperationEnum } from 'src/app/core/config/data.state.enum';
import { RoleItem } from 'src/app/core/shared/models/users/role-item.modal';
import { updateRoleItem } from 'src/app/core/shared/stores/role/role.actions';

@Component({
  selector: 'loto-update-authority',
  templateUrl: './update-authority.component.html',
  styleUrls: ['./update-authority.component.scss']
})
export class UpdateAuthorityComponent implements OnInit {
  
  @Input() authority$!: BehaviorSubject<{authority: RoleItem, operation: string}>;
  @Input() loading$!: BehaviorSubject<boolean>;
  @Output() onCansel = new EventEmitter<boolean>();
  authorityForm!: FormGroup;
  isAuthoritySubmitted: boolean = false;
  operattion: string = OperationEnum.CREATE;

  constructor(
    private storeService: Store,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initCreateAuthority();
    this.authority$.subscribe((data) => {
      this.operattion = data.operation;
      if(data.operation == OperationEnum.CREATE) {
        this.initCreateAuthority();
      } else {
        this.editAuthority(data.authority);
      }
    });
    
  }

  get authority() { return this.authorityForm.controls; }

  initCreateAuthority(): void {
    this.authorityForm = this.fb.group({
      libelle: [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      description: [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(200)])],
    });
  }

  editAuthority(authority: RoleItem): void {
    this.authorityForm = this.fb.group({
      id: authority.authorisationKey,
     
    });
  }

  updateAuthority(): void {
    this.isAuthoritySubmitted = true;
    if(this.authorityForm.invalid) {
      return;
    }
    // console.log(this.authorityForm.value);
    this.loading$.next(true);
    if(this.operattion == OperationEnum.CREATE) {
      // AUTHORITY CREATION if you want
    } else {
      this.storeService.dispatch(updateRoleItem({item: this.authorityForm.value}))
    }
  }

  cancel() : void{
    this.onCansel.emit(true);
  }
}