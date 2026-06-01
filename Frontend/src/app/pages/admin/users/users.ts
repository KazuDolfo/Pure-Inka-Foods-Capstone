import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from 'services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class UsersComponent implements OnInit {
  private adminService = inject(AdminService);
  users: any[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  toggleUserStatus(user: any): void {
    const newStatus = !user.activo;
    this.adminService.updateUserStatus(user.id_usuario, newStatus).subscribe({
      next: () => {
        user.activo = newStatus;
      },
      error: (err) => alert(err.message)
    });
  }

  changeRole(user: any, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value;
    this.adminService.updateUserRole(user.id_usuario, newRole).subscribe({
      next: () => {
        user.rol = newRole;
      },
      error: (err) => alert(err.message)
    });
  }
}
