import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  showSuccess(message: string, title: string = 'Succès'): void {
    this.toastr.success(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true
    });
  }

  showError(message: string, title: string = 'Erreur'): void {
    this.toastr.error(message, title, {
      timeOut: 7000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true
    });
  }

  showWarning(message: string, title: string = 'Avertissement'): void {
    this.toastr.warning(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true
    });
  }

  showInfo(message: string, title: string = 'Information'): void {
    this.toastr.info(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true
    });
  }
}
