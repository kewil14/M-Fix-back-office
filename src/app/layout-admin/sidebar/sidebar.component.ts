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
    const isSuperAdmin = this.permissionService.isSuperAdmin();
    const isWorkspaceAdmin = this.permissionService.isWorkspaceAdmin();
    
    return menu.filter(item => {
      if (item.isTitle || item.isLayout) {
        return true;
      }

      if (isSuperAdmin) {
        if (item.subItems && item.subItems.length > 0) {
          item.subItems = item.subItems.filter((subItem: MenuItem) => {
            if (subItem.visibleForSuperAdmin) {
              return true;
            }
            if (subItem.requiredRole) {
              const requiredRoles = Array.isArray(subItem.requiredRole) ? subItem.requiredRole : [subItem.requiredRole];
              return this.permissionService.hasAnyRole(requiredRoles);
            }
            return true;
          });
        }
        return true;
      }

      if (item.visibleForSuperAdmin) {
        return false;
      }

      if (isWorkspaceAdmin) {
        if (item.link === '/admin' || (item.subItems && item.subItems.some(sub => sub.link === '/admin'))) {
          return true;
        }
        
        if (item.subItems && item.subItems.length > 0) {
          item.subItems = item.subItems.filter((subItem: MenuItem) => {
            return subItem.link === '/admin/workspaces' || 
                   subItem.link === '/admin/employees' || 
                   subItem.link === '/admin/shops';
          });
          
          if (item.subItems.length === 0) {
            return false;
          }
          return true;
        }
        
        if (item.link && item.link !== '/admin') {
          return false;
        }
        
        return false;
      }

      if (item.requiredRole) {
        const requiredRoles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
        const hasRole = this.permissionService.hasAnyRole(requiredRoles);
        
        if (!hasRole) {
          return false;
        }
      }

      if (item.subItems && item.subItems.length > 0) {
        item.subItems = item.subItems.filter((subItem: MenuItem) => {
          if (subItem.visibleForSuperAdmin) {
            return false;
          }
          if (subItem.requiredRole) {
            const requiredRoles = Array.isArray(subItem.requiredRole) ? subItem.requiredRole : [subItem.requiredRole];
            return this.permissionService.hasAnyRole(requiredRoles);
          }
          return true;
        });
        
        if (item.subItems.length === 0) {
          return false;
        }
      }

      return true;
    });
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
}
