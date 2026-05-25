import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  ListFilter, 
  LayoutDashboard, 
  PieChart as PieChartIcon, 
  Settings, 
  Bell, 
  Search, 
  TrendingUp, 
  MoreHorizontal 
} from 'lucide-react';
import FileUpload from './FileUpload';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function startFetching() {
      try {
        const [resAll, resRecent] = await Promise.all([
          axios.get('http://localhost:8080/api/transactions'),
          axios.get('http://localhost:8080/api/transactions/recent')
        ]);
        
        if (!ignore) {
          setTransactions(resAll.data || []);
          setRecent(resRecent.data || []);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    startFetching();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  // Calculs mémorisés pour éviter les re-rendus inutiles et sécuriser les valeurs
  const stats = useMemo(() => {
    const debit = transactions
      .filter(t => t.direction === 'DEBIT')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    
    const credit = transactions
      .filter(t => t.direction === 'CREDIT')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    return {
      totalDebit: debit,
      totalCredit: credit,
      balance: credit - debit
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    if (transactions.length === 0) return null;

    const sorted = [...transactions].sort((a, b) => 
      new Date(a.operationDate) - new Date(b.operationDate)
    );

    let currentBalance = 0;
    const dataPoints = sorted.map(t => {
      const amount = Number(t.amount || 0);
      const diff = t.direction === 'CREDIT' ? amount : -amount;
      currentBalance += diff;
      return {
        x: new Date(t.operationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        y: currentBalance
      };
    });

    return {
      labels: dataPoints.map(d => d.x),
      datasets: [
        {
          fill: true,
          label: 'Solde (€)',
          data: dataPoints.map(d => d.y),
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: 10,
        },
      ],
    };
  }, [transactions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { display: false },
      y: { 
        ticks: { callback: (value) => value + ' €' },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-bold tracking-tight">Initialisation de MyFin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans text-[#1C2434] antialiased">
      {/* Sidebar de navigation - Thème Sombre */}
      <aside className="w-72 bg-[#1C2434] hidden xl:flex flex-col sticky top-0 h-screen overflow-y-auto transition-all">
        <div className="flex items-center gap-3 p-8 mb-4">
          <div className="w-9 h-9 bg-[#3C50E0] rounded-lg flex items-center justify-center text-white">
            <Wallet size={24} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">MyFin</span>
        </div>

        <nav className="flex-1 px-6 space-y-1">
          <p className="text-xs font-semibold text-[#8A99AF] mb-4 px-3 uppercase tracking-widest">Menu</p>
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isDark />
          <NavItem icon={<PieChartIcon size={18} />} label="Analyses" active={activeTab === 'analyses'} onClick={() => setActiveTab('analyses')} isDark />
          <NavItem icon={<Clock size={18} />} label="Transactions" active={activeTab === 'history'} onClick={() => setActiveTab('history')} isDark />
          
          <div className="pt-10">
            <p className="text-xs font-semibold text-[#8A99AF] mb-4 px-3 uppercase tracking-widest">Support</p>
            <NavItem icon={<Settings size={18} />} label="Paramètres" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isDark />
          </div>
        </nav>

        <div className="p-6">
          <div className="bg-[#24303F] rounded-sm p-4 text-center">
            <p className="text-white text-xs font-bold mb-3">Besoin de plus d'exports ?</p>
            <button className="w-full py-2 bg-[#3C50E0] text-white text-xs font-bold rounded-sm hover:bg-opacity-90 transition-all uppercase tracking-tighter">Passer Premium</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Type to search..." className="w-full pl-8 pr-4 py-2 text-sm outline-none" />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold leading-none">Justin Doe</p>
                <p className="text-xs text-slate-500 mt-1">Administrator</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold">JD</div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {activeTab === 'dashboard' ? (
            <>
              {/* Top Summary Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Balance" amount={stats.balance} icon={<Wallet size={24} />} color="indigo" />
                <StatCard title="Total Income" amount={stats.totalCredit} icon={<ArrowUpCircle size={24} />} color="emerald" />
                <StatCard title="Total Expenses" amount={stats.totalDebit} icon={<ArrowDownCircle size={24} />} color="rose" />
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Main Graph Card */}
                <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-[#1C2434]">Cash Flow Overview</h3>
                    <select className="text-sm font-medium text-slate-500 bg-slate-50 border-none rounded px-3 py-1 outline-none">
                      <option>Last 30 days</option>
                    </select>
                  </div>
                  <div className="h-[320px]">
                    {chartData ? <Line data={chartData} options={chartOptions} /> : <div className="h-full flex items-center justify-center text-slate-300 italic">Données insuffisantes...</div>}
                  </div>
                </div>

                {/* Right Sidebar Components */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <FileUpload onImportSuccess={() => setRefreshKey(k => k + 1)} />
                  <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
                    <h3 className="font-bold text-[#1C2434] mb-6">Spending Analysis</h3>
                    <div className="space-y-6">
                      <CategoryMiniProgress label="Housing" percent={42} color="bg-[#3C50E0]" />
                      <CategoryMiniProgress label="Food & Drinks" percent={28} color="bg-[#10B981]" />
                      <CategoryMiniProgress label="Entertainment" percent={15} color="bg-[#F87171]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* List of operations */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1C2434]">Recent Transactions</h3>
                  <button className="px-4 py-2 bg-slate-100 rounded text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-2 uppercase">
                    <ListFilter size={16} /> Filtrer
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="table-header">Description</th>
                        <th className="table-header">Date</th>
                        <th className="table-header text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recent.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="table-cell font-medium text-[#1C2434]">{t.rawLabel}</td>
                          <td className="table-cell text-xs font-semibold">
                            {new Date(t.operationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className={`table-cell text-right font-bold ${t.direction === 'DEBIT' ? 'text-[#F87171]' : 'text-[#10B981]'}`}>
                            {t.direction === 'DEBIT' ? '-' : '+'}{(t.amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-24 rounded-[3rem] text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <LayoutDashboard size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Section {activeTab}</h2>
              <p className="text-slate-400 font-medium mb-8 text-lg">Cette partie de l'application MyFin arrive très prochainement.</p>
              <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-105 transition-transform">Retour à l'accueil</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button onClick={onClick} className={`sidebar-item w-full ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function CategoryMiniProgress({ label, percent, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-[#637381]">{label}</span>
        <span className="text-[#1C2434]">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-[#F1F5F9] rounded-sm overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, color }) {
  return (
    <div className="bg-white border border-slate-200 p-6 shadow-sm flex items-center gap-5 rounded-sm">
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#F1F5F9] text-[#3C50E0]">
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-bold text-[#1C2434] leading-none mb-1">{amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</h4>
        <p className="text-xs font-semibold text-[#637381] uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}
