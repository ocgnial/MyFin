import { useState } from 'react';
import Dashboard from './components/Dashboard';
import CategoryManager from './components/CategoryManager';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="App">
      <nav className="nav-tabs">
        <button
          className={activeTab === 'dashboard' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'categories' ? 'nav-tab active' : 'nav-tab'}
          onClick={() => setActiveTab('categories')}
        >
          Catégories
        </button>
      </nav>

      {activeTab === 'dashboard' ? <Dashboard /> : <CategoryManager />}
    </div>
  );
}

export default App;
