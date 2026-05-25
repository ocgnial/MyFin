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
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans text-slate-900 selection:bg-indigo-100 antialiased">
      {/* Sidebar - Design fixe et élégant */}
      <aside className="w-80 bg-white border-r border-slate-200 hidden xl:flex flex-col p-10 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <Wallet size={28} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">MyFin.</span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Menu Principal</p>
          <NavItem icon={<LayoutDashboard size={20} />} label="Tableau de bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<PieChartIcon size={20} />} label="Rapports" active={activeTab === 'analyses'} onClick={() => setActiveTab('analyses')} />
          <NavItem icon={<Clock size={20} />} label="Historique" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <div className="pt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Compte</p>
            <NavItem icon={<Settings size={20} />} label="Paramètres" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </nav>

        <div className="mt-auto bg-slate-900 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-slate-200">
          <p className="text-sm font-bold mb-2">Version Pro Active</p>
          <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">Débloquez l'IA pour catégoriser vos transactions.</p>
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black transition-all">MISE À JOUR</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 lg:p-14 space-y-12">
          {/* Header - Contexte utilisateur */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Dashboard.</h1>
              <p className="text-slate-500 font-medium italic">Bienvenue, Justin. Voici le résumé de votre santé financière.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="Chercher une dépense..." className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium w-64 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all" />
              </div>
              <button className="w-12 h-12 glass-card flex items-center justify-center text-slate-500 relative !rounded-2xl">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg shadow-slate-300">JD</div>
            </div>
          </header>

          {activeTab === 'dashboard' ? (
            <>
              {/* Stats Grid - Cartes avec soul */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="Solde Disponible" amount={stats.balance} icon={<Wallet size={20} />} color="indigo" />
                <StatCard title="Total Crédits" amount={stats.totalCredit} icon={<ArrowUpCircle size={20} />} color="emerald" />
                <StatCard title="Total Débits" amount={stats.totalDebit} icon={<ArrowDownCircle size={20} />} color="rose" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Chart Section */}
                <div className="lg:col-span-2 glass-card p-10 min-h-[450px] flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <TrendingUp className="text-indigo-500" /> Flux de trésorerie
                    </h3>
                    <select className="bg-slate-100 border-none rounded-xl px-4 py-2 text-[11px] font-black text-slate-500 outline-none uppercase tracking-widest cursor-pointer">
                      <option>Derniers 30 jours</option>
                      <option>Dernier mois</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    {chartData ? <Line data={chartData} options={chartOptions} /> : <div className="h-full flex items-center justify-center text-slate-300 italic">Données insuffisantes...</div>}
                  </div>
                </div>

                {/* Right Column: Actions & Category Breakdown */}
                <div className="space-y-6">
                  <FileUpload onImportSuccess={() => setRefreshKey(k => k + 1)} />
                  <div className="glass-card p-8 space-y-6 !rounded-[2.5rem]">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">Analyse par catégorie</h3>
                    <CategoryMiniProgress label="Habitation" percent={42} color="bg-indigo-500" />
                    <CategoryMiniProgress label="Alimentation" percent={28} color="bg-emerald-500" />
                    <CategoryMiniProgress label="Loisirs" percent={15} color="bg-rose-500" />
                    <button className="w-full py-4 text-xs font-black text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-colors uppercase tracking-widest">Voir le détail</button>
                  </div>
                </div>
              </div>

              {/* Transactions Table - Clean & High density */}
              <div className="glass-card overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Dernières opérations</h3>
                  <button className="px-6 py-3 bg-slate-100 rounded-2xl text-[11px] font-black text-slate-500 hover:bg-slate-200 transition-all flex items-center gap-2 uppercase tracking-widest">
                    <ListFilter size={16} /> Filtrer
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/40 border-b border-slate-100">
                      <tr className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                        <th className="px-10 py-5">Désignation</th>
                        <th className="px-10 py-5">Date</th>
                        <th className="px-10 py-5 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recent.map((t) => (
                        <tr key={t.id} className="group hover:bg-slate-50/60 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${t.direction === 'DEBIT' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                {t.direction === 'DEBIT' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                              </div>
                              <span className="font-bold text-slate-700 tracking-tight">{t.rawLabel}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-slate-400 font-bold text-sm">
                            {new Date(t.operationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className={`px-10 py-6 text-right font-black text-lg ${t.direction === 'DEBIT' ? 'text-slate-900' : 'text-emerald-600'}`}>
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
        <span className="text-slate-400">{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, color }) {
  const colorConfig = {
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50' }
  };

  return (
    <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorConfig[color].bg} ${colorConfig[color].text}`}>
        {icon}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
        {amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
      </h4>
      <div className={`absolute bottom-0 right-0 w-24 h-24 -mr-8 -mb-8 rounded-full opacity-5 ${colorConfig[color].text} bg-current`}></div>
    </div>
  );
}
