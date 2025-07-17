import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, finalize, map, of, Subscription, switchMap, tap } from 'rxjs';
import { saveAdressDateDemandes } from 'src/app/core/shared/stores/demande/demande.actions';

@Component({
  selector: 'willo-estimate-devis',
  templateUrl: './estimate-devis.component.html',
  styleUrls: ['./estimate-devis.component.css']
})
export class EstimateDevisComponent implements OnInit, OnDestroy {
  quotationForm: FormGroup;
  addressSuggestionsStart: any[] = [];
  addressSuggestionsEnd: any[] = [];
  isLoadingStart = false;
  isLoadingEnd = false;
  showSuggestionsStart = false;
  showSuggestionsEnd = false;
  
  private startSubscription: Subscription;
  private endSubscription: Subscription;

  @ViewChild('addressStartInput') addressStartInput: ElementRef;
  @ViewChild('addressEndInput') addressEndInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private renderer: Renderer2,
    private router: Router,
    private storeService: Store,
  ) { }

  ngOnInit() {
    this.initForm();
    this.setupAddressListeners();
    
    // Fermer les suggestions quand on clique ailleurs dans le document
    this.renderer.listen('document', 'click', (event: Event) => {
      if (!this.addressStartInput?.nativeElement.contains(event.target)) {
        this.showSuggestionsStart = false;
        this.addressSuggestionsStart = [];
      }
      if (!this.addressEndInput?.nativeElement.contains(event.target)) {
        this.showSuggestionsEnd = false;
        this.addressSuggestionsEnd = [];
      }
    });
  }

  ngOnDestroy() {
    // Nettoyage des souscriptions pour éviter les fuites mémoire
    if (this.startSubscription) {
      this.startSubscription.unsubscribe();
    }
    if (this.endSubscription) {
      this.endSubscription.unsubscribe();
    }
  }

  initForm() {
    this.quotationForm = this.fb.group({
      // Adresse de départ
      address_start: [''],
      start_city: [{value: '', disabled: true}],
      start_zipcode: [{value: '', disabled: true}],
      
      // Adresse d'arrivée  
      address_end: [''],
      end_city: [{value: '', disabled: true}],
      end_zipcode: [{value: '', disabled: true}],
      
      // Dates
      from_date: [''],
      to_date: ['']
    });
  }

  setupAddressListeners() {
    // Souscription pour l'adresse de départ
    this.startSubscription = this.quotationForm.get('address_start')?.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => {
          this.isLoadingStart = true;
          this.showSuggestionsStart = true;
        }),
        switchMap(value => {
          if (!value || value.length < 3) {
            this.isLoadingStart = false;
            this.addressSuggestionsStart = [];
            this.showSuggestionsStart = false;
            // Réactiver les champs si l'input est vide
            this.quotationForm.get('start_city')?.enable();
            this.quotationForm.get('start_zipcode')?.enable();
            this.quotationForm.get('start_city')?.setValue('');
            this.quotationForm.get('start_zipcode')?.setValue('');
            return of([]);
          }
          return this.fetchAddressSuggestions(value).pipe(
            finalize(() => {
            })
          );
        })
      )
      .subscribe(results => {
        this.addressSuggestionsStart = results;
      });

    // Souscription pour l'adresse d'arrivée
    this.endSubscription = this.quotationForm.get('address_end')?.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => {
          this.isLoadingEnd = true;
          this.showSuggestionsEnd = true;
        }),
        switchMap(value => {
          if (!value || value.length < 3) {
            this.isLoadingEnd = false;
            this.addressSuggestionsEnd = [];
            this.showSuggestionsEnd = false;
            // Réactiver les champs si l'input est vide
            this.quotationForm.get('end_city')?.enable();
            this.quotationForm.get('end_zipcode')?.enable();
            this.quotationForm.get('end_city')?.setValue('');
            this.quotationForm.get('end_zipcode')?.setValue('');
            return of([]);
          }
          return this.fetchAddressSuggestions(value).pipe(
            finalize(() => {
              this.isLoadingEnd = false;
            })
          );
        })
      )
      .subscribe(results => {
        this.addressSuggestionsEnd = results;
      });
  }

  fetchAddressSuggestions(query: string) {
    if (!query) return of([]);
    
    return this.http.get<any>(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`)
      .pipe(
        map(response => response.features.map((feat: any) => ({
          label: feat.properties.label,
          city: feat.properties.city,
          postcode: feat.properties.postcode,
          context: feat.properties.context,
          coordinates: feat.geometry.coordinates
        }))),
        catchError(error => {
          console.error('Erreur lors de la recherche d\'adresses', error);
          return of([]);
        })
      );
  }

  // Sélection d'une adresse dans la liste des suggestions
  selectAddress(field: string, addressData: any) {
    if (field === 'address_start') {
      this.quotationForm.patchValue({
        address_start: addressData.label,
        start_city: addressData.city,
        start_zipcode: addressData.postcode
      });
      
      // Désactiver les champs ville et code postal pour le départ
      this.quotationForm.get('start_city')?.disable();
      this.quotationForm.get('start_zipcode')?.disable();
      
      this.addressSuggestionsStart = [];
      this.showSuggestionsStart = false;
    }
    
    if (field === 'address_end') {
      this.quotationForm.patchValue({
        address_end: addressData.label,
        end_city: addressData.city,
        end_zipcode: addressData.postcode
      });
      
      // Désactiver les champs ville et code postal pour l'arrivée
      this.quotationForm.get('end_city')?.disable();
      this.quotationForm.get('end_zipcode')?.disable();
      
      this.addressSuggestionsEnd = [];
      this.showSuggestionsEnd = false;
    }
  }

  // Méthodes pour gérer le focus
  onAddressInputFocus(field: string) {
    if (field === 'start' && this.addressSuggestionsStart.length > 0) {
      this.showSuggestionsStart = true;
    }
    if (field === 'end' && this.addressSuggestionsEnd.length > 0) {
      this.showSuggestionsEnd = true;
    }
  }

  onAddressInputBlur(field: string) {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      if (field === 'start') {
        this.showSuggestionsStart = false;
      }
      if (field === 'end') {
        this.showSuggestionsEnd = false;
      }
    }, 200);
  }

  // Méthodes pour effacer les adresses
  clearStartAddress() {
    this.quotationForm.patchValue({
      address_start: '',
      start_city: '',
      start_zipcode: ''
    });
    
    // Réactiver les champs
    this.quotationForm.get('start_city')?.enable();
    this.quotationForm.get('start_zipcode')?.enable();
    
    this.addressSuggestionsStart = [];
    this.showSuggestionsStart = false;
  }

  clearEndAddress() {
    this.quotationForm.patchValue({
      address_end: '',
      end_city: '',
      end_zipcode: ''
    });
    
    // Réactiver les champs
    this.quotationForm.get('end_city')?.enable();
    this.quotationForm.get('end_zipcode')?.enable();
    
    this.addressSuggestionsEnd = [];
    this.showSuggestionsEnd = false;
  }

  // Soumission du formulaire
  onSubmit() {
    // Récupérer les valeurs même des champs disabled
    const formData = {
      ...this.quotationForm.value,
      start_city: this.quotationForm.get('start_city')?.value,
      start_zipcode: this.quotationForm.get('start_zipcode')?.value,
      end_city: this.quotationForm.get('end_city')?.value,
      end_zipcode: this.quotationForm.get('end_zipcode')?.value
    };

    if (this.quotationForm.valid) {
      console.log(formData);

      // déclencher l'envoi des éléments d'adresses et de date
      this.storeService.dispatch(saveAdressDateDemandes({demande: formData}));

      // naviguer vers la création de la demande
      this.router.navigate(['/demande-devis']);

    } else {
      alert('Veuillez remplir correctement tous les champs obligatoires.');
    }
  }
}