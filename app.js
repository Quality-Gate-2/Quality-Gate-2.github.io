document.addEventListener('DOMContentLoaded', () => {
    // === ELEMEN DOM ===
    const daySelect = document.getElementById('report-day');
    const dateInput = document.getElementById('report-date');
    const shiftInput = document.getElementById('report-shift');
    const unitIdInput = document.getElementById('unit-id');
    const unitStatusSelect = document.getElementById('unit-status');
    const unitDescInput = document.getElementById('unit-desc');
    const addButton = document.getElementById('add-button');
    const sendButton = document.getElementById('send-button');
    const reportListDiv = document.getElementById('report-list');
    const addForm = document.querySelector('.data-form');

    // === STATE APLIKASI ===
    let reportItems = [];
    let editIndex = null; // Menyimpan index item yang sedang diedit

    // === FUNGSI-FUNGSI ===

    // Atur tanggal hari ini sebagai default
    const setTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    };

    // Render atau tampilkan daftar laporan ke layar
    const renderReportList = () => {
        reportListDiv.innerHTML = ''; // Kosongkan daftar

        if (reportItems.length === 0) {
            reportListDiv.innerHTML = '<p class="empty-state">Belum ada data laporan. Silakan tambahkan di atas.</p>';
            return;
        }

        reportItems.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'report-item';

            const statusText = item.status === 'OK' ? 'OK' : item.description;
            const emoji = item.status === 'OK' ? '✅' : '❌';
            
            itemDiv.innerHTML = `
                <span>${index + 1}. ${item.unitId} ${statusText} ${emoji}</span>
                <div class="item-actions">
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Hapus</button>
                </div>
            `;
            reportListDiv.appendChild(itemDiv);
        });
    };

    const resetForm = () => {
        unitIdInput.value = '';
        unitDescInput.value = '';
        unitStatusSelect.value = 'OK';
        addButton.textContent = 'Tambah ke Laporan';
        addButton.classList.remove('update-mode');
        editIndex = null;

        // Sembunyikan tombol batal edit jika ada
        const cancelButton = document.getElementById('cancel-edit-btn');
        if (cancelButton) {
            cancelButton.remove();
        }
    }
    
    // Fungsi untuk menambah ATAU mengupdate item
        const addOrUpdateItem = () => {
        const unitId = unitIdInput.value.trim();
        const status = unitStatusSelect.value;
        const description = unitDescInput.value.trim();

        if (!unitId) {
            alert('Kolom "Unit" tidak boleh kosong!');
            return;
        }

        if (status === 'Problem' && !description) {
            alert('Kolom "Keterangan" harus diisi jika statusnya "Problem"!');
            return;
        }

        const newItem = { unitId, status, description };

        if (editIndex !== null) {
            // Mode Update
            reportItems[editIndex] = newItem;
        } else {
            // Mode Tambah Baru
            reportItems.push(newItem);
        }
        
        renderReportList();
        resetForm();
        unitIdInput.focus();
    };

    // Fungsi untuk memulai mode edit
        const startEdit = (index) => {
        editIndex = index;
        const item = reportItems[index];

        // Isi form dengan data yang ada
        unitIdInput.value = item.unitId;
        unitStatusSelect.value = item.status;
        unitDescInput.value = item.description;

        // Ubah tombol "Tambah" menjadi "Update"
        addButton.textContent = 'Update Laporan';
        addButton.classList.add('update-mode');

        // Tambahkan tombol Batal Edit jika belum ada
        if (!document.getElementById('cancel-edit-btn')) {
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Batal Edit';
            cancelButton.id = 'cancel-edit-btn';
            cancelButton.type = 'button'; // Mencegah form submit
            addForm.appendChild(cancelButton);

            cancelButton.addEventListener('click', resetForm);
        }
        
        // Scroll ke atas agar form terlihat
        unitIdInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Fungsi untuk menghapus item
    const deleteItem = (index) => {
        reportItems.splice(index, 1);
        // Jika item yang sedang diedit dihapus, reset form
        if (index === editIndex) {
            resetForm();
        }
        renderReportList();
    };
    
    // Fungsi untuk membuat teks laporan dan mengirim ke WhatsApp
    const generateAndSend = () => {
        if (editIndex !== null) {
            alert('Selesaikan dulu proses edit sebelum mengirim laporan!');
            return;
        }

        if (reportItems.length === 0) {
            alert('Laporan kosong! Silakan tambahkan data unit terlebih dahulu.');
            return;
        }

        const day = daySelect.value;
        const dateRaw = new Date(dateInput.value);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = dateRaw.toLocaleDateString('id-ID', options);
        const shift = shiftInput.value.trim();

        let message = `Data unit QRC ${day}, ${formattedDate} shift ${shift}\n\n`;

        reportItems.forEach((item, index) => {
            const statusText = item.status === 'OK' ? 'OK' : item.description;
            const emoji = item.status === 'OK' ? '✅' : '❌';
            message += `${index + 1}. ${item.unitId} ${statusText} ${emoji}\n`;
        });
        
        message += `\nTerimakasih`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    // === EVENT LISTENERS ===
    addButton.addEventListener('click', addOrUpdateItem);
    sendButton.addEventListener('click', generateAndSend);

    reportListDiv.addEventListener('click', (e) => {
        const target = e.target;
        const index = target.getAttribute('data-index');

        if (target.classList.contains('edit-btn')) {
            startEdit(parseInt(index));
        }
        
        if (target.classList.contains('delete-btn')) {
            if (confirm(`Apakah Anda yakin ingin menghapus item ke-${parseInt(index) + 1}?`)) {
                deleteItem(parseInt(index));
            }
        }
    });

    // Inisialisasi
    setTodayDate();
    renderReportList();
});
