import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MaintenanceService, Task } from '../maintainence.service';
import { NotificationService, Notification } from '../notification.service';
import { AuthService, UserData } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resident-dashboard',
  templateUrl: './resident-dashboard.component.html',
  styleUrls: ['./resident-dashboard.component.css']
})
export class ResidentDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('mainContent') mainContent!: ElementRef;
  
  // Properties
  tasks: Task[] = [];
  notifications: Notification[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  currentUser: UserData | null = null;
  showProfile: boolean = false;
  loadingTasks: boolean = false;
  loadingNotifications: boolean = false;
  activeSection: string = 'dashboard';
  private userSubscription?: Subscription;
  private scrollTimeout: any;

  constructor(
    private maintenanceService: MaintenanceService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeDashboard();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  // Dashboard Initialization
  private initializeDashboard() {
    this.currentUser = this.authService.getCurrentUser();
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loadTasks();
    this.loadNotifications();
  }

  // Profile Methods
  getDisplayName(): string {
    return this.currentUser?.username || 'Resident';
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }

  // Navigation Methods
  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      this.activeSection = sectionId;
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Scroll Handler
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = setTimeout(() => {
      if (this.mainContent) {
        const sections = this.mainContent.nativeElement.querySelectorAll('[id]');
        const scrollPosition = window.pageYOffset + 100;

        sections.forEach((section: HTMLElement) => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          
          if (scrollPosition >= sectionTop && 
              scrollPosition < sectionTop + sectionHeight) {
            this.activeSection = section.id;
          }
        });
      }
    }, 50);
  }

  // Click Outside Handler
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const profileModal = document.querySelector('.profile-modal');
    const userInfo = document.querySelector('.user-info');
    
    if (this.showProfile && profileModal && userInfo && 
        !profileModal.contains(event.target as Node) && 
        !userInfo.contains(event.target as Node)) {
      this.closeProfile();
    }
  }

  // Data Loading Methods
  loadTasks() {
    this.loadingTasks = true;
    this.maintenanceService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loadingTasks = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = 'Failed to load tasks. Please try again later.';
        this.loadingTasks = false;
        this.setAutoCloseError();
      }
    });
  }

  loadNotifications() {
    this.loadingNotifications = true;
    const userRole = this.currentUser?.role || 'RESIDENT';
    this.notificationService.getNotificationsByRole(userRole).subscribe({
      next: (data) => {
        this.notifications = data;
        this.loadingNotifications = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.errorMessage = 'Failed to load notifications. Please try again later.';
        this.loadingNotifications = false;
        this.setAutoCloseError();
      }
    });
  }

  // Utility Methods
  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

  clearError() {
    this.errorMessage = '';
  }

  private setAutoCloseError(duration: number = 5000) {
    setTimeout(() => this.clearError(), duration);
  }

  formatDate(date: string): string {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  }

  isLoading(): boolean {
    return this.loadingTasks || this.loadingNotifications;
  }

  refreshDashboard() {
    this.loadDashboardData();
  }

  // Authentication Methods
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn() && !!this.currentUser;
  }

  // Debug Methods
  debugUserInfo(): void {
    console.log('Current User:', this.currentUser);
    this.authService.debugTokenInfo();
  }
}