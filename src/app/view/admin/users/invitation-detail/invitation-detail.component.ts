import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { InvitationResponseDto } from 'src/app/core/shared/dtos/invitation-response-dto.modal';
import {
  getInvitationById,
  getInvitationByIdOk,
  getInvitationByIdError,
  resendInvitation,
  resendInvitationOk,
  resendInvitationError
} from 'src/app/core/shared/stores/authentification/authentification.actions';
import { ResendInvitationDto } from 'src/app/core/shared/dtos/resend-invitation-dto.modal';

@Component({
  selector: 'app-invitation-detail',
  templateUrl: './invitation-detail.component.html',
  styleUrls: ['./invitation-detail.component.scss']
})
export class InvitationDetailComponent implements OnInit, OnDestroy {
  breadCrumbItems: Array<{}> = [];
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  invitation: InvitationResponseDto | null = null;
  invitationId: string | null = null;
  isLoading: boolean = false;
  isResendingInvitation: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private actionService: Actions
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Admin' },
      { label: 'Invitations', routerLink: '/admin/invitations' },
      { label: 'Détail', active: true }
    ];

    this.route.paramMap.subscribe(params => {
      this.invitationId = params.get('id');
      if (this.invitationId) {
        this.loadInvitation();
      }
    });

    this.actionInvitation();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  actionInvitation(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(getInvitationByIdOk)).subscribe(({invitation}) => {
        this.isLoading = false;
        this.invitation = invitation;
      }),
      this.actionService.pipe(ofType(getInvitationByIdError)).subscribe(({messages}) => {
        this.isLoading = false;
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(resendInvitationOk)).subscribe(() => {
        this.isResendingInvitation = false;
        // Recharger les détails de l'invitation après renvoi
        if (this.invitationId) {
          this.loadInvitation();
        }
      }),
      this.actionService.pipe(ofType(resendInvitationError)).subscribe(() => {
        this.isResendingInvitation = false;
      })
    );
  }

  loadInvitation(): void {
    if (!this.invitationId) {
      return;
    }

    this.isLoading = true;
    this.storeService.dispatch(getInvitationById({ invitationId: this.invitationId }));
  }

  onBack(): void {
    this.router.navigate(['/admin/invitations']);
  }

  onResendInvitation(): void {
    if (!this.invitation?.email || this.isResendingInvitation) {
      return;
    }

    this.isResendingInvitation = true;
    const resendInvitationDto: ResendInvitationDto = {
      email: this.invitation.email
    };

    this.storeService.dispatch(resendInvitation({ resendInvitationDto }));
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return 'bg-warning';
      case 'accepted':
      case 'acceptée':
        return 'bg-success';
      case 'expired':
      case 'expirée':
        return 'bg-danger';
      case 'used':
      case 'utilisée':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Inconnu';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return 'En attente';
      case 'accepted':
      case 'acceptée':
        return 'Acceptée';
      case 'expired':
      case 'expirée':
        return 'Expirée';
      case 'used':
      case 'utilisée':
        return 'Utilisée';
      default:
        return status;
    }
  }
}

