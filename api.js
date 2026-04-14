const API_BASE = 'http://localhost:3000/api';

const api = {
    // --- Resignation Endpoints ---
    async getResignations(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/resignations${query ? '?' + query : ''}`);
        return res.json();
    },
    async submitResignation(data) {
        const res = await fetch(`${API_BASE}/resignations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async updateResignation(id, data) {
        const res = await fetch(`${API_BASE}/resignations/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // --- HRMS: Transfers ---
    async getTransfers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/transfers${query ? '?' + query : ''}`);
        return res.json();
    },
    async createTransfer(data) {
        const res = await fetch(`${API_BASE}/transfers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async updateTransfer(id, data) {
        const res = await fetch(`${API_BASE}/transfers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // --- HRMS: Attendance ---
    async getAttendance(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/attendance${query ? '?' + query : ''}`);
        return res.json();
    },
    async clockIn(employeeId) {
        const res = await fetch(`${API_BASE}/attendance/clock-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId })
        });
        return res.json();
    },
    async clockOut(employeeId) {
        const res = await fetch(`${API_BASE}/attendance/clock-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId })
        });
        return res.json();
    },

    // --- HRMS: Leaves ---
    async getLeaves(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/leaves${query ? '?' + query : ''}`);
        return res.json();
    },
    async submitLeave(data) {
        const res = await fetch(`${API_BASE}/leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async updateLeave(id, data) {
        const res = await fetch(`${API_BASE}/leaves/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // --- HRMS: Employees ---
    async getEmployees(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/employees${query ? '?' + query : ''}`);
        return res.json();
    },
    async addEmployee(data) {
        const res = await fetch(`${API_BASE}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to add employee');
        }
        return res.json();
    },
    async updateEmployee(id, data) {
        const res = await fetch(`${API_BASE}/employees/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update employee');
        }
        return res.json();
    },
    async login(email, password) {
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const contentType = res.headers.get("content-type");
            if (!res.ok) {
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const error = await res.json();
                    throw new Error(error.error || 'Authentication failed');
                } else {
                    const text = await res.text();
                    console.error("Non-JSON Server Error:", text);
                    throw new Error(`Server Error (${res.status}): The backend returned HTML instead of JSON. Please ensure the server is restarted.`);
                }
            }
            return res.json();
        } catch (err) {
            console.error("Login attempt failed:", err);
            throw err;
        }
    },

    // --- DASHBOARD: Intelligence ---
    async getStats(employeeId) {
        const res = await fetch(`${API_BASE}/dashboard/stats/${employeeId}`);
        return res.json();
    },
    async getActivity(employeeId) {
        const res = await fetch(`${API_BASE}/dashboard/activity/${employeeId}`);
        return res.json();
    },
    async getDocuments(employeeId) {
        const res = await fetch(`${API_BASE}/documents/${employeeId}`);
        return res.json();
    },

    // --- POLICIES: Compliance ---
    downloadPolicy(type, company) {
        const url = `${API_BASE}/policies/${type}?company=${encodeURIComponent(company)}`;
        window.location.href = url;
    }
};
