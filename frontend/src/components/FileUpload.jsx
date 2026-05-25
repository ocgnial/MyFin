import { useState } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function FileUpload({ onImportSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);

    try {
      await axios.post('http://localhost:8080/api/transactions/import', formData);
      onImportSuccess();
      event.target.value = ''; // Reset input
    } catch (err) {
      // On récupère le message d'erreur explicite du backend
      const serverMessage = err.response?.data?.message || err.response?.data;
      const defaultMessage = err.response?.status === 409 
        ? "Ce fichier a déjà été importé." 
        : "Erreur lors de l'importation. Vérifiez le format du fichier.";
      
      setError(serverMessage || defaultMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Importer des données</h3>
          <p className="text-sm text-slate-500">Sélectionnez votre fichier .xlsx pour un import automatique</p>
        </div>
        <label className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium cursor-pointer transition-all ${
          uploading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
        }`}>
          {uploading ? <FileCheck className="animate-bounce" /> : <Upload size={20} />}
          {uploading ? 'Importation...' : 'Choisir un fichier'}
          <input type="file" className="hidden" accept=".xlsx" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
      
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}