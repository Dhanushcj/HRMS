const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const MANAGER_EMAIL = 'dhanushchakravarthy18@gmail.com'; // User provided manager email
const HR_EMAIL = 'dhanushchakravarthy18@gmail.com'; // User provided for HR alerts

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ resignations: [] }, null, 2));
}

// Gmail SMTP Configuration
// IMPORTANT: You must use a "Google App Password", NOT your regular Gmail password.
const GMAIL_USER = 'dhanushdon55@gmail.com'; 
const GMAIL_PASS = 'okdyvqrcgcdolusw'; 

async function sendManagerNotification(resignation) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS
        }
    });

    const mailOptions = {
        from: GMAIL_USER,
        to: MANAGER_EMAIL,
        subject: `ACTION REQUIRED: Resignation Submission - ${resignation.employeeName}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6;">
                <h2 style="color: #2563EB;">New Resignation Submission</h2>
                <p>Hello,</p>
                <p>An employee under your supervision has submitted a formal resignation request. Please review the details below:</p>
                <div style="padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Employee:</strong> ${resignation.employeeName} (${resignation.employeeId})</p>
                    <p><strong>Submission Date:</strong> ${new Date(resignation.createdAt).toLocaleDateString()}</p>
                    <p><strong>Requested Last Working Day:</strong> ${resignation.lwd}</p>
                    <p><strong>Reason:</strong> ${resignation.reason}</p>
                </div>
                <p>Please log in to the <strong><a href="http://localhost:3000/manager_portal.html">Manager Portal</a></strong> to approve or discuss this request.</p>
                <br>
                <p>Regards,<br><strong>Antigraviity HR Team</strong></p>
            </div>
        `
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("-----------------------------------------");
        console.log("📧 EMAIL SENT TO MANAGER");
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

async function sendHRNotification(resignation) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS
        }
    });

    const mailOptions = {
        from: GMAIL_USER,
        to: HR_EMAIL,
        subject: `ACTION REQUIRED: Resignation Approved by Manager - ${resignation.employeeName}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6;">
                <h2 style="color: #6366f1;">Manager Approval Notification</h2>
                <p>Hello HR Team,</p>
                <p>The following resignation has been approved by the department manager and is now awaiting HR validation:</p>
                <div style="padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Employee:</strong> ${resignation.employeeName} (${resignation.employeeId})</p>
                    <p><strong>Requested LWD:</strong> ${resignation.lwd}</p>
                    <p><strong>Manager Comments:</strong> ${resignation.managerComments || 'Approved'}</p>
                </div>
                <p>Please log in to the <strong><a href="http://localhost:3000/hr_portal.html">HR Dashboard</a></strong> to begin the clearance process.</p>
                <br>
                <p>Regards,<br><strong>Antigraviity System</strong></p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ NOTIFICATION SENT TO HR");
    } catch (error) {
        console.error("❌ HR Email Error:", error);
    }
}

/**
 * Generates a professional relieving letter as a PDF
 */
function generateRelievingPDF(resignation, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);

        // Header
        doc.fillColor('#6366f1').fontSize(24).text('ANTIGRAVIITY', { align: 'center', weight: 'bold' });
        doc.fillColor('#64748b').fontSize(10).text('Building the future of workforce management', { align: 'center' });
        doc.moveDown(2);
        
        doc.fillColor('black').fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(2);
        
        // Subject
        doc.fontSize(16).text('RELIEVING LETTER', { align: 'center', underline: true });
        doc.moveDown(2);
        
        // Content
        doc.fontSize(12);
        doc.text(`To,`, { align: 'left' });
        doc.text(`${resignation.employeeName}`, { weight: 'bold' });
        doc.text(`Employee ID: ${resignation.employeeId}`);
        doc.moveDown(2);
        
        doc.text(`Subject: Relieving Letter & Work Experience Certificate`);
        doc.moveDown(1);
        
        doc.text(`Dear ${resignation.employeeName},`, { align: 'left' });
        doc.moveDown(1);
        
        doc.text(`This is to certify that you have been relieved from your duties at Antigraviity effective from your last working day on ${resignation.lwd}.`);
        doc.moveDown(1);
        
        doc.text(`We acknowledge that you have completed all necessary handover procedures and organizational clearances. During your tenure with us, your performance and conduct have been documented as professional and positive.`);
        doc.moveDown(1);
        
        doc.text(`We thank you for your contributions during your time with the firm and wish you every success in your future endeavors.`);
        doc.moveDown(4);
        
        // Signature
        doc.text(`For Antigraviity,`, { align: 'right' });
        doc.moveDown(1);
        doc.text(`________________________`, { align: 'right' });
        doc.text(`Human Resources Department`, { align: 'right' });
        
        doc.end();
        
        stream.on('finish', () => resolve(filePath));
        stream.on('error', (err) => reject(err));
    });
}

/**
 * Sends the relieving letter to the employee's personal email
 */
async function sendRelievingLetter(resignation, pdfPath) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });

    const mailOptions = {
        from: GMAIL_USER,
        to: resignation.personalEmail || HR_EMAIL, // Fallback to provided mail if not set
        subject: `RELIEVING LETTER - ${resignation.employeeName}`,
        text: `Dear ${resignation.employeeName}, please find attached your official relieving letter from Antigraviity. We wish you the best for your future.`,
        attachments: [{
            filename: `Relieving_Letter_${resignation.employeeId}.pdf`,
            path: pdfPath
        }]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ RELIEVING LETTER SENT TO ${resignation.employeeName}`);
    } catch (error) {
        console.error("❌ Error sending Relieving Letter:", error);
    }
}

