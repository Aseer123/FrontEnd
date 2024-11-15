import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MaintenanceService, Task } from '../maintainence.service';
import { NotificationService, Notification } from '../notification.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  maintenanceForm: FormGroup;
  notificationForm: FormGroup;
  tasks: Task[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private maintenanceService: MaintenanceService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.maintenanceForm = this.fb.group({
      description: ['', Validators.required],
      scheduledDate: ['', Validators.required],
      status: ['PENDING']
    });

    this.notificationForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.maintenanceService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.maintenanceForm.valid) {
      this.loading = true;
      const taskData: Task = {
        description: this.maintenanceForm.get('description')?.value,
        scheduledDate: this.maintenanceForm.get('scheduledDate')?.value,
        status: this.maintenanceForm.get('status')?.value || 'PENDING',
        creatorRole: 'ADMIN'
      };

      this.maintenanceService.createTask(taskData).subscribe({
        next: () => {
          this.loadTasks();
          this.maintenanceForm.reset({
            status: 'PENDING'
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.errorMessage = 'Failed to create task. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  sendNotification() {
    if (this.notificationForm.valid) {
      const notification: Notification = {
        content: this.notificationForm.get('content')?.value,
        date: new Date(),
        recipientRole: 'RESIDENT'
      };

      this.notificationService.createNotification(notification).subscribe({
        next: (response) => {
          console.log('Notification sent:', response);
          this.notificationForm.reset();
        },
        error: (error) => {
          console.error('Error sending notification:', error);
          this.errorMessage = 'Failed to send notification.';
        }
      });
    }
  }

  onStatusChange(event: Event, taskId: number) {
    const select = event.target as HTMLSelectElement;
    this.updateTaskStatus(taskId, select.value);
  }

  updateTaskStatus(taskId: number, newStatus: string) {
    const task = this.tasks.find(t => t.taskId === taskId);
    if (task) {
      const updatedTask = { ...task, status: newStatus };
      this.maintenanceService.updateTask(taskId, updatedTask).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.errorMessage = 'Failed to update task status.';
        }
      });
    }
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.maintenanceService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.errorMessage = 'Failed to delete task.';
          this.loading = false;
        }
      });
    }
  }

  clearError() {
    this.errorMessage = '';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}