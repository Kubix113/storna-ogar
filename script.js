document.addEventListener('DOMContentLoaded', function() {
    // Elementy DOM
    const accountForm = document.getElementById('accountForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const robuxInput = document.getElementById('robux');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const accountsList = document.getElementById('accountsList');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    let isEditing = false;
    let currentEditId = null;
    let currentSort = 'default';

    // Renderowanie listy kont
    function renderAccounts(filteredAccounts = null) {
        let accountsToRender = filteredAccounts || [...accounts];
        
        // Sortowanie kont
        accountsToRender = sortAccounts(accountsToRender, currentSort);
        
        accountsList.innerHTML = '';
        
        if (accountsToRender.length === 0) {
            accountsList.innerHTML = '<p class="no-accounts">Brak kont do wyświetlenia</p>';
            return;
        }
        
        accountsToRender.forEach(account => {
            const accountCard = document.createElement('div');
            accountCard.className = 'account-card';
            accountCard.dataset.id = account.id;
            
            accountCard.innerHTML = `
                <div class="account-info">
                    <h3>${account.name}</h3>
                    <p>${account.email}</p>
                    <span class="robux-badge"><i class="fas fa-coins"></i> ${account.robux} Robux</span>
                </div>
                <div class="account-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i> Edytuj</button>
                    <button class="delete-btn"><i class="fas fa-trash"></i> Usuń</button>
                </div>
            `;
            
            accountsList.appendChild(accountCard);
        });
        
        // Dodanie event listenerów do przycisków edycji i usuwania
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }
    
    // Funkcja sortująca konta
    function sortAccounts(accountsToSort, sortType) {
        switch(sortType) {
            case 'robux-desc':
                return [...accountsToSort].sort((a, b) => b.robux - a.robux);
            case 'robux-asc':
                return [...accountsToSort].sort((a, b) => a.robux - b.robux);
            case 'name-asc':
                return [...accountsToSort].sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return [...accountsToSort].sort((a, b) => b.name.localeCompare(a.name));
            case 'default':
            default:
                return [...accountsToSort].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        }
    }
    
    // Dodawanie nowego konta
    function addAccount(e) {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const robux = robuxInput.value.trim();
        
        if (!name || !email || !robux) {
            alert('Proszę wypełnić wszystkie pola');
            return;
        }
        
        if (isEditing) {
            // Aktualizacja istniejącego konta
            const accountIndex = accounts.findIndex(acc => acc.id === currentEditId);
            if (accountIndex !== -1) {
                accounts[accountIndex] = {
                    ...accounts[accountIndex],
                    name,
                    email,
                    robux
                };
            }
            
            // Reset trybu edycji
            isEditing = false;
            currentEditId = null;
            submitBtn.textContent = 'Dodaj konto';
            cancelEditBtn.style.display = 'none';
        } else {
            // Dodanie nowego konta
            const newAccount = {
                id: Date.now().toString(),
                name,
                email,
                robux: parseInt(robux),
                dateAdded: new Date().toISOString()
            };
            
            accounts.push(newAccount);
        }
        
        // Zapis do localStorage
        localStorage.setItem('accounts', JSON.stringify(accounts));
        
        // Reset formularza i renderowanie listy
        accountForm.reset();
        renderAccounts();
    }
    
    // Edycja konta
    function handleEdit(e) {
        const accountCard = e.target.closest('.account-card');
        const accountId = accountCard.dataset.id;
        
        const account = accounts.find(acc => acc.id === accountId);
        if (!account) return;
        
        // Wypełnienie formularza danymi konta
        nameInput.value = account.name;
        emailInput.value = account.email;
        robuxInput.value = account.robux;
        
        // Przełączenie na tryb edycji
        isEditing = true;
        currentEditId = accountId;
        submitBtn.textContent = 'Zapisz zmiany';
        cancelEditBtn.style.display = 'inline-block';
        
        // Przewinięcie do formularza
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Usuwanie konta
    function handleDelete(e) {
        if (!confirm('Czy na pewno chcesz usunąć to konto?')) return;
        
        const accountCard = e.target.closest('.account-card');
        const accountId = accountCard.dataset.id;
        
        // Filtrowanie kont - usunięcie wybranego
        accounts = accounts.filter(acc => acc.id !== accountId);
        
        // Zapis do localStorage
        localStorage.setItem('accounts', JSON.stringify(accounts));
        
        // Renderowanie listy
        renderAccounts();
        
        // Jeśli usuwaliśmy konto w trybie edycji, resetujemy formularz
        if (isEditing && currentEditId === accountId) {
            accountForm.reset();
            isEditing = false;
            currentEditId = null;
            submitBtn.textContent = 'Dodaj konto';
            cancelEditBtn.style.display = 'none';
        }
    }
    
    // Anulowanie edycji
    function cancelEdit() {
        accountForm.reset();
        isEditing = false;
        currentEditId = null;
        submitBtn.textContent = 'Dodaj konto';
        cancelEditBtn.style.display = 'none';
    }
    
    // Wyszukiwanie kont
    function searchAccounts() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (!searchTerm) {
            renderAccounts();
            return;
        }
        
        const filteredAccounts = accounts.filter(account => 
            account.name.toLowerCase().includes(searchTerm) || 
            account.email.toLowerCase().includes(searchTerm) ||
            account.robux.toString().includes(searchTerm)
        );
        
        renderAccounts(filteredAccounts);
    }
    
    // Zmiana sortowania
    function handleSortChange() {
        currentSort = sortSelect.value;
        renderAccounts();
    }
    
    // Event listeners
    accountForm.addEventListener('submit', addAccount);
    cancelEditBtn.addEventListener('click', cancelEdit);
    searchInput.addEventListener('input', searchAccounts);
    sortSelect.addEventListener('change', handleSortChange);
    
    // Inicjalne renderowanie kont
    renderAccounts();
});