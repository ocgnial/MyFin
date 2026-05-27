import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  CircleDollarSign,
  FileSpreadsheet,
  Search,
  SlidersHorizontal,
  Tags,
  TrendingUp,
  Wallet,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchTransactions() {
      setError(null);

      try {
        const response = await axios.get('http://localhost:8080/api/transactions');

        if (!ignore) {
          setTransactions(response.data || []);
        }
      } catch (err) {
        console.warn('Transactions indisponibles', err);

        if (!ignore) {
          setError('Impossible de charger les transactions. Verifiez que le backend est demarre.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchTransactions();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const stats = useMemo(() => {
    const debitTransactions = transactions.filter(t => t.direction === 'DEBIT');
    const totalDebit = debitTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalCredit = transactions
      .filter(t => t.direction === 'CREDIT')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const dates = transactions
      .map(t => t.operationDate)
      .filter(Boolean)
      .sort((a, b) => new Date(a) - new Date(b));

    return {
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit,
      count: transactions.length,
      firstDate: dates[0],
      lastDate: dates[dates.length - 1],
      averageDebit: debitTransactions.length ? totalDebit / debitTransactions.length : 0,
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    if (transactions.length === 0) return null;

    const sorted = [...transactions].sort((a, b) =>
      new Date(a.operationDate) - new Date(b.operationDate)
    );

    let currentBalance = 0;
    const dataPoints = sorted.map(transaction => {
      const amount = Number(transaction.amount || 0);
      currentBalance += transaction.direction === 'CREDIT' ? amount : -amount;

      return {
        x: new Date(transaction.operationDate).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        }),
        y: currentBalance,
      };
    });

    return {
      labels: dataPoints.map(point => point.x),
      datasets: [
        {
          fill: true,
          label: 'Solde estime',
          data: dataPoints.map(point => point.y),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.09)',
          tension: 0.35,
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
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: context => formatCurrency(context.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', maxTicksLimit: 6 },
      },
      y: {
        ticks: {
          color: '#64748b',
          callback: value => formatCompactCurrency(value),
        },
        grid: { color: '#e2e8f0' },
      },
    },
  };

  const categoryBreakdown = useMemo(() => {
    const totals = transactions
      .filter(t => t.direction === 'DEBIT')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Non categorise';
        acc[category] = (acc[category] || 0) + Number(transaction.amount || 0);
        return acc;
      }, {});

    return Object.entries(totals)
      .map(([label, amount]) => ({
        label,
        amount,
        percent: stats.totalDebit ? Math.round((amount / stats.totalDebit) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, stats.totalDebit]);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions
      .filter(t => directionFilter === 'ALL' || t.direction === directionFilter)
      .filter(t => {
        if (!normalizedQuery) return true;
        return `${t.rawLabel || ''} ${t.cleanLabel || ''} ${t.category || ''}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => new Date(b.operationDate) - new Date(a.operationDate));
  }, [transactions, query, directionFilter]);

  if (loading && transactions.length === 0) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          <div className="spinner" />
          <p>Chargement de MyFin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="page-container header-layout">
          <div className="brand-block">
            <div className="brand-icon">
              <Wallet size={24} />
            </div>
            <div>
              <p className="brand-kicker">MyFin</p>
              <h1>Apercu financier personnel</h1>
              <p className="header-copy">
                Suivez vos imports, vos flux et vos operations recentes depuis vos fichiers bancaires.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <PeriodBadge firstDate={stats.firstDate} lastDate={stats.lastDate} />
            <button type="button" className="secondary-button" onClick={() => setRefreshKey(key => key + 1)}>
              Actualiser
            </button>
          </div>
        </div>
      </header>

      <main className="page-container main-content">
        {error && <div className="alert alert-error">{error}</div>}

        <section className="stats-grid">
          <StatCard title="Solde estime" amount={stats.balance} icon={<Wallet size={22} />} tone="blue" />
          <StatCard title="Revenus" amount={stats.totalCredit} icon={<ArrowUpCircle size={22} />} tone="green" />
          <StatCard title="Depenses" amount={stats.totalDebit} icon={<ArrowDownCircle size={22} />} tone="red" />
          <MetricCard
            title="Transactions"
            value={stats.count}
            detail={`${formatCurrency(stats.averageDebit)} de depense moyenne`}
            icon={<CircleDollarSign size={22} />}
          />
        </section>

        <section className="dashboard-grid">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Flux de tresorerie</h2>
                <p>Evolution estimee du solde a partir des operations importees.</p>
              </div>
              <span className="soft-badge">
                <TrendingUp size={16} />
                Toutes les donnees
              </span>
            </div>

            <div className="chart-box">
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <EmptyState
                  icon={<FileSpreadsheet size={28} />}
                  title="Aucune operation importee"
                  description="Importez un fichier Excel pour afficher votre courbe de tresorerie."
                />
              )}
            </div>
          </article>

          <aside className="side-column">
            <FileUpload onImportSuccess={() => setRefreshKey(key => key + 1)} />

            <article className="panel">
              <div className="panel-heading compact">
                <div>
                  <h2>Depenses par categorie</h2>
                  <p>Top categories detectees dans les imports.</p>
                </div>
                <Tags className="muted-icon" size={22} />
              </div>

              {categoryBreakdown.length > 0 ? (
                <div className="category-list">
                  {categoryBreakdown.map((category, index) => (
                    <CategoryMiniProgress key={category.label} {...category} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={<Tags size={24} />}
                  title="Pas encore de categories"
                  description="Les categories apparaitront apres import et categorisation."
                />
              )}
            </article>
          </aside>
        </section>

        <section className="panel transactions-panel">
          <div className="transactions-header">
            <div>
              <h2>Operations</h2>
              <p>
                {filteredTransactions.length} operation{filteredTransactions.length > 1 ? 's' : ''} affichee{filteredTransactions.length > 1 ? 's' : ''}.
              </p>
            </div>

            <div className="table-tools">
              <div className="search-field">
                <Search size={18} />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Rechercher une operation"
                />
              </div>

              <div className="segmented-control">
                <FilterButton active={directionFilter === 'ALL'} onClick={() => setDirectionFilter('ALL')}>
                  Tout
                </FilterButton>
                <FilterButton active={directionFilter === 'DEBIT'} onClick={() => setDirectionFilter('DEBIT')}>
                  Depenses
                </FilterButton>
                <FilterButton active={directionFilter === 'CREDIT'} onClick={() => setDirectionFilter('CREDIT')}>
                  Revenus
                </FilterButton>
              </div>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th>Categorie</th>
                    <th>Date</th>
                    <th className="align-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, 50).map(transaction => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="transaction-label" title={transaction.rawLabel}>
                          {transaction.cleanLabel || transaction.rawLabel}
                        </div>
                        {transaction.cleanLabel && transaction.cleanLabel !== transaction.rawLabel && (
                          <div className="transaction-raw" title={transaction.rawLabel}>
                            {transaction.rawLabel}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="category-pill">{transaction.category || 'Non categorise'}</span>
                      </td>
                      <td className="nowrap">{formatDate(transaction.operationDate)}</td>
                      <td className={`amount-cell ${transaction.direction === 'DEBIT' ? 'is-debit' : 'is-credit'}`}>
                        {transaction.direction === 'DEBIT' ? '-' : '+'}{formatCurrency(Number(transaction.amount || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-table">
              <EmptyState
                icon={<SlidersHorizontal size={28} />}
                title="Aucune operation ne correspond"
                description="Modifiez la recherche ou le filtre pour retrouver vos transactions."
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button type="button" className={active ? 'active' : ''} onClick={onClick}>
      {children}
    </button>
  );
}

function CategoryMiniProgress({ label, percent, amount, index }) {
  const className = `category-bar-fill tone-${index + 1}`;

  return (
    <div className="category-row">
      <div className="category-row-top">
        <span>{label}</span>
        <strong>{formatCurrency(amount)}</strong>
      </div>
      <div className="category-row-bottom">
        <div className="category-bar">
          <div className={className} style={{ width: `${percent}%` }} />
        </div>
        <span>{percent}%</span>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon tone-${tone}`}>{icon}</div>
      <p>{title}</p>
      <strong>{formatCurrency(amount)}</strong>
    </article>
  );
}

function MetricCard({ title, value, detail, icon }) {
  return (
    <article className="stat-card">
      <div className="stat-icon tone-neutral">{icon}</div>
      <p>{title}</p>
      <strong>{value.toLocaleString('fr-FR')}</strong>
      <span>{detail}</span>
    </article>
  );
}

function PeriodBadge({ firstDate, lastDate }) {
  const label = firstDate && lastDate
    ? `${formatDate(firstDate)} - ${formatDate(lastDate)}`
    : 'Aucune periode importee';

  return (
    <div className="period-badge">
      <CalendarDays size={17} />
      {label}
    </div>
  );
}

function EmptyState({ icon, title, description, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'compact' : ''}`}>
      <div className="empty-icon">{icon}</div>
      <p>{title}</p>
      <span>{description}</span>
    </div>
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

function formatCompactCurrency(value) {
  return Number(value || 0).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return 'Date inconnue';

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
