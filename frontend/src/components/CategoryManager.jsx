import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8080';

async function fetchCategories() {
  const res = await axios.get(`${API}/api/categories`);
  return res.data;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [keywordInputs, setKeywordInputs] = useState({});
  const [recategorizeMsg, setRecategorizeMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const load = () => fetchCategories().then(setCategories);

  async function createCategory() {
    const name = newCatName.trim();
    if (!name) return;
    try {
      await axios.post(`${API}/api/categories`, { name });
      setNewCatName('');
      load();
    } catch {
      setError('Nom déjà utilisé ou invalide.');
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Supprimer cette catégorie et tous ses mots-clés ?')) return;
    await axios.delete(`${API}/api/categories/${id}`);
    load();
  }

  async function addKeyword(id) {
    const kw = (keywordInputs[id] || '').trim();
    if (!kw) return;
    await axios.post(`${API}/api/categories/${id}/keywords`, { keyword: kw });
    setKeywordInputs(prev => ({ ...prev, [id]: '' }));
    load();
  }

  async function removeKeyword(id, keyword) {
    await axios.delete(`${API}/api/categories/${id}/keywords`, { params: { keyword } });
    load();
  }

  async function recategorize() {
    setRecategorizeMsg('En cours...');
    const res = await axios.patch(`${API}/api/transactions/recategorize`);
    setRecategorizeMsg(`${res.data.count} transactions recatégorisées.`);
  }

  return (
    <div className="category-manager">
      <div className="cm-header">
        <h1>Gestion des catégories</h1>
        <div className="cm-recategorize">
          <button className="btn-primary" onClick={recategorize}>
            Recatégoriser toutes les transactions
          </button>
          {recategorizeMsg && <span className="cm-feedback">{recategorizeMsg}</span>}
        </div>
      </div>

      <div className="cm-add-cat">
        <h2>Nouvelle catégorie</h2>
        <div className="cm-row">
          <input
            type="text"
            placeholder="Nom de la catégorie"
            value={newCatName}
            onChange={e => { setNewCatName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && createCategory()}
          />
          <button className="btn-primary" onClick={createCategory}>Ajouter</button>
        </div>
        {error && <span className="cm-error">{error}</span>}
      </div>

      <div className="cm-list">
        {categories.map(cat => (
          <div key={cat.id} className="cm-card">
            <div className="cm-card-header">
              <h3>{cat.name}</h3>
              <button className="btn-danger-sm" onClick={() => deleteCategory(cat.id)}>
                Supprimer
              </button>
            </div>

            <div className="cm-keywords">
              {cat.keywords.map(kw => (
                <span key={kw} className="cm-chip">
                  {kw}
                  <button onClick={() => removeKeyword(cat.id, kw)}>✕</button>
                </span>
              ))}
              {cat.keywords.length === 0 && (
                <span className="cm-empty">Aucun mot-clé</span>
              )}
            </div>

            <div className="cm-row">
              <input
                type="text"
                placeholder="Nouveau mot-clé"
                value={keywordInputs[cat.id] || ''}
                onChange={e => setKeywordInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addKeyword(cat.id)}
              />
              <button className="btn-secondary" onClick={() => addKeyword(cat.id)}>
                Ajouter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
