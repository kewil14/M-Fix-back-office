import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges } from '@angular/core';
import MetisMenu from 'metismenujs';
import { EventService } from '../../core/services/event.service';
import { Router, NavigationEnd } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TranslateService } from '@ngx-translate/core';
import { PermissionService } from '../../core/shared/services/permission.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  menu: any;
  data: any;

  menuItems = [];

  @ViewChild('sideMenu') sideMenu: ElementRef;

  constructor(
    private eventService: EventService, 
    private router: Router, 
    public translate: TranslateService, 
    private http: HttpClient,
    private permissionService: PermissionService
  ) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
      }
    });
  }

  ngOnInit() {
    this.initialize();
    this._scrollElement();
  }

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();
  }

  toggleMenu(event) {
    event.currentTarget.nextElementSibling.classList.toggle('mm-show');
  }

  ngOnChanges() {
    if (!this.isCondensed && this.sideMenu || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }
  _scrollElement() {
    setTimeout(() => {
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition = document.getElementsByClassName("mm-active")[0]['offsetTop'];
        if (currentPosition > 500)
        if(this.scrollRef.SimpleBar !== null)
          this.scrollRef.SimpleBar.getScrollElement().scrollTop =
            currentPosition + 300;
      }
    }, 300);
  }

  _removeAllClass(className) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
    const paths = [];
    for (let i = 0; i < links.length; i++) {
      paths.push(links[i]['pathname']);
    }
    var itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }
    if (menuItemEl) {
      menuItemEl.classList.add('active');
      const parentEl = menuItemEl.parentElement;
      if (parentEl) {
        parentEl.classList.add('mm-active');
        const parent2El = parentEl.parentElement.closest('ul');
        if (parent2El && parent2El.id !== 'side-menu') {
          parent2El.classList.add('mm-show');
          const parent3El = parent2El.parentElement;
          if (parent3El && parent3El.id !== 'side-menu') {
            parent3El.classList.add('mm-active');
            const childAnchor = parent3El.querySelector('.has-arrow');
            const childDropdown = parent3El.querySelector('.has-dropdown');
            if (childAnchor) { childAnchor.classList.add('mm-active'); }
            if (childDropdown) { childDropdown.classList.add('mm-active'); }
            const parent4El = parent3El.parentElement;
            if (parent4El && parent4El.id !== 'side-menu') {
              parent4El.classList.add('mm-show');
              const parent5El = parent4El.parentElement;
              if (parent5El && parent5El.id !== 'side-menu') {
                parent5El.classList.add('mm-active');
                const childanchor = parent5El.querySelector('.is-parent');
                if (childanchor && parent5El.id !== 'side-menu') { childanchor.classList.add('mm-active'); }
              }
            }
          }
        }
      }
    }

  }

  initialize(): void {
    this.menuItems = this.filterMenuByPermissions(MENU);
  }

  private filterMenuByPermissions(menu: MenuItem[]): MenuItem[] {
    // Première passe : filtrer tous les items non-titres (les titres sont gardés temporairement)
    const filteredMenu: MenuItem[] = [];
    
    for (const item of menu) {
      // Les layouts sont toujours affichés
      if (item.isLayout) {
        filteredMenu.push(item);
        continue;
      }

      // Les titres sont gardés temporairement pour la deuxième passe
      if (item.isTitle) {
        filteredMenu.push(item);
        continue;
      }

      // Filtrer les items non-titres
      if (this.isMenuItemVisible(item)) {
        filteredMenu.push(item);
      }
    }

    // Deuxième passe : masquer les titres qui n'ont pas de menus visibles après eux
    const finalMenu: MenuItem[] = [];
    for (let i = 0; i < filteredMenu.length; i++) {
      const item = filteredMenu[i];
      
      // Les layouts sont toujours affichés
      if (item.isLayout) {
        finalMenu.push(item);
        continue;
      }

      // Pour les titres, vérifier s'il y a un menu visible après
      if (item.isTitle) {
        // Chercher le prochain item non-titre après ce titre
        let hasVisibleMenuAfter = false;
        for (let j = i + 1; j < filteredMenu.length; j++) {
          const nextItem = filteredMenu[j];
          if (nextItem.isTitle || nextItem.isLayout) {
            // On a trouvé un autre titre ou layout, on arrête
            break;
          }
          // Si on arrive ici, c'est qu'il y a un menu visible après le titre
          hasVisibleMenuAfter = true;
          break;
        }
        // Ajouter le titre seulement s'il y a un menu visible après
        if (hasVisibleMenuAfter) {
          finalMenu.push(item);
        }
      } else {
        // Les items non-titres sont déjà filtrés, on les ajoute
        finalMenu.push(item);
      }
    }

    return finalMenu;
  }

  private isMenuItemVisible(item: MenuItem): boolean {
    // Super Admin et Admin ont accès à TOUS les menus et sous-menus sans restriction
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      return true;
    }

    // Vérifier si l'item a un requiredRole
    if (item.requiredRole) {
      const requiredRoles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
      const hasRole = this.permissionService.hasAnyRole(requiredRoles);
      
      if (!hasRole) {
        return false;
      }
    }

    // Vérifier l'accès à la page via canAccessPage si un link est défini
    if (item.link) {
      const canAccess = this.permissionService.canAccessPage(item.link);
      if (!canAccess) {
        return false;
      }
    }

    // Filtrer les sous-items
    if (item.subItems && item.subItems.length > 0) {
      item.subItems = item.subItems.filter((subItem: MenuItem) => {
        // Vérifier requiredRole pour le sous-item
        if (subItem.requiredRole) {
          const requiredRoles = Array.isArray(subItem.requiredRole) ? subItem.requiredRole : [subItem.requiredRole];
          if (!this.permissionService.hasAnyRole(requiredRoles)) {
            return false;
          }
        }

        // Vérifier l'accès à la page via canAccessPage si un link est défini
        if (subItem.link) {
          const canAccess = this.permissionService.canAccessPage(subItem.link);
          if (!canAccess) {
            return false;
          }
        }

        return true;
      });
      
      // Si aucun sous-item n'est accessible, masquer l'item parent
      if (item.subItems.length === 0) {
        return false;
      }
    }

    return true;
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
}
