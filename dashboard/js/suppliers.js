const SuppliersAPI = (() => {
  const API_BASE = `${CONFIG.MIDDLEWARE_URL}/suppliers`;

  async function register(data) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function getPending() {
    const res = await fetch(`${API_BASE}/pending`);
    return res.json();
  }

  async function approve(id) {
    const res = await fetch(`${API_BASE}/approve/${id}`, { method: 'POST' });
    return res.json();
  }

  async function getDashboard(id) {
    const res = await fetch(`${API_BASE}/${id}/dashboard`);
    if (!res.ok) throw new Error('Supplier not found');
    return res.json();
  }

  return { register, getPending, approve, getDashboard };
})();

// Registration Page Logic
function initRegisterPage() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const data = {
      name: document.getElementById('restaurant-name').value,
      contact: document.getElementById('restaurant-contact').value,
      location: document.getElementById('restaurant-location').value,
    };

    try {
      const result = await SuppliersAPI.register(data);
      if (result.success) {
        document.getElementById('form-container').innerHTML = `
          <div class="text-center p-10 bg-white rounded-3xl shadow-xl">
            <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 class="text-3xl font-headline text-primary mb-4">¡Solicitud Enviada!</h2>
            <p class="text-on-surface-variant mb-8">Tu restaurante ha sido registrado correctamente. Un administrador revisará tu solicitud pronto.</p>
            <a href="index.html" class="inline-block px-10 py-4 bg-primary text-white rounded-full font-bold">Volver al Inicio</a>
          </div>
        `;
      }
    } catch (err) {
      UI.showToast('Error al registrar: ' + err.message);
      btn.disabled = false;
      btn.textContent = 'Registrar mi Restaurante';
    }
  };
}

// Admin Page Logic
async function initAdminPage() {
  const container = document.getElementById('pending-list');
  if (!container) return;

  try {
    const { pending } = await SuppliersAPI.getPending();
    if (!pending || pending.length === 0) {
      container.innerHTML = '<p class="text-center py-10 text-stone-400">No hay solicitudes pendientes.</p>';
      return;
    }

    container.innerHTML = pending.map(s => `
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center mb-4">
        <div>
          <h4 class="font-bold text-primary text-lg">${s.name}</h4>
          <p class="text-xs text-on-surface-variant">${s.location} • ${s.contact}</p>
          <p class="text-[10px] text-stone-400 mt-1">Recibido: ${new Date(s.createdAt).toLocaleString()}</p>
        </div>
        <button onclick="approveSupplier('${s.id}')" class="px-6 py-2 bg-[#C1EDC7] text-primary font-bold rounded-full text-xs hover:brightness-95 transition-all">
          Aprobar
        </button>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-red-500 text-center">Error al cargar pendientes.</p>';
  }
}

async function approveSupplier(id) {
  try {
    const res = await SuppliersAPI.approve(id);
    if (res.success) {
      UI.showToast(`Restaurante aprobado: ${res.approved.supplier_id}`);
      initAdminPage();
    }
  } catch (err) {
    UI.showToast('Error al aprobar: ' + err.message);
  }
}

// Restaurant Dashboard Logic
async function loadRestaurantDashboard() {
  const idInput = document.getElementById('supplier-id-input');
  if (!idInput) return;

  const id = idInput.value.trim();
  if (!id) return;

  try {
    const data = await SuppliersAPI.getDashboard(id);
    document.getElementById('dashboard-content').classList.remove('hidden');
    document.getElementById('login-section').classList.add('hidden');

    UI.setText('res-name', data.name);
    UI.setText('res-id', data.supplier_id);
    UI.setText('res-balance', `${UI.fmt(data.balance, 2)} $EGGO`);
    UI.setText('res-status', data.status === 'approved' ? '✓ Cuenta Activa' : 'Modo Demo');
    
    // In a real app, we would fetch specific deliveries here. 
    // For now we show the balance and the general status.
  } catch (err) {
    UI.showToast('ID de Restaurante no encontrado');
  }
}
