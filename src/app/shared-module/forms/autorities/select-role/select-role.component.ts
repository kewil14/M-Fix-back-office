import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleResponseDto } from 'src/app/core/shared/dto/customers/role-response-dto';
import { RoleService } from 'src/app/core/shared/services/role.service';

@Component({
  selector: 'loto-select-role',
  templateUrl: './select-role.component.html',
  styleUrls: ['./select-role.component.scss']
})
export class SelectRoleComponent implements OnInit {

  @Input() roles = new Array<RoleResponseDto>();
  @Output() onRole = new EventEmitter<RoleResponseDto>();
  roleForm!: FormGroup;
  isSelectRoleSubmitted: boolean = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
  ) {}

  ngOnInit(): void {
    this.initRoleForm();
  }

  get role() { return this.roleForm.controls; }

  initRoleForm(): void {
    this.isSelectRoleSubmitted = false;
    this.roleForm = this.fb.group({
      idRole: [null, Validators.compose([Validators.required, Validators.min(1)])],
    });
  }

  selectRole(): void {
    this.isSelectRoleSubmitted = true;
    if(this.roleForm.invalid) {
      return;
    }
    this.loading = true;

    this.roleService.findRoleById(this.roleForm.value.idRole).subscribe({
      next: ({body}) => {
        this.onRole.emit(body);
        this.loading = false;
      }, error: (err) => {
        this.loading = false;
        console.log(err);
      }
    });
  }

}
