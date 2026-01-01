import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Smartphone, LogIn, Shield, Store, Scissors, Hammer, Zap, Key } from 'lucide-react';
import { Role, Order, UserProfile, PaymentRequest, OrderStatus, IncomeSettings, UserWallet } from './types';
import { MOCK_USERS, MOCK_ORDERS_V2, MOCK_PAYMENT_REQUESTS, DEFAULT_INCOME_SETTINGS } from './constants';
import { AdminDashboard } from './components/AdminDashboard';
import { ShowroomDashboard } from './components/ShowroomDashboard';
import { MeasurementDashboard } from './components/MeasurementDashboard';
import { UniversalDashboard } from './components/UniversalDashboard';
import { CustomerPortal } from './components/CustomerPortal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS_V2);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(MOCK_PAYMENT_REQUESTS);
  const [incomeSettings, setIncomeSettings] = useState<IncomeSettings>(DEFAULT_INCOME_SETTINGS);

  // Login State - Defaulting to the requested Owner account for ease
  const [loginMobile, setLoginMobile] = useState('7791007911');
  const [loginPassword, setLoginPassword] = useState('123156');
  
  // Tracking State
  const [trackBillNo, setTrackBillNo] = useState('');
  const [isTrackingMode, setIsTrackingMode] = useState(false);

  const handleLogin = () => {
    const user = users.find(u => u.mobile === loginMobile && u.password === loginPassword);
    if (user) {
      if (!user.isActive) {
        alert("Account is inactive. Contact Admin.");
        return;
      }
      setCurrentUser(user);
      setIsTrackingMode(false);
    } else {
      alert("Invalid Credentials");
    }
  };

  // --- NEW: QUICK LOGIN FUNCTION ---
  const quickLogin = (roleType: string) => {
      let targetUser;
      if (roleType === 'OWNER') targetUser = users.find(u => u.mobile === '7791007911');
      if (!targetUser && roleType === 'ADMIN') targetUser = users.find(u => u.role === Role.ADMIN);
      if (roleType === 'SHOWROOM') targetUser = users.find(u => u.role === Role.SHOWROOM);
      if (roleType === 'MASTER') targetUser = users.find(u => u.role === Role.MEASUREMENT);
      if (roleType === 'WORKER') targetUser = users.find(u => u.role === Role.SHIRT_MAKER);

      if (targetUser) {
          setLoginMobile(targetUser.mobile);
          setLoginPassword(targetUser.password || '');
          setCurrentUser(targetUser);
          setIsTrackingMode(false);
      } else {
          alert("Demo user not found. Please try manually.");
      }
  };

  const handleTrackOrder = () => {
    if (trackBillNo.trim()) {
      setIsTrackingMode(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsTrackingMode(false);
    setLoginMobile('');
    setLoginPassword('');
    setTrackBillNo('');
  };

  // Global Handlers
  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => {
      const exists = prev.find(o => o.id === updatedOrder.id);
      if (exists) {
        return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      }
      return [updatedOrder, ...prev];
    });
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleRequestPayment = (req: Partial<PaymentRequest>) => {
      const newReq: PaymentRequest = {
        id: `PAY-${Date.now()}`,
        userId: currentUser?.id || '',
        userName: currentUser?.name || '',
        userRole: currentUser?.role || Role.CUSTOMER,
        amount: req.amount || 0,
        type: req.type || 'WITHDRAWAL',
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
        mode: req.mode || 'UPI',
        utr: req.utr,
        sourceWallet: req.sourceWallet
      };
      setPaymentRequests([newReq, ...paymentRequests]);
  };

  const handleProcessPayment = (id: string, action: 'APPROVED' | 'REJECTED') => {
      setPaymentRequests(prev => prev.map(p => p.id === id ? { ...p, status: action } : p));
      
      if (action === 'APPROVED') {
          const req = paymentRequests.find(p => p.id === id);
          if (req && req.type === 'DEPOSIT') {
              // Add to Stitching Wallet (usually)
              const user = users.find(u => u.id === req.userId);
              if (user) {
                  const updatedUser = {
                      ...user,
                      wallet: {
                          ...user.wallet,
                          stitchingWallet: user.wallet.stitchingWallet + req.amount,
                          transactions: [
                              { id: `TX-${Date.now()}`, amount: req.amount, type: 'CREDIT' as const, description: 'Wallet Deposit Approved', date: new Date().toISOString().split('T')[0] },
                              ...user.wallet.transactions
                          ]
                      }
                  };
                  handleUpdateUser(updatedUser);
              }
          }
      }
  };

  // Distribute Bonus Logic for Admin
  const handleDistributeBonus = (transactions: {userId: string, amount: number, desc: string, totalCost: number}[]) => {
      // Deduct from Admin Downline Income
      if (currentUser && currentUser.role === Role.ADMIN) {
           const totalPayout = transactions.reduce((sum, t) => sum + t.amount, 0);
           const updatedAdmin = {
               ...currentUser,
               wallet: {
                   ...currentUser.wallet,
                   downlineIncome: currentUser.wallet.downlineIncome - totalPayout,
                   transactions: [
                       { id: `BONUS-PAY-${Date.now()}`, amount: totalPayout, type: 'DEBIT' as const, description: 'Monthly Bonus Distribution', date: new Date().toISOString().split('T')[0] },
                       ...currentUser.wallet.transactions
                   ]
               }
           };
           handleUpdateUser(updatedAdmin);
      }

      // Credit to Workers
      const updatedUsers = users.map(u => {
          const tx = transactions.find(t => t.userId === u.id);
          if (tx) {
              return {
                  ...u,
                  wallet: {
                      ...u.wallet,
                      performanceWallet: u.wallet.performanceWallet + tx.amount,
                      mainBalance: u.wallet.mainBalance + tx.amount, // Usually bonuses go to main balance/withdrawable
                      transactions: [
                          { id: `BONUS-REC-${Date.now()}`, amount: tx.amount, type: 'CREDIT' as const, description: tx.desc, date: new Date().toISOString().split('T')[0] },
                          ...u.wallet.transactions
                      ]
                  }
              };
          }
          return u;
      });
      setUsers(updatedUsers);
  };

  // Wallet Transfer Logic
  const handleTransfer = (senderId: string, receiverId: string, amount: number, source: keyof UserWallet, dest: 'mainBalance' | 'stitchingWallet', isSelf: boolean) => {
      const sender = users.find(u => u.id === senderId);
      const receiver = users.find(u => u.id === receiverId); // Could be same as sender

      if (!sender || !receiver) { alert("User not found"); return; }
      
      // @ts-ignore
      if (sender.wallet[source] < amount) { alert("Insufficient Balance"); return; }

      // Deduct Sender
      const updatedSender = {
          ...sender,
          wallet: {
              ...sender.wallet,
              [source]: (sender.wallet[source] as number) - amount,
              transactions: [
                  { id: `TR-OUT-${Date.now()}`, amount: amount, type: 'DEBIT' as const, description: isSelf ? `Self Transfer to ${dest}` : `Transfer to ${receiver.name}`, date: new Date().toISOString().split('T')[0] },
                  ...sender.wallet.transactions
              ]
          }
      };

      // If Self Transfer
      if (isSelf) {
           // We already deducted from source in updatedSender. Now add to dest in updatedSender.
           // @ts-ignore
           updatedSender.wallet[dest] = (updatedSender.wallet[dest] as number) + amount;
           updatedSender.wallet.transactions.unshift({
               id: `TR-IN-${Date.now()}`, amount: amount, type: 'CREDIT' as const, description: `Transfer from ${source}`, date: new Date().toISOString().split('T')[0] 
           });
           handleUpdateUser(updatedSender);
           alert("Transfer Successful");
           return;
      }

      // If P2P Transfer
      // 1. Update Sender
      handleUpdateUser(updatedSender);

      // 2. Update Receiver
      const updatedReceiver = {
          ...receiver,
          wallet: {
              ...receiver.wallet,
              [dest]: (receiver.wallet[dest] as number) + amount,
              transactions: [
                  { id: `TR-RCV-${Date.now()}`, amount: amount, type: 'CREDIT' as const, description: `Received from ${sender.name}`, date: new Date().toISOString().split('T')[0] },
                  ...receiver.wallet.transactions
              ]
          }
      };
      
      setUsers(prev => prev.map(u => {
          if (u.id === senderId) return updatedSender;
          if (u.id === receiverId) return updatedReceiver;
          return u;
      }));
      
      if (currentUser?.id === senderId) setCurrentUser(updatedSender); // Update local current user ref
      alert("Transfer Sent Successfully");
  };

  // Split Order Logic (Measurement)
  const handleSplitOrder = (parentId: string, newOrders: Order[]) => {
      setOrders(prev => {
          const filtered = prev.filter(o => o.id !== parentId);
          return [...newOrders, ...filtered];
      });
  };

  // --- RENDER ---
  if (!currentUser && !isTrackingMode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-900/20 via-black to-black"></div>
        <div className="absolute w-96 h-96 bg-gold-600/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
        
        <div className="w-full max-w-lg relative z-10 space-y-4">
           <div className="text-center mb-6">
              <h1 className="font-serif text-4xl text-gold-500 font-bold mb-2 tracking-widest drop-shadow-[0_0_15px_rgba(212,160,0,0.5)]">LORD'S</h1>
              <p className="text-xs text-gray-500 uppercase tracking-[0.5em]">Bespoke Tailoring System</p>
           </div>

           <div className="bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-gold-900/50 shadow-2xl overflow-hidden relative">
              
              {/* Highlight Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>

              {/* --- NEW: ONE-CLICK BUTTONS (Prominent Grid) --- */}
              <div className="mb-6">
                  <p className="text-center text-[10px] text-gold-400 font-bold uppercase tracking-widest mb-3 bg-gold-900/20 py-2 rounded border border-gold-900/50">⚡ Tap to Login Instantly ⚡</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => quickLogin('OWNER')} className="flex items-center gap-2 p-2 bg-gradient-to-br from-gold-600 to-gold-500 rounded-lg hover:from-gold-400 hover:to-gold-500 text-black font-bold text-xs shadow-lg"><Shield className="w-4 h-4"/> Owner Login</button>
                      <button onClick={() => quickLogin('SHOWROOM')} className="flex items-center gap-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 text-blue-400 font-bold text-xs"><Store className="w-4 h-4"/> Showroom</button>
                      <button onClick={() => quickLogin('MASTER')} className="flex items-center gap-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 text-purple-400 font-bold text-xs"><Scissors className="w-4 h-4"/> Master</button>
                      <button onClick={() => quickLogin('WORKER')} className="flex items-center gap-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 text-green-400 font-bold text-xs"><Hammer className="w-4 h-4"/> Karigar</button>
                  </div>
              </div>

              <div className="space-y-4 mb-6">
                 <div className="relative">
                    <Smartphone className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Mobile Number" 
                      className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-gold-500 focus:outline-none transition-colors placeholder-gray-600"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value)}
                    />
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-gold-500 focus:outline-none transition-colors placeholder-gray-600"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                 </div>
                 <button 
                   onClick={handleLogin}
                   className="w-full bg-zinc-800 text-gray-400 font-bold py-4 rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 group border border-zinc-700 hover:text-white hover:border-zinc-600"
                 >
                   MANUAL LOGIN <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>

              {/* --- NEW: VISIBLE CREDENTIALS LIST --- */}
              <div className="border-t border-zinc-800 pt-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-3 font-bold">👇 All Demo IDs & Passwords 👇</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
                      <div className="bg-black/50 p-2 rounded border border-zinc-800 flex justify-between items-center text-gold-500">
                          <span className="font-bold flex items-center gap-1"><Shield className="w-3 h-3"/> Owner</span>
                          <span className="font-mono">7791007911 / 123156</span>
                      </div>
                      <div className="bg-black/50 p-2 rounded border border-zinc-800 flex justify-between items-center text-gray-300">
                          <span className="font-bold flex items-center gap-1"><Shield className="w-3 h-3"/> Admin</span>
                          <span className="font-mono">9999999999 / admin123</span>
                      </div>
                      <div className="bg-black/50 p-2 rounded border border-zinc-800 flex justify-between items-center text-blue-400">
                          <span className="font-bold flex items-center gap-1"><Store className="w-3 h-3"/> Showroom</span>
                          <span className="font-mono">8888888888 / shop123</span>
                      </div>
                      <div className="bg-black/50 p-2 rounded border border-zinc-800 flex justify-between items-center text-purple-400">
                          <span className="font-bold flex items-center gap-1"><Scissors className="w-3 h-3"/> Master</span>
                          <span className="font-mono">7777777771 / meas123</span>
                      </div>
                      <div className="bg-black/50 p-2 rounded border border-zinc-800 flex justify-between items-center text-orange-400">
                          <span className="font-bold flex items-center gap-1"><Scissors className="w-3 h-3"/> Cutting</span>
                          <span className="font-mono">7777777773 / cut123</span>
                      </div>
                      <div className="bg-black/50 p-2 rounded border border-zinc-800 flex justify-between items-center text-green-400">
                          <span className="font-bold flex items-center gap-1"><Hammer className="w-3 h-3"/> Worker</span>
                          <span className="font-mono">7777777774 / stitch123</span>
                      </div>
                  </div>
              </div>

           </div>

           {/* Tracking Input */}
           <div className="bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-gold-800/30 flex flex-col md:flex-row gap-3 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-20">
               <input 
                  type="text" 
                  placeholder="Ex: BILL-8392" 
                  className="w-full md:flex-1 bg-transparent border-none text-white text-lg px-4 md:px-6 py-3 md:py-4 focus:outline-none placeholder-gray-600 font-mono tracking-widest uppercase text-center md:text-left"
                  value={trackBillNo}
                  onChange={(e) => setTrackBillNo(e.target.value)}
               />
               <button 
                  onClick={handleTrackOrder}
                  className="w-full md:w-auto bg-gradient-to-r from-zinc-800 to-zinc-900 border border-gold-900 text-gold-500 px-10 py-3 md:py-4 rounded-xl font-bold hover:text-white transition-all flex items-center justify-center gap-3 group"
               >
                  <span>TRACK</span> 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
           </div>
           
           <p className="text-center text-[9px] text-gray-700">Secure System v2025.2.6 • Powered by Lord's Intelligence</p>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARDS ---
  
  // 1. Customer Tracking (Public)
  if (isTrackingMode) {
      return (
         <div className="min-h-screen bg-black p-4">
             <button onClick={() => setIsTrackingMode(false)} className="text-gold-500 mb-4 flex items-center gap-2"><ArrowRight className="rotate-180 w-4 h-4"/> Back to Login</button>
             <CustomerPortal orders={orders} />
         </div>
      );
  }

  if (!currentUser) return null; // Should not happen

  // 2. Admin
  if (currentUser.role === Role.ADMIN) {
      return (
        <AdminDashboard 
           currentUser={currentUser} 
           orders={orders} 
           users={users} 
           onLogout={handleLogout} 
           onUpdateOrder={handleUpdateOrder} 
           globalPaymentRequests={paymentRequests}
           onProcessPayment={handleProcessPayment}
           onDistributeBonus={handleDistributeBonus}
           incomeSettings={incomeSettings}
           onUpdateSettings={setIncomeSettings}
        />
      );
  }

  // 3. Showroom
  if (currentUser.role === Role.SHOWROOM) {
      return (
        <ShowroomDashboard 
          currentUser={currentUser}
          orders={orders}
          users={users}
          onLogout={handleLogout}
          onUpdateOrder={handleUpdateOrder}
          onRequestPayment={handleRequestPayment}
          onUpdateUser={handleUpdateUser}
          onTransfer={handleTransfer}
        />
      );
  }

  // 4. Measurement
  if (currentUser.role === Role.MEASUREMENT) {
      return (
          <MeasurementDashboard 
              currentUser={currentUser}
              orders={orders}
              users={users}
              onLogout={handleLogout}
              onUpdateOrder={handleUpdateOrder}
              onRequestPayment={handleRequestPayment}
              onUpdateUser={handleUpdateUser}
              onSplitOrder={handleSplitOrder}
          />
      );
  }

  // 5. Workers / Universal (Cutting, Makers, Finishing, Delivery)
  return (
    <UniversalDashboard 
       currentUser={currentUser} 
       orders={orders} 
       users={users} 
       onLogout={handleLogout} 
       onUpdateOrder={handleUpdateOrder}
       onRequestPayment={handleRequestPayment}
       onUpdateUser={handleUpdateUser}
       onTransfer={handleTransfer}
    />
  );
}