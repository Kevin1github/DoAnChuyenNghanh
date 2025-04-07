import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../services/auth.service';

interface UserWithId extends User {
  _id: string;
}

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.css'
})
export class AccountManagementComponent implements OnInit {
  users: UserWithId[] = [];
  userForm: FormGroup;
  isEditing = false;
  currentUserId: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        // If response is already an array, use it directly
        if (Array.isArray(response)) {
          this.users = response as UserWithId[];
        } 
        // If it's still the old format with a data property
        else if (response && response.data && Array.isArray(response.data)) {
          this.users = response.data as UserWithId[];
        } 
        // Fallback to empty array
        else {
          this.users = [];
          this.errorMessage = 'Invalid response format from server';
        }
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.users = [];
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    if (this.isEditing && this.currentUserId) {
      // Remove password if it's empty (user doesn't want to change it)
      const userData = {...this.userForm.value};
      if (!userData.password) {
        delete userData.password;
      }

      this.userService.updateUser(this.currentUserId, userData).subscribe({
        next: (response) => {
          this.successMessage = 'User updated successfully';
          this.loadUsers();
          this.resetForm();
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    } else {
      this.userService.createUser(this.userForm.value).subscribe({
        next: (response) => {
          this.successMessage = 'User created successfully';
          this.loadUsers();
          this.resetForm();
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }

  editUser(user: UserWithId): void {
    this.isEditing = true;
    this.currentUserId = user._id;
    
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Remove validators from password field when editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.successMessage = 'User deleted successfully';
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentUserId = null;
    this.userForm.reset({
      role: 'user',
      status: 'active'
    });
    
    // Add back validators to password field
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}
