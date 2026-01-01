
import { Role, OrderStatus, UserProfile, ItemType, InvestmentPlan, Wallet, PaymentRequest, SystemLog, IncomeSettings } from './types';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  { id: 'inv1', name: 'Starter', amount: 5000, dailyRoiPercent: 0.5, capMultiplier: 2.3 },
  { id: 'inv2', name: 'Basic', amount: 10000, dailyRoiPercent: 0.75, capMultiplier: 2.3 },
  { id: 'inv3', name: 'Standard', amount: 20000, dailyRoiPercent: 1.4, capMultiplier: 2.3 },
];

// Robust Default Wallet to prevent crashes
const DEFAULT_WALLET = { 
  mainBalance: 0, stitchingWallet: 0, workWallet: 0, bookingWallet: 0, withdrawalWallet: 0, pendingWithdrawal: 0, 
  performanceWallet: 0, uplineIncome: 0, downlineIncome: 0, magicIncome: 0, investmentWallet: 0, 
  roiIncome: 0, transactions: [] 
};

// Users with Passwords
export const MOCK_USERS: UserProfile[] = [
  // --- SPECIAL REQUEST USER (OWNER) ---
  { 
    id: 'owner_special', 
    name: 'Lord\'s Owner', 
    role: Role.ADMIN, 
    mobile: '7791007911', 
    email: 'owner@lords.com', 
    address: 'Main HQ', 
    referralCode: 'OWNER', 
    password: '123156', 
    tPassword: '1234', 
    isActive: true, 
    wallet: { ...DEFAULT_WALLET, mainBalance: 500000, downlineIncome: 1500000 } 
  },

  // Admin (Root)
  { id: 'admin1', name: 'Super Admin', role: Role.ADMIN, mobile: '9999999999', email: 'admin@lords.com', address: 'HQ', referralCode: 'ADMIN', password: 'admin123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET, mainBalance: 50000, downlineIncome: 150000 } },
  
  // Showroom (Referred by Admin)
  { id: 'sr1', name: 'Showroom Andheri', role: Role.SHOWROOM, mobile: '8888888888', email: 'andheri@lords.com', address: 'Andheri West', referralCode: 'SR01', referredBy: 'admin1', password: 'shop123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET, stitchingWallet: 5000 } },
  
  // Material Manager (Referred by Admin)
  { id: 'mat1', name: 'Material Manager', role: Role.MATERIAL, mobile: '7777777799', email: 'material@lords.com', address: 'Warehouse', referralCode: 'MAT01', referredBy: 'admin1', password: 'mat123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET } },

  // Measurement (Referred by Showroom)
  { id: 'meas1', name: 'Rahul Measurement', role: Role.MEASUREMENT, mobile: '7777777771', email: 'rahul@lords.com', address: 'Mumbai', referralCode: 'ME01', referredBy: 'sr1', password: 'meas123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET, workWallet: 1200 } },
  { id: 'meas2', name: 'Vikram Measurement', role: Role.MEASUREMENT, mobile: '7777777772', email: 'vikram@lords.com', address: 'Pune', referralCode: 'ME02', referredBy: 'sr1', password: 'meas123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET } },

  // Cutting (Referred by Measurement)
  { id: 'cut1', name: 'Suresh Cutter', role: Role.CUTTING, mobile: '7777777773', email: 'suresh@lords.com', address: 'Mumbai', referralCode: 'CU01', referredBy: 'meas1', password: 'cut123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET, workWallet: 2500 } },
  
  // Makers (Referred by Cutting)
  { id: 'shirt1', name: 'Anil Shirt Maker', role: Role.SHIRT_MAKER, mobile: '7777777774', email: 'anil@lords.com', address: 'Workshop 1', referralCode: 'SM01', referredBy: 'cut1', password: 'stitch123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET, workWallet: 5000 } },
  { id: 'pant1', name: 'Sunil Pant Maker', role: Role.PANT_MAKER, mobile: '7777777775', email: 'sunil@lords.com', address: 'Workshop 1', referralCode: 'PM01', referredBy: 'cut1', password: 'stitch123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET, workWallet: 4200 } },
  { id: 'coat1', name: 'Raj Coat Maker', role: Role.COAT_MAKER, mobile: '7777777776', email: 'raj@lords.com', address: 'Workshop 2', referralCode: 'CM01', referredBy: 'cut1', password: 'stitch123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET } },
  { id: 'safari1', name: 'Vijay Safari', role: Role.SAFARI_MAKER, mobile: '7777777789', email: 'vijay@lords.com', address: 'Workshop 3', referralCode: 'SM02', referredBy: 'cut1', password: 'stitch123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET } },

  // Finishing Dept (Kaj/Press)
  { id: 'kaj1', name: 'Raju Kaj Button', role: Role.KAJ_BUTTON, mobile: '7777777780', email: 'raju@lords.com', address: 'Workshop 2', referralCode: 'KB01', referredBy: 'shirt1', password: 'kaj123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET } },
  { id: 'press1', name: 'Mohan Press', role: Role.PRESS, mobile: '7777777777', email: 'mohan@lords.com', address: 'Workshop 2', referralCode: 'PR01', referredBy: 'shirt1', password: 'press123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET } },
  
  // Delivery (Referred by Press)
  { id: 'del1', name: 'Vikram Delivery', role: Role.DELIVERY, mobile: '7777777778', email: 'vikram@lords.com', address: 'Logistics', referralCode: 'DE01', referredBy: 'press1', password: 'del123', tPassword: '1234', isActive: true, wallet: { ...DEFAULT_WALLET } },
];

// Sample Orders to populate the dashboard
export const MOCK_ORDERS_V2: any[] = [
  {
    id: 'ord-001',
    billNumber: 'BILL-8392',
    customerName: 'Amitabh Bachchan',
    mobile: '9876543210',
    showroomName: 'Showroom Andheri',
    orderDate: '2023-10-25',
    deliveryDate: '2023-11-05',
    status: OrderStatus.MEASUREMENT_INBOX,
    currentHandlerId: 'meas1',
    currentHandlerRole: Role.MEASUREMENT,
    bookingUserId: 'sr1',
    bookingUserName: 'Showroom Andheri',
    totalAmount: 1500,
    deliveryCode: '1234',
    items: [
      { type: ItemType.SHIRT, rate: 375, quantity: 2, measurements: 'Chest 42, Length 29', clothLength: '3.2 Mtr' },
      { type: ItemType.PANT, rate: 475, quantity: 1, measurements: 'Waist 36, Length 40', clothLength: '1.3 Mtr' }
    ],
    history: [
      { action: 'Order Created', timestamp: '2023-10-25T10:00:00Z', user: 'Showroom Andheri', role: Role.SHOWROOM },
      { action: 'Handover to Measurement', timestamp: '2023-10-25T10:05:00Z', user: 'Showroom Andheri', role: Role.SHOWROOM }
    ]
  },
  {
    id: 'ord-002',
    billNumber: 'BILL-9921',
    customerName: 'Shahrukh Khan',
    mobile: '9988776655',
    showroomName: 'Showroom Andheri',
    orderDate: '2023-10-26',
    deliveryDate: '2023-11-02',
    status: OrderStatus.CUTTING_INBOX,
    currentHandlerId: 'cut1',
    currentHandlerRole: Role.CUTTING,
    bookingUserId: 'sr1',
    bookingUserName: 'Showroom Andheri',
    totalAmount: 1200,
    deliveryCode: '5678',
    items: [
      { type: ItemType.COAT, rate: 1200, quantity: 1, measurements: 'Standard 40 Regular', clothLength: '2.0 Mtr' }
    ],
    history: [
      { action: 'Order Created', timestamp: '2023-10-26T11:00:00Z', user: 'Showroom Andheri', role: Role.SHOWROOM },
      { action: 'Measurement Completed', timestamp: '2023-10-26T12:00:00Z', user: 'Rahul Measurement', role: Role.MEASUREMENT }
    ]
  }
]; 

export const MOCK_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Total Income', balance: 0, history: [] },
  { id: 'w2', name: 'Profit Wallet', balance: 0, history: [] },
  { id: 'w3', name: 'Withdrawal Pool', balance: 0, history: [] },
  { id: 'w4', name: 'Pending Withdrawal', balance: 0, history: [] },
  { id: 'w5', name: 'Level Income', balance: 0, history: [] },
  { id: 'w6', name: 'Booking Wallet', balance: 0, history: [] },
];

export const MOCK_PAYMENT_REQUESTS: PaymentRequest[] = [
    { id: 'pay-1', userId: 'shirt1', userName: 'Anil Shirt Maker', userRole: Role.SHIRT_MAKER, type: 'WITHDRAWAL', amount: 2000, mode: 'UPI', status: 'PENDING', date: '2023-10-27' },
    { id: 'pay-2', userId: 'sr1', userName: 'Showroom Andheri', userRole: Role.SHOWROOM, type: 'DEPOSIT', amount: 50000, mode: 'NEFT', utr: 'AXIS123456', status: 'PENDING', date: '2023-10-28' }
];

export const MOCK_LOGS: SystemLog[] = [];

// New Levels: 25%, 20%, 15%, 10%, 5%, 5%, 5%, 5%, 5%, 5%
const LEVEL_PERCENTAGES = [0.25, 0.20, 0.15, 0.10, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05];

export const DEFAULT_INCOME_SETTINGS: IncomeSettings = {
  uplineLevels: LEVEL_PERCENTAGES,
  downlineLevels: LEVEL_PERCENTAGES, 
  productRates: [
    { product: 'Shirt Stitching', rate: 120 }, // UPDATED
    { product: 'Pant Stitching', rate: 220 },  // UPDATED
    { product: 'Coat Stitching', rate: 1200 },
    { product: 'Shirt Cutting', rate: 25 },
    { product: 'Pant Cutting', rate: 25 },
    { product: 'Shirt Measurement', rate: 20 },
    { product: 'Pant Measurement', rate: 30 },
    { product: 'Shirt Finishing', rate: 20 }, 
    { product: 'Pant Finishing', rate: 10 },
    { product: 'Delivery', rate: 10 },
  ],
  roleCommissions: [
    { role: Role.SHOWROOM, percentage: 5 }, // 5% Commission
    { role: Role.MATERIAL, percentage: 9 }, // 9% Allocation
    { role: Role.MEASUREMENT, percentage: 0 }, 
    { role: Role.CUTTING, percentage: 0 },
  ]
};