// Helper to read data
const readData = () => {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- API Endpoints ---

// HRMS: Employees
app.get('/api/employees', (req, res) => {
    const data = readData();
    const { company } = req.query;
    let records = data.employees;
    if (company) {
        records = records.filter(e => e.company === company);
    }
    res.json(records);
});

app.post('/api/employees', (req, res) => {
    const data = readData();
    const { email } = req.body;
    
    // Auto-generate numeric EMP ID
    const empIds = data.employees
        .map(e => e.id)
        .filter(id => id && id.startsWith('EMP'))
        .map(id => parseInt(id.replace('EMP', '')))
        .filter(num => !isNaN(num));
    
    const nextNum = Math.max(...empIds, 0) + 1;
    const autoId = `EMP${nextNum.toString().padStart(3, '0')}`;

    if (data.employees.find(e => e.email === email)) return res.status(400).json({ error: 'Email already exists' });

    const newEmployee = { ...req.body, id: autoId };
    data.employees.push(newEmployee);
    writeData(data);
    res.status(201).json(newEmployee);
});

app.patch('/api/employees/:id', (req, res) => {
    const data = readData();
    const index = data.employees.findIndex(e => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Employee not found' });

    data.employees[index] = { ...data.employees[index], ...req.body };
    writeData(data);
    res.json(data.employees[index]);
});

app.post('/api/login', (req, res) => {
    const data = readData();
    const { email, password } = req.body;
    
    // Check by loginId or email (case insensitive)
    const user = data.employees.find(e => 
        (e.email.toLowerCase() === email.toLowerCase()) || 
        (e.loginId && e.loginId.toLowerCase() === email.toLowerCase())
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check individual password
    if (user.password !== password) return res.status(401).json({ error: 'Invalid password' });

    res.json(user);
});

// HRMS: Attendance
app.get('/api/attendance', (req, res) => {
    const data = readData();
    const { employeeId, managerId, company } = req.query;
    let records = data.attendance;

    if (employeeId) {
        records = records.filter(a => a.employeeId === employeeId);
    } else if (managerId) {
        // Filter by employees belonging to this manager
        const teamIds = data.employees.filter(e => e.managerId === managerId).map(e => e.id);
        records = records.filter(a => teamIds.includes(a.employeeId));
    } else if (company) {
        // Filter by company
        const companyEmpIds = data.employees.filter(e => e.company === company).map(e => e.id);
        records = records.filter(a => companyEmpIds.includes(a.employeeId));
    }

    // Attach employee names for UI
    records = records.map(r => ({
        ...r,
        employeeName: data.employees.find(e => e.id === r.employeeId)?.name || 'Unknown'
    }));

    res.json(records);
});

app.post('/api/attendance/clock-in', (req, res) => {
    const data = readData();
    const { employeeId } = req.body;
    
    // Check if already clocked in today
    const today = new Date().toISOString().split('T')[0];
    const existing = data.attendance.find(a => a.employeeId === employeeId && a.date === today);
    
    if (existing) return res.status(400).json({ error: 'Already clocked in for today' });

    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    
    // Late Login if after 10:00 AM
    let status = 'Present';
    if (hours > 10 || (hours === 10 && mins > 0)) {
        status = 'Late Login';
    }

    const record = {
        id: Date.now().toString(),
        employeeId,
        date: today,
        clockIn: now.toISOString(),
        clockOut: null,
        status: status
    };
    
    data.attendance.push(record);
    writeData(data);
    res.json(record);
});

app.post('/api/attendance/clock-out', (req, res) => {
    const data = readData();
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const index = data.attendance.findIndex(a => a.employeeId === employeeId && a.date === today);
    
    if (index === -1) return res.status(400).json({ error: 'No clock-in record found for today' });
    if (data.attendance[index].clockOut) return res.status(400).json({ error: 'Already clocked out' });

    const outTime = new Date();
    data.attendance[index].clockOut = outTime.toISOString();
    
    // Calculate worked hours
    const inTime = new Date(data.attendance[index].clockIn);
    const durationHrs = (outTime - inTime) / (1000 * 60 * 60);
    
    // Rule: Mark Halfday if worked duration is less than 8 hours (standard full shift)
    if (durationHrs < 8) {
        data.attendance[index].status = 'Half Day';
    }

    writeData(data);
    res.json(data.attendance[index]);
});

// HRMS: Leaves
app.get('/api/leaves', (req, res) => {
    const data = readData();
    const { employeeId, company, managerId } = req.query;
    let records = data.leaves;
    
    if (employeeId) {
        records = records.filter(l => l.employeeId === employeeId);
    } else if (managerId) {
        const teamIds = data.employees.filter(e => e.managerId === managerId).map(e => e.id);
        records = records.filter(l => teamIds.includes(l.employeeId));
    } else if (company) {
        const companyEmpIds = data.employees.filter(e => e.company === company).map(e => e.id);
        records = records.filter(l => companyEmpIds.includes(l.employeeId));
    }
    res.json(records);
});

app.post('/api/leaves', (req, res) => {
    const data = readData();
    const newLeave = {
        id: Date.now().toString(),
        ...req.body,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    data.leaves.push(newLeave);
    writeData(data);
    res.json(newLeave);
});

app.patch('/api/leaves/:id', (req, res) => {
    const data = readData();
    const index = data.leaves.findIndex(l => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Leave not found' });
    
    data.leaves[index] = { ...data.leaves[index], ...req.body };
    writeData(data);
    res.json(data.leaves[index]);
});

// Resignations...

// Get all resignations
app.get('/api/resignations', (req, res) => {
    const data = readData();
    const { company, managerId } = req.query;
    let list = data.resignations;
    
    if (managerId) {
        const teamIds = data.employees.filter(e => e.managerId === managerId).map(e => e.id);
        list = list.filter(r => teamIds.includes(r.employeeId));
    } else if (company) {
        const companyEmpIds = data.employees.filter(e => e.company === company).map(e => e.id);
        list = list.filter(r => companyEmpIds.includes(r.employeeId));
    }
    
    res.json(list);
});

// Submit a resignation
app.post('/api/resignations', async (req, res) => {
    const data = readData();
    const newResignation = {
        id: Date.now().toString(),
        employeeName: req.body.employeeName || 'Anonymous',
        employeeId: req.body.employeeId || 'EMP000',
        personalEmail: req.body.personalEmail || '',
        reason: req.body.reason,
        lwd: req.body.lwd,
        status: 'Submitted',
        step: 1,
        clearance: { it: false, admin: false, finance: false },
        managerComments: '',
        hrComments: '',
        createdAt: new Date().toISOString()
    };
    
    data.resignations.push(newResignation);
    writeData(data);
    
    // Trigger Automated Email (Non-blocking)
    sendManagerNotification(newResignation).catch(err => {
        console.error("Delayed Email Error:", err);
    });
    
    res.status(201).json(newResignation);
});

// Update a resignation (Manager Approval, HR Validation, etc.)
app.patch('/api/resignations/:id', async (req, res) => {
    const data = readData();
    const index = data.resignations.findIndex(r => r.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Resignation not found' });
    }
    
    // Update fields
    const updatedResignation = { ...data.resignations[index], ...req.body };
    data.resignations[index] = updatedResignation;
    writeData(data);

    // Trigger HR Email notification if Manager just approved
    if (req.body.status === 'Manager Approved') {
        console.log(`🔔 Triggering HR Notification for ${updatedResignation.employeeName}`);
        sendHRNotification(updatedResignation).catch(console.error);
    }

    // Trigger Relieving Letter if HR just clicked Relieved
    if (req.body.status === 'Relieved') {
        const tempPath = path.join(__dirname, `Relieving_Letter_${updatedResignation.employeeId}.pdf`);
        generateRelievingPDF(updatedResignation, tempPath)
            .then(() => sendRelievingLetter(updatedResignation, tempPath))
            .catch(err => console.error("PDF Workflow Error:", err));
    }
    
    res.json(updatedResignation);
});

// --- HRMS: Transfers ---
app.get('/api/transfers', (req, res) => {
    const data = readData();
    const { employeeId, fromCompany, toCompany } = req.query;
    let list = data.transfers || [];

    if (employeeId) list = list.filter(t => t.employeeId === employeeId);
    if (fromCompany) list = list.filter(t => t.fromCompany === fromCompany);
    if (toCompany) list = list.filter(t => t.toCompany === toCompany);

    res.json(list);
});

app.post('/api/transfers', (req, res) => {
    const data = readData();
    const newTransfer = {
        id: Date.now().toString(),
        ...req.body,
        status: 'Pending',
        timestamp: new Date().toISOString()
    };
    if (!data.transfers) data.transfers = [];
    data.transfers.push(newTransfer);
    writeData(data);
    res.status(201).json(newTransfer);
});

app.patch('/api/transfers/:id', (req, res) => {
    const data = readData();
    const index = data.transfers.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Transfer not found' });

    const transfer = { ...data.transfers[index], ...req.body };
    data.transfers[index] = transfer;

    // Cascading updates if accepted
    if (req.body.status === 'Accepted') {
        const empIndex = data.employees.findIndex(e => e.id === transfer.employeeId);
        if (empIndex !== -1) {
            data.employees[empIndex].company = transfer.toCompany;
            data.employees[empIndex].managerId = transfer.newManagerId;
            
            // Ensure allowedPortals includes new company
            if (!data.employees[empIndex].allowedPortals.includes(transfer.toCompany)) {
                data.employees[empIndex].allowedPortals.push(transfer.toCompany);
            }
        }
    }

    writeData(data);
    res.json(transfer);
});

// Delete a resignation (Cleanup/Testing)
app.delete('/api/resignations/:id', (req, res) => {
    const data = readData();
    data.resignations = data.resignations.filter(r => r.id !== req.params.id);
    writeData(data);
    res.status(204).send();
});

// --- DASHBOARD: Stats & Intelligence ---
app.get('/api/dashboard/stats/:id', (req, res) => {
    const data = readData();
    const empId = req.params.id;
    
    // Attendance stats (Current Month)
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyAttendance = data.attendance.filter(a => a.employeeId === empId && a.date.startsWith(monthStr));
    const presenceRate = monthlyAttendance.length > 0 ? (monthlyAttendance.filter(a => a.status === 'Present').length / 20) * 100 : 0; // Assuming 20 working days

    // Leave Balance
    const approvedLeaves = data.leaves.filter(l => l.employeeId === empId && l.status === 'Approved');
    const usedDays = approvedLeaves.reduce((sum, l) => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }, 0);
    const leaveBalance = 15 - usedDays;

    // Pending Tasks
    const pendingTransfers = (data.transfers || []).filter(t => t.employeeId === empId && t.status === 'Pending').length;
    const pendingResignations = data.resignations.filter(r => r.employeeId === empId && !['Relieved', 'Rejected'].includes(r.status)).length;

    res.json({
        leaveBalance: Math.max(0, leaveBalance),
        attendanceRate: Math.min(100, Math.round(presenceRate)),
        pendingTasks: pendingTransfers + pendingResignations
    });
});

app.get('/api/dashboard/activity/:id', (req, res) => {
    const data = readData();
    const empId = req.params.id;
    
    const activities = [];
    
    // Attendance Activity
    data.attendance.filter(a => a.employeeId === empId).forEach(a => {
        activities.push({ type: 'attendance', title: `Punch ${a.clockOut ? 'Out' : 'In'}`, subtitle: a.date, date: a.clockIn, icon: 'clock' });
    });
    
    // Leave Activity
    data.leaves.filter(l => l.employeeId === empId).forEach(l => {
        activities.push({ type: 'leave', title: `Leave Request: ${l.type}`, subtitle: l.status, date: l.createdAt, icon: 'calendar' });
    });

    // Transfer Activity
    (data.transfers || []).filter(t => t.employeeId === empId).forEach(t => {
        activities.push({ type: 'transfer', title: `Transfer Order`, subtitle: `To ${t.toCompany}`, date: t.timestamp, icon: 'arrow-right-left' });
    });

    // Sort by date desc and take top 5
    const latest = activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    res.json(latest);
});

// --- RESOURCES: Documents & Help ---
app.get('/api/documents/:id', (req, res) => {
    const data = readData();
    const emp = data.employees.find(e => e.id === req.params.id);
    
    const docs = [
        { name: 'Offer Letter', type: 'PDF', date: '12 Jan 2024', status: 'Verified' },
        { name: 'Appointment Letter', type: 'PDF', date: '14 Jan 2024', status: 'Verified' },
        { name: 'IT Policy 2024', type: 'PDF', date: '01 Jan 2024', status: 'Public' }
    ];
    
    // Add Relieving Letter if Relieved
    const resignation = data.resignations.find(r => r.employeeId === req.params.id && r.status === 'Relieved');
    if (resignation) {
        docs.push({ name: 'Relieving Letter', type: 'PDF', date: resignation.lwd, status: 'Released' });
    }

    res.json(docs);
});

// --- SECONDARY MODULES (FORGE) ---
app.get('/api/duty-permissions', (req, res) => {
    const data = readData();
    res.json(data.dutyPermissions || []);
});
app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
    console.log(`Resignation Portal Backend running at http://localhost:${PORT}`);
});
