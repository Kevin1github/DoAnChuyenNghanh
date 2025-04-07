const User = require('../models/User');
const Bill = require('../models/Bill');

/**
 * Get dashboard summary data
 * @route GET /api/reports/dashboard
 * @access Private/Admin
 */
exports.getDashboardData = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total bills
    const totalBills = await Bill.countDocuments();
    
    // Get total revenue - sum of all bill amounts that are paid
    const paidBills = await Bill.find({ status: 'Paid' });
    const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    res.json({
      totalUsers,
      totalBills,
      totalRevenue,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get monthly revenue data for charts
 * @route GET /api/reports/revenue
 * @access Private/Admin
 */
exports.getRevenueData = async (req, res) => {
  try {
    // Get all paid bills
    const paidBills = await Bill.find({ status: 'Paid' })
      .populate('user', 'name')
      .sort({ paymentDate: 1 });
    
    // Group bills by month
    const monthlyData = {};
    
    paidBills.forEach(bill => {
      if (!bill.paymentDate) return;
      
      const month = new Date(bill.paymentDate).toLocaleString('default', { month: 'long' });
      const year = new Date(bill.paymentDate).getFullYear();
      const key = `${month} ${year}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = 0;
      }
      monthlyData[key] += bill.amount;
    });
    
    // Convert to array format for charts
    const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    }));
    
    res.json(chartData);
  } catch (error) {
    console.error('Error getting revenue data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get recent payments
 * @route GET /api/reports/recent-payments
 * @access Private/Admin
 */
exports.getRecentPayments = async (req, res) => {
  try {
    const payments = await Bill.find({ status: 'Paid' })
      .populate('user', 'name email')
      .sort({ paymentDate: -1 })
      .limit(10); // Get the 10 most recent payments
    
    const formattedPayments = payments.map(bill => ({
      paymentId: bill._id,
      user: bill.user.name || bill.user.email,
      userId: bill.user._id,
      billType: bill.description,
      amount: bill.amount,
      date: bill.paymentDate
    }));
    
    res.json(formattedPayments);
  } catch (error) {
    console.error('Error getting recent payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Export reports in different formats
 * @route GET /api/reports/export/:format
 * @access Private/Admin
 */
exports.exportReports = async (req, res) => {
  try {
    const { format } = req.params;
    
    // Get all paid bills
    const bills = await Bill.find({ status: 'Paid' })
      .populate('user', 'name email')
      .sort({ paymentDate: -1 });
    
    const reportData = bills.map(bill => ({
      billId: bill._id,
      userEmail: bill.user.email,
      userName: bill.user.name,
      billType: bill.description,
      amount: bill.amount,
      issueDate: bill.createdAt,
      dueDate: bill.dueDate,
      paidDate: bill.paymentDate,
      status: bill.status
    }));
    
    // Handle different export formats
    if (format === 'json') {
      return res.json(reportData);
    } else if (format === 'csv') {
      // Simple CSV formatting
      const headers = 'Bill ID,User Email,User Name,Bill Type,Amount,Issue Date,Due Date,Paid Date,Status\n';
      const csvRows = reportData.map(record => 
        `${record.billId},${record.userEmail},${record.userName},${record.billType},${record.amount},${record.issueDate},${record.dueDate},${record.paidDate},${record.status}`
      );
      
      const csvData = headers + csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payment_report_${new Date().toISOString().slice(0,10)}.csv`);
      return res.send(csvData);
    } else {
      return res.status(400).json({ message: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Error exporting reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 