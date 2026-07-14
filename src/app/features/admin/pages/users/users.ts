import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class UsersComponent implements OnInit {
  private readonly authService = inject(AuthService);

  public users: any[] = [];
  public readonly loading = signal<boolean>(true);

  public ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching registered users:', err);
        this.loading.set(false);
      }
    });
  }

  public formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleDateString('es-MX', options);
    } catch (e) {
      return dateString;
    }
  }
}
