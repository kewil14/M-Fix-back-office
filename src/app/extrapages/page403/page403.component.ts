import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page403',
  templateUrl: './page403.component.html',
  styleUrls: ['./page403.component.scss']
})

/**
 * Page 403 - Access Forbidden component
 */
export class Page403Component implements OnInit {
  returnUrl: string | null = null;

  constructor(
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Récupérer l'URL de retour depuis les query params
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || null;
    });
  }

  goBack(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.location.back();
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/admin']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}

