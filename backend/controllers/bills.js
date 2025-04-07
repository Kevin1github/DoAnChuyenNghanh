const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const User = require('../models/User');

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private/Admin
const createBill = asyncHandler(async (req, res) => {
  const { user: userId, description, amount, dueDate } = req.body;

  // Check if user exists
  const userExists = await User.findById(userId);
  
  if (!userExists) {
    res.status(400);
    throw new Error('User not found');
  }

  const bill = await Bill.create({
    user: userId,
    description,
    amount,
    dueDate,
    status: 'Pending'
  });

  if (bill) {
    res.status(201).json({
      success: true,
      data: bill
    });
  } else {
    res.status(400);
    throw new Error('Invalid bill data');
  }
});

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private/Admin
const getBills = asyncHandler(async (req, res) => {
  const bills = await Bill.find({}).populate('user', 'id name email username');
  
  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills
  });
});

// @desc    Get user bills
// @route   GET /api/bills/user/:id
// @access  Private/Admin
const getUserBills = asyncHandler(async (req, res) => {
  const bills = await Bill.find({ user: req.params.id }).populate('user', 'id name email username');
  
  if (bills) {
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } else {
    res.status(404);
    throw new Error('Bills not found');
  }
});

// @desc    Get bill by ID
// @route   GET /api/bills/:id
// @access  Private/Admin
const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('user', 'id name email username');
  
  if (bill) {
    res.status(200).json({
      success: true,
      data: bill
    });
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Private/Admin
const updateBill = asyncHandler(async (req, res) => {
  const { description, amount, dueDate, status } = req.body;

  const bill = await Bill.findById(req.params.id);

  if (bill) {
    bill.description = description || bill.description;
    bill.amount = amount || bill.amount;
    bill.dueDate = dueDate || bill.dueDate;
    bill.status = status || bill.status;

    if (status === 'Paid' && bill.status !== 'Paid') {
      bill.paymentDate = Date.now();
    }

    const updatedBill = await bill.save();
    res.status(200).json({
      success: true,
      data: updatedBill
    });
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Update bill status
// @route   PUT /api/bills/:id/status
// @access  Private/Admin
const updateBillStatus = asyncHandler(async (req, res) => {
  const { status, paymentMethod, receiptNumber } = req.body;

  const bill = await Bill.findById(req.params.id);

  if (bill) {
    bill.status = status || bill.status;
    
    if (status === 'Paid' && bill.status !== 'Paid') {
      bill.paymentDate = Date.now();
      bill.paymentMethod = paymentMethod || bill.paymentMethod;
      bill.receiptNumber = receiptNumber || bill.receiptNumber;
    }

    const updatedBill = await bill.save();
    res.status(200).json({
      success: true,
      data: updatedBill
    });
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private/Admin
const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (bill) {
    await bill.deleteOne();
    res.status(200).json({
      success: true,
      data: {}
    });
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Create bills automatically for all users
// @route   POST /api/bills/generate-all
// @access  Private/Admin
const generateBillsForAllUsers = asyncHandler(async (req, res) => {
  const { description, amount, dueDate } = req.body;
  
  if (!description || !amount || !dueDate) {
    res.status(400);
    throw new Error('Please provide description, amount and due date');
  }

  // Get all active users
  const users = await User.find({ status: 'active' });
  
  if (users.length === 0) {
    res.status(404);
    throw new Error('No active users found');
  }

  const createdBills = [];
  const failedUsers = [];

  // Create bills for each user
  for (const user of users) {
    try {
      const bill = await Bill.create({
        user: user._id,
        description,
        amount,
        dueDate,
        status: 'Pending'
      });
      
      createdBills.push(bill);
    } catch (error) {
      failedUsers.push({
        userId: user._id,
        username: user.username,
        error: error.message
      });
    }
  }

  res.status(201).json({
    success: true,
    count: createdBills.length,
    data: {
      bills: createdBills,
      failedUsers: failedUsers
    },
    message: `Successfully created ${createdBills.length} bills. Failed for ${failedUsers.length} users.`
  });
});

// @desc    Get bills for logged in user
// @route   GET /api/bills/my-bills
// @access  Private
const getMyBills = asyncHandler(async (req, res) => {
  // Make sure we have user information
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated or missing ID');
  }

  console.log(`Fetching bills for user: ${req.user._id}, role: ${req.user.role}`);
  
  // req.user is set by the authMiddleware
  const bills = await Bill.find({ user: req.user._id });
  
  console.log(`Found ${bills.length} bills for user ${req.user._id}`);
  
  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills
  });
});

// @desc    Pay bill
// @route   PUT /api/bills/:id/pay
// @access  Private
const payBill = asyncHandler(async (req, res) => {
  // Make sure we have user information
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated or missing ID');
  }

  const { paymentMethod } = req.body;
  
  // Find the bill
  const bill = await Bill.findById(req.params.id);
  
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }
  
  console.log(`Attempting to pay bill ${bill._id} by user ${req.user._id}`);
  console.log(`Bill belongs to user: ${bill.user}`);
  
  // Check if bill belongs to logged in user
  if (bill.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pay this bill');
  }
  
  // Check if bill is already paid
  if (bill.status === 'Paid') {
    res.status(400);
    throw new Error('Bill is already paid');
  }
  
  // Update bill status to paid
  bill.status = 'Paid';
  bill.paymentDate = Date.now();
  bill.paymentMethod = paymentMethod || 'Credit Card';
  bill.receiptNumber = 'RCP' + Date.now();
  
  const updatedBill = await bill.save();
  
  console.log(`Bill ${bill._id} marked as paid successfully`);
  
  res.status(200).json({
    success: true,
    data: updatedBill
  });
});

// @desc    Get payment history for logged in user
// @route   GET /api/user-bills/payment-history
// @access  Private
const getMyPaymentHistory = asyncHandler(async (req, res) => {
  // Make sure we have user information
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated or missing ID');
  }

  console.log(`Fetching payment history for user: ${req.user._id}, role: ${req.user.role}`);
  
  // Find bills with 'Paid' status for the current user
  const paidBills = await Bill.find({ 
    user: req.user._id,
    status: 'Paid'
  }).sort({ paymentDate: -1 }); // Sort by payment date, newest first
  
  // Calculate total amount paid
  const totalPaid = paidBills.reduce((total, bill) => total + bill.amount, 0);
  
  console.log(`Found ${paidBills.length} paid bills for user ${req.user._id}`);
  
  res.status(200).json({
    success: true,
    count: paidBills.length,
    totalPaid,
    data: paidBills
  });
});

module.exports = {
  createBill,
  getBills,
  getUserBills,
  getBillById,
  updateBill,
  updateBillStatus,
  deleteBill,
  generateBillsForAllUsers,
  getMyBills,
  payBill,
  getMyPaymentHistory
}; 