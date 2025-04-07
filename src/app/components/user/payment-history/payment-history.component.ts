import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService } from '../../../services/bill.service';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.css'
})
export class PaymentHistoryComponent implements OnInit {
  paidBills: any[] = [];
  totalPaid: number = 0;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private billService: BillService) {}

  ngOnInit(): void {
    this.loadPaymentHistory();
  }

  loadPaymentHistory(): void {
    this.loading = true;
    this.billService.getPaymentHistory().subscribe({
      next: (response) => {
        console.log('Payment history response:', response);
        
        // Check if response is already an array
        if (Array.isArray(response)) {
          this.paidBills = response;
          // Calculate total from the array
          this.totalPaid = this.paidBills.reduce((total, bill) => total + (bill.amount || 0), 0);
        } 
        // If it's an object with data property (original expected format)
        else if (response && response.data) {
          this.paidBills = response.data;
          this.totalPaid = response.totalPaid || 0;
        } 
        // Fallback
        else {
          this.paidBills = [];
          this.totalPaid = 0;
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Payment history error:', error);
        this.errorMessage = error.message || 'Failed to load payment history';
        this.loading = false;
        this.paidBills = []; // Ensure paidBills is always an array
      }
    });
  }
} 