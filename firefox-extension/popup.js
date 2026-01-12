// Popup script for ScrollRead Gist Saver

// Load saved settings on popup open
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await browser.storage.local.get(['githubPat', 'githubGistId']);

  if (settings.githubGistId) {
    document.getElementById('gist-id').value = settings.githubGistId;
  }

  if (settings.githubPat) {
    document.getElementById('github-pat').value = settings.githubPat;
  }
});

// Save settings
document.getElementById('save-settings').addEventListener('click', async () => {
  const gistId = document.getElementById('gist-id').value.trim();
  const githubPat = document.getElementById('github-pat').value.trim();

  if (!gistId || !githubPat) {
    showStatus('Compila tutti i campi', 'error');
    return;
  }

  // Validate Gist ID format (alphanumeric)
  if (!/^[a-f0-9]+$/i.test(gistId)) {
    showStatus('Gist ID non valido', 'error');
    return;
  }

  // Save to storage
  await browser.storage.local.set({
    githubGistId: gistId,
    githubPat: githubPat
  });

  showStatus('✓ Configurazione salvata', 'success');
});

// Save current page
document.getElementById('save-page').addEventListener('click', () => {
  browser.runtime.sendMessage({ action: 'saveCurrentPage' });
  showStatus('Salvataggio in corso...', 'success');

  // Close popup after a short delay
  setTimeout(() => {
    window.close();
  }, 1000);
});

// Show status message
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';

  // Hide after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}
