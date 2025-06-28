// Configuration
const APP_CONFIG = {
    // Set to true to always require login (clear token on page load)
    // Set to false to remember user session (normal behavior)
    // For development/testing: set to true; for production: set to false
    ALWAYS_REQUIRE_LOGIN: true
};

// Global variables
let currentUser = null;
let transactions = [];
let totalTransactions = 0;
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { field: 'date', direction: 'desc' };
let currentFilters = {};

// Chart instances
let monthlyTrendsChart = null;
let revenueExpenseChart = null;
let statusChart = null;
let userActivityChart = null;
let categoryAnalysisChart = null;
let trendAnalysisChart = null;

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkAuthStatus();
});

function initializeEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    document.getElementById('exportBtn').addEventListener('click', showExportModal);
    document.getElementById('closeExportModal').addEventListener('click', hideExportModal);
    document.getElementById('cancelExport').addEventListener('click', hideExportModal);
    document.getElementById('confirmExport').addEventListener('click', exportCSV);
    document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('userFilter').addEventListener('change', applyFilters);
    document.getElementById('prevPage').addEventListener('click', () => changePage(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(currentPage + 1));
    document.querySelectorAll('.transactions-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => handleSort(th.dataset.sort));
    });
}

function handleNavigation(e) {
    e.preventDefault();
    const targetPage = e.currentTarget.dataset.page;
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${targetPage}-page`).classList.add('active');
    const pageTitles = {
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        transactions: 'Transactions',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = pageTitles[targetPage];
    switch(targetPage) {
        case 'dashboard': loadDashboardData(); break;
        case 'analytics': loadAnalyticsData(); break;
        case 'transactions': loadTransactionsData(); break;
        case 'settings': break;
    }
}

function checkAuthStatus() {
    if (APP_CONFIG.ALWAYS_REQUIRE_LOGIN) {
        localStorage.removeItem('authToken');
        showLogin();
        return;
    }
    const token = localStorage.getItem('authToken');
    if (token) {
        fetch('/api/verify-token', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Invalid token');
        })
        .then(data => {
            currentUser = data.user;
            showDashboard();
            loadDashboardData();
        })
        .catch(() => {
            localStorage.removeItem('authToken');
            showLogin();
        });
    } else {
        showLogin();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    showLoading(true);
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            currentUser = data.user;
            showDashboard();
            loadDashboardData();
            showAlert('Login successful!', 'success');
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    })
    .catch(() => {
        showLoading(false);
        showAlert('Login failed. Please try again.', 'error');
    });
}

function handleLogout() {
    const token = localStorage.getItem('authToken');
    fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
        localStorage.removeItem('authToken');
        currentUser = null;
        showLogin();
        showAlert('Logged out successfully', 'info');
    })
    .catch(() => {
        localStorage.removeItem('authToken');
        currentUser = null;
        showLogin();
    });
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('userInfo').textContent = `Welcome, ${currentUser.username}`;
}

function loadDashboardData() {
    showLoading(true);
    Promise.all([
        fetch('/api/dashboard-stats', { headers: getAuthHeaders() }).then(r => r.json()),
        fetch('/api/transactions?limit=300', { headers: getAuthHeaders() }).then(r => r.json())
    ])
    .then(([stats, transactionsData]) => {
        showLoading(false);
        transactions = transactionsData.transactions || [];
        totalTransactions = transactionsData.total_count || transactions.length;
        updateDashboardStats(stats);
        createDashboardCharts(transactions);
    })
    .catch(() => {
        showLoading(false);
        showAlert('Failed to load dashboard data', 'error');
    });
}

function loadAnalyticsData() {
    showLoading(true);
    fetch('/api/transactions?limit=300', { headers: getAuthHeaders() })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        transactions = data.transactions || [];
        totalTransactions = data.total_count || transactions.length;
        createAnalyticsCharts(transactions);
        updateAnalyticsMetrics(transactions);
        updateTopPerformers(transactions);
    })
    .catch(() => {
        showLoading(false);
        showAlert('Failed to load analytics data', 'error');
    });
}

function loadTransactionsData() {
    showLoading(true);
    fetch('/api/transactions?limit=300', { headers: getAuthHeaders() })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        transactions = data.transactions || [];
        totalTransactions = data.total_count || transactions.length;
        populateFilters(transactions);
        renderTransactionsTable(transactions);
        updatePagination();
    })
    .catch(() => {
        showLoading(false);
        showAlert('Failed to load transactions', 'error');
    });
}

function updateDashboardStats(stats) {
    document.getElementById('totalTransactions').textContent = stats.total_transactions || 0;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.total_revenue || 0);
    document.getElementById('totalExpenses').textContent = formatCurrency(stats.total_expenses || 0);
    document.getElementById('netProfit').textContent = formatCurrency(stats.net_profit || 0);
}

function createDashboardCharts(transactions) {
    const monthlyData = processMonthlyData(transactions);
    const revenueExpenseData = processRevenueExpenseData(transactions);
    const statusData = processStatusData(transactions);
    const userActivityData = processUserActivityData(transactions);
    
    createMonthlyTrendsChart(monthlyData);
    createRevenueExpenseChart(revenueExpenseData);
    createStatusChart(statusData);
    createUserActivityChart(userActivityData);
}

function createAnalyticsCharts(transactions) {
    const categoryData = processCategoryData(transactions);
    const trendData = processTrendData(transactions);
    
    createCategoryAnalysisChart(categoryData);
    createTrendAnalysisChart(trendData);
}

function processMonthlyData(transactions) {
    const monthly = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthly[monthYear]) {
            monthly[monthYear] = { revenue: 0, expenses: 0 };
        }
        
        if (transaction.category === 'Revenue') {
            monthly[monthYear].revenue += transaction.amount;
        } else if (transaction.category === 'Expense') {
            monthly[monthYear].expenses += transaction.amount;
        }
    });
    
    const sortedMonths = Object.keys(monthly).sort();
    const result = {
        labels: sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }),
        revenue: sortedMonths.map(month => monthly[month].revenue),
        expenses: sortedMonths.map(month => monthly[month].expenses)
    };
    
    return result;
}

function processRevenueExpenseData(transactions) {
    const revenue = transactions.filter(t => t.category === 'Revenue').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    
    const result = {
        labels: ['Revenue', 'Expenses'],
        data: [revenue, expenses],
        colors: ['#28a745', '#dc3545']
    };
    
    return result;
}

function processStatusData(transactions) {
    const statusCounts = {};
    
    transactions.forEach(transaction => {
        statusCounts[transaction.status] = (statusCounts[transaction.status] || 0) + 1;
    });
    
    const colors = {
        'Paid': '#28a745',
        'Pending': '#ffc107',
        'Failed': '#dc3545',
        'completed': '#28a745',
        'pending': '#ffc107',
        'failed': '#dc3545'
    };
    
    const result = {
        labels: Object.keys(statusCounts),
        data: Object.values(statusCounts),
        colors: Object.keys(statusCounts).map(status => colors[status] || '#6c757d')
    };
    
    return result;
}

function processUserActivityData(transactions) {
    const userActivity = {};
    
    transactions.forEach(transaction => {
        const userId = transaction.user_id;
        if (!userActivity[userId]) {
            userActivity[userId] = { count: 0, total: 0 };
        }
        userActivity[userId].count++;
        userActivity[userId].total += Math.abs(transaction.amount);
    });
    
    const sortedUsers = Object.entries(userActivity)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);
    
    const result = {
        labels: sortedUsers.map(([userId]) => `User ${userId}`),
        data: sortedUsers.map(([, data]) => data.count)
    };
    
    return result;
}

function processCategoryData(transactions) {
    const categoryData = {};
    
    transactions.forEach(transaction => {
        const category = transaction.category;
        if (!categoryData[category]) {
            categoryData[category] = { count: 0, total: 0 };
        }
        categoryData[category].count++;
        categoryData[category].total += Math.abs(transaction.amount);
    });
    
    const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1].total - a[1].total);
    
    return {
        labels: sortedCategories.map(([category]) => category),
        data: sortedCategories.map(([, data]) => data.total),
        counts: sortedCategories.map(([, data]) => data.count)
    };
}

function processTrendData(transactions) {
    const dailyData = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date).toISOString().split('T')[0];
        if (!dailyData[date]) {
            dailyData[date] = { count: 0, total: 0 };
        }
        dailyData[date].count++;
        dailyData[date].total += Math.abs(transaction.amount);
    });
    
    const sortedDates = Object.keys(dailyData).sort();
    const last30Days = sortedDates.slice(-30);
    
    return {
        labels: last30Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        counts: last30Days.map(date => dailyData[date].count),
        totals: last30Days.map(date => dailyData[date].total)
    };
}

function createMonthlyTrendsChart(data) {
    const ctx = document.getElementById('monthlyTrendsChart');
    if (!ctx) {
        return;
    }
    
    if (monthlyTrendsChart) {
        monthlyTrendsChart.destroy();
    }
    
    monthlyTrendsChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: data.revenue,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: data.expenses,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => '$' + value.toLocaleString() }
                }
            }
        }
    });
}

function createRevenueExpenseChart(data) {
    const ctx = document.getElementById('revenueExpenseChart');
    console.log('Revenue expense chart canvas element:', ctx);
    if (!ctx) {
        return;
    }
    
    if (revenueExpenseChart) {
        console.log('Destroying existing revenue expense chart');
        revenueExpenseChart.destroy();
    }
    
    revenueExpenseChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: data.colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function createStatusChart(data) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) {
        return;
    }
    
    if (statusChart) {
        statusChart.destroy();
    }
    
    statusChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: data.colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function createUserActivityChart(data) {
    const ctx = document.getElementById('userActivityChart');
    if (!ctx) {
        return;
    }
    
    if (userActivityChart) {
        userActivityChart.destroy();
    }
    
    userActivityChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Transaction Count',
                data: data.data,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function createCategoryAnalysisChart(data) {
    const ctx = document.getElementById('categoryAnalysisChart').getContext('2d');
    
    if (categoryAnalysisChart) {
        categoryAnalysisChart.destroy();
    }
    
    categoryAnalysisChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Total Amount',
                data: data.data,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => '$' + value.toLocaleString() }
                }
            }
        }
    });
}

function createTrendAnalysisChart(data) {
    const ctx = document.getElementById('trendAnalysisChart').getContext('2d');
    
    if (trendAnalysisChart) {
        trendAnalysisChart.destroy();
    }
    
    trendAnalysisChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Transaction Count',
                    data: data.counts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    yAxisID: 'y'
                },
                {
                    label: 'Total Amount',
                    data: data.totals,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top' } },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    ticks: { callback: value => '$' + value.toLocaleString() },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function updateAnalyticsMetrics(transactions) {
    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const avgTransaction = totalAmount / transactions.length;
    const successRate = (transactions.filter(t => t.status === 'Paid' || t.status === 'completed').length / transactions.length) * 100;
    
    document.getElementById('growthRate').textContent = '12.5%';
    document.getElementById('avgTransaction').textContent = formatCurrency(avgTransaction || 0);
    document.getElementById('successRate').textContent = successRate.toFixed(1) + '%';
}

function updateTopPerformers(transactions) {
    const userPerformance = {};
    
    transactions.forEach(transaction => {
        const userId = transaction.user_id;
        if (!userPerformance[userId]) {
            userPerformance[userId] = { count: 0, total: 0 };
        }
        userPerformance[userId].count++;
        userPerformance[userId].total += Math.abs(transaction.amount);
    });
    
    const topPerformers = Object.entries(userPerformance)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5);
    
    const container = document.getElementById('topPerformersList');
    container.innerHTML = '';
    
    topPerformers.forEach(([userId, data], index) => {
        const item = document.createElement('div');
        item.className = 'top-performer-item';
        item.innerHTML = `
            <div class="performer-info">
                <div class="performer-rank">${index + 1}</div>
                <div class="performer-details">
                    <h4>User ${userId}</h4>
                    <p>${data.count} transactions</p>
                </div>
            </div>
            <div class="performer-value">${formatCurrency(data.total)}</div>
        `;
        container.appendChild(item);
    });
}

function populateFilters(transactions) {
    const categories = [...new Set(transactions.map(t => t.category))];
    const statuses = [...new Set(transactions.map(t => t.status))];
    const userIds = [...new Set(transactions.map(t => t.user_id))];
    
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const userFilter = document.getElementById('userFilter');
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    statusFilter.innerHTML = '<option value="">All Statuses</option>';
    userFilter.innerHTML = '<option value="">All Users</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusFilter.appendChild(option);
    });
    
    userIds.forEach(userId => {
        const option = document.createElement('option');
        option.value = userId;
        option.textContent = `User ${userId}`;
        userFilter.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const userFilter = document.getElementById('userFilter').value;
    
    currentFilters = {
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        user: userFilter
    };
    
    currentPage = 1;
    renderTransactionsTable(transactions);
    updatePagination();
}

function renderTransactionsTable(allTransactions) {
    let filteredTransactions = allTransactions.filter(transaction => {
        const matchesSearch = !currentFilters.search || 
            transaction.id.toString().includes(currentFilters.search) ||
            transaction.category.toLowerCase().includes(currentFilters.search) ||
            transaction.status.toLowerCase().includes(currentFilters.search) ||
            transaction.user_id.toString().includes(currentFilters.search);
        
        const matchesCategory = !currentFilters.category || transaction.category === currentFilters.category;
        const matchesStatus = !currentFilters.status || transaction.status === currentFilters.status;
        const matchesUser = !currentFilters.user || transaction.user_id.toString() === currentFilters.user;
        
        return matchesSearch && matchesCategory && matchesStatus && matchesUser;
    });
    
    filteredTransactions.sort((a, b) => {
        let aVal = a[currentSort.field];
        let bVal = b[currentSort.field];
        
        if (currentSort.field === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        if (currentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';
    
    if (paginatedTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" style="text-align: center; padding: 20px; color: #666;">No transactions found</td>';
        tbody.appendChild(row);
    } else {
        paginatedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            const statusClass = transaction.status.toLowerCase().replace(' ', '-');
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td class="${transaction.amount > 0 ? 'text-success' : 'text-danger'}">
                    ${formatCurrency(transaction.amount)}
                </td>
                <td>${transaction.category}</td>
                <td><span class="status-badge status-${statusClass}">${transaction.status}</span></td>
                <td>${transaction.user_id}</td>
                <td><a href="#" class="profile-link">View Profile</a></td>
            `;
            tbody.appendChild(row);
        });
    }
    
    const totalFiltered = filteredTransactions.length;
    const displayStart = totalFiltered > 0 ? startIndex + 1 : 0;
    const displayEnd = Math.min(endIndex, totalFiltered);
    
    document.getElementById('paginationInfo').textContent = 
        `Showing ${displayStart} to ${displayEnd} of ${totalFiltered} transactions`;
}

function handleSort(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    renderTransactionsTable(transactions);
}

function changePage(page) {
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTransactionsTable(transactions);
        updatePagination();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function showExportModal() {
    document.getElementById('exportModal').style.display = 'block';
}

function hideExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

function exportCSV() {
    const selectedColumns = Array.from(document.querySelectorAll('.column-checkbox input:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedColumns.length === 0) {
        showAlert('Please select at least one column to export', 'error');
        return;
    }
    
    const token = localStorage.getItem('authToken');
    const queryParams = new URLSearchParams({
        columns: selectedColumns.join(','),
        ...currentFilters
    });
    
    fetch(`/api/export-csv?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (response.ok) return response.blob();
        throw new Error('Export failed');
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        hideExportModal();
        showAlert('CSV exported successfully!', 'success');
    })
    .catch(() => {
        showAlert('Export failed. Please try again.', 'error');
    });
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    alert.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
