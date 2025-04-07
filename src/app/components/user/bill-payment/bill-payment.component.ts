import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BillService } from '../../../services/bill.service';
import { AuthService } from '../../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

interface Bill {
  _id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentDate?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

@Component({
  selector: 'app-bill-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './bill-payment.component.html',
  styleUrl: './bill-payment.component.css'
})
export class BillPaymentComponent implements OnInit {
  bills: Bill[] = [];
  loading = false;
  payingBillId: string | null = null;
  selectedPaymentMethod = 'Credit Card';
  paymentMethods = ['Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Cash'];
  errorMessage = '';
  successMessage = '';
  paymentInProgress = false;
  
  // Show receipt details
  showReceipt = false;
  currentReceipt: any = null;

  constructor(
    private billService: BillService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in first
    if (this.authService.isLoggedIn()) {
      this.loadMyBills();
    } else {
      this.errorMessage = 'Please log in to view your bills';
    }
  }

  loadMyBills(): void {
    this.loading = true;
    this.billService.getMyBills().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.bills = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.bills = response.data;
        } else {
          this.bills = [];
          this.errorMessage = 'Unexpected response format';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load bills';
        this.loading = false;
      }
    });
  }

  openPaymentModal(billId: string): void {
    this.payingBillId = billId;
    this.selectedPaymentMethod = 'Credit Card';
    this.clearMessages();
  }

  closePaymentModal(): void {
    this.payingBillId = null;
    this.clearMessages();
  }

  payBill(): void {
    if (!this.payingBillId) return;

    this.paymentInProgress = true;
    const paymentData = {
      paymentMethod: this.selectedPaymentMethod
    };

    this.billService.payBill(this.payingBillId, paymentData).subscribe({
      next: (response) => {
        const billData = response.data || response;
        this.successMessage = 'Payment successful!';
        this.paymentInProgress = false;
        
        // Store receipt information for display
        this.currentReceipt = {
          billId: this.payingBillId,
          paymentDate: billData.paymentDate || new Date().toISOString(),
          paymentMethod: billData.paymentMethod || this.selectedPaymentMethod,
          receiptNumber: billData.receiptNumber || 'RCP' + Date.now(),
          amount: this.getBillAmount(this.payingBillId)
        };
        
        this.showReceipt = true;
        this.loadMyBills();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Payment failed. Please try again.';
        this.paymentInProgress = false;
      }
    });
  }

  viewReceipt(bill: Bill): void {
    this.currentReceipt = {
      billId: bill._id,
      paymentDate: bill.paymentDate,
      paymentMethod: bill.paymentMethod,
      receiptNumber: bill.receiptNumber,
      amount: bill.amount
    };
    this.showReceipt = true;
  }

  closeReceipt(): void {
    this.showReceipt = false;
    this.currentReceipt = null;
  }

  printReceipt(): void {
    window.print();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getBillAmount(billId: string | null): number {
    if (!billId) return 0;
    const bill = this.bills.find(b => b._id === billId);
    return bill ? bill.amount : 0;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
} 