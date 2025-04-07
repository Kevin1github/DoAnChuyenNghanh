import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BillService } from '../../../services/bill.service';
import { UserService } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-bill-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './bill-management.component.html',
  styleUrl: './bill-management.component.css'
})
export class BillManagementComponent implements OnInit {
  bills: any[] = [];
  users: any[] = [];
  billForm: FormGroup;
  autoBillForm: FormGroup;
  editMode = false;
  currentBillId: string | null = null;
  loading = false;
  autoGenerating = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private billService: BillService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.billForm = this.fb.group({
      user: ['', Validators.required],
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', Validators.required],
      status: ['Pending']
    });

    this.autoBillForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBills();
    this.loadUsers();
  }

  loadBills(): void {
    this.loading = true;
    this.billService.getBills().subscribe({
      next: (response) => {
        // Handle different response formats
        if (Array.isArray(response)) {
          this.bills = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.bills = response.data;
        } else {
          this.bills = [];
          console.error('Unexpected response format:', response);
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load bills';
        this.loading = false;
        this.bills = []; // Ensure bills is always an array even on error
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.users = response.data;
        } else if (Array.isArray(response)) {
          this.users = response;
        } else {
          console.error('User data is not in expected format:', response);
          this.users = [];
          this.users = [
            { _id: '1', name: 'admin' },
            { _id: '2', name: 'user' }
          ];
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load users';
        this.users = [];
        this.users = [
          { _id: '1', name: 'admin' },
          { _id: '2', name: 'user' }
        ];
      }
    });
  }

  onSubmit(): void {
    if (this.billForm.invalid) {
      return;
    }

    this.loading = true;
    const billData = this.billForm.value;

    if (this.editMode && this.currentBillId) {
      this.billService.updateBill(this.currentBillId, billData).subscribe({
        next: () => {
          this.successMessage = 'Bill updated successfully';
          this.resetForm();
          this.loadBills();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update bill';
          this.loading = false;
        }
      });
    } else {
      this.billService.createBill(billData).subscribe({
        next: () => {
          this.successMessage = 'Bill created successfully';
          this.resetForm();
          this.loadBills();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to create bill';
          this.loading = false;
        }
      });
    }
  }

  editBill(bill: any): void {
    this.editMode = true;
    this.currentBillId = bill._id;
    
    // Handle different possible user reference formats
    const userId = bill.user?._id || bill.user || '';
    
    this.billForm.setValue({
      user: userId,
      description: bill.description || '',
      amount: bill.amount || 0,
      dueDate: bill.dueDate ? this.formatDate(bill.dueDate) : '',
      status: bill.status || 'Pending'
    });
  }

  deleteBill(id: string): void {
    if (confirm('Are you sure you want to delete this bill?')) {
      this.billService.deleteBill(id).subscribe({
        next: () => {
          this.successMessage = 'Bill deleted successfully';
          this.loadBills();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete bill';
        }
      });
    }
  }

  updateStatus(id: string, status: string): void {
    this.billService.updateBillStatus(id, { status }).subscribe({
      next: () => {
        this.successMessage = 'Bill status updated successfully';
        this.loadBills();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update bill status';
      }
    });
  }

  resetForm(): void {
    this.billForm.reset({ status: 'Pending' });
    this.editMode = false;
    this.currentBillId = null;
    this.loading = false;
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }

  generateBillsForAllUsers(): void {
    if (this.autoBillForm.invalid) {
      return;
    }

    this.autoGenerating = true;
    const billData = this.autoBillForm.value;

    this.billService.generateBillsForAllUsers(billData).subscribe({
      next: (response) => {
        const count = response.count || 0;
        this.successMessage = `Successfully generated ${count} bills for all active users`;
        this.autoBillForm.reset();
        this.loadBills();
        this.autoGenerating = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to generate bills for all users';
        this.autoGenerating = false;
      }
    });
  }
}
