import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import axios from 'axios';

export default function FileUpload({ onImportSuccess }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const importFile = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:8080/api/transactions/import', formData);
      const count = response.data?.count;
      const importedCount = Number.isFinite(count) ? count : 0;

      setSuccess(`${importedCount} transaction${importedCount > 1 ? 's' : ''} importee${importedCount > 1 ? 's' : ''}.`);
      onImportSuccess();
    } catch (err) {
      const serverMessage = err.response?.data?.error || err.response?.data?.message || err.response?.data;
      const defaultMessage = err.response?.status === 409
        ? 'Ce fichier a deja ete importe.'
        : "Erreur lors de l'importation. Verifiez le format du fichier.";

      setError(serverMessage || defaultMessage);
    } finally {
      setUploading(false);
      setIsDragging(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleFileChange = event => {
    importFile(event.target.files[0]);
  };

  const handleDrop = event => {
    event.preventDefault();
    importFile(event.dataTransfer.files[0]);
  };

  return (
    <article className="panel import-panel">
      <div className="import-heading">
        <div>
          <h2>Importer un fichier</h2>
          <p>Ajoutez un fichier Excel bancaire au format .xlsx.</p>
        </div>
        <div className="import-heading-icon">
          <FileSpreadsheet size={22} />
        </div>
      </div>

      <label
        onDragOver={event => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`dropzone ${isDragging ? 'is-dragging' : ''} ${uploading ? 'is-uploading' : ''}`}
      >
        <div className="dropzone-icon">
          <Upload size={22} />
        </div>
        <strong>{uploading ? 'Importation en cours...' : 'Choisir ou deposer un fichier'}</strong>
        <span>Format accepte : .xlsx</span>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
    </article>
  );
}
