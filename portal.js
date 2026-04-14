let currentStep = 1;
let currentRole = 'employee';
const totalSteps = 8;

const steps = {
    1: {
        title: "Resignation Submission",
        status: "Draft",
        content: `
            <div class="card">
                <h3 class="card-title">Initial Submission</h3>
                <div class="form-group">
                    <label>Reason for Resignation</label>
                    <select class="form-control">
                        <option>Better Opportunity</option>
                        <option>Career Change</option>
                        <option>Personal Reasons</option>
                        <option>Health Issues</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Anticipated Last Working Day</label>
                    <input type="date" class="form-control" value="2026-05-14">
                </div>
                <div class="form-group">
                    <label>Comments / Detailed Reason</label>
                    <textarea class="form-control" rows="4" placeholder="Briefly explain your departure..."></textarea>
                </div>
                <div class="form-group">
                    <label>Upload Notice Letter (Optional)</label>
                    <input type="file" class="form-control">
                </div>
            </div>
        `
    },
    2: {
        title: "Manager Review",
        status: "Pending Manager Approval",
        content: `
            <div class="card">
                <h3 class="card-title">Manager's Action Required</h3>
                <p style="margin-bottom: 1.5rem; color: var(--text-muted);">Reviewing employee's resignation request and determining notice period waiver if applicable.</p>
                <div class="form-group">
                    <label>Manager's Feedback</label>
                    <textarea class="form-control" rows="3" placeholder="Add manager comments here..."></textarea>
                </div>
                <div class="form-group">
                    <label>Notice Period Waiver Requested?</label>
                    <select class="form-control">
                        <option>No - Standard Notice (30 Days)</option>
                        <option>Yes - Partial Waiver</option>
                        <option>Yes - Full Waiver</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary" onclick="alert('Approved!')">Approve Resignation</button>
                    <button class="btn btn-secondary" style="color: var(--danger);">Reject / Discuss</button>
                </div>
            </div>
        `
    },
    3: {
        title: "HR Validation",
        status: "HR Processing",
        content: `
            <div class="card">
                <h3 class="card-title">HR Compliance Check</h3>
                <p style="margin-bottom: 1.5rem; color: var(--text-muted);">Verifying company policies, contractual obligations, and setting up the exit checklist.</p>
                <div class="checklist">
                    <li><input type="checkbox" checked> Verify notice period compliance</li>
                    <li><input type="checkbox" checked> Check for pending disciplinary actions</li>
                    <li><input type="checkbox"> Initiate clearance workflow</li>
                    <li><input type="checkbox"> Schedule Exit Interview</li>
                </div>
                <button class="btn btn-primary" style="margin-top: 1.5rem;">Validate & Continue</button>
            </div>
        `
    },
    4: {
        title: "Notice Period Tracking",
        status: "In Notice Period",
        content: `
            <div class="card" style="text-align: center;">
                <h3 class="card-title">Countdown to LWD</h3>
                <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 1rem 0;">24 Days Left</div>
                <p style="margin-bottom: 2rem; color: var(--text-muted);">Your last working day is set for <strong>May 14th, 2026</strong>.</p>
                <div style="background: var(--bg-main); height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 1rem;">
                    <div style="width: 25%; background: var(--primary); height: 100%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600;">
                    <span>Start: April 14</span>
                    <span>LWD: May 14</span>
                </div>
            </div>
        `
    },
    5: {
        title: "Departmental Clearance",
        status: "Clearance Ongoing",
        content: `
            <div class="clearance-grid">
                <div class="clearance-item">
                    <h4><i data-lucide="monitor"></i> IT Clearance</h4>
                    <ul class="checklist">
                        <li><input type="checkbox" checked> Hardware Return</li>
                        <li><input type="checkbox" checked> Access Revocation</li>
                        <li><input type="checkbox"> Email Backup Support</li>
                    </ul>
                </div>
                <div class="clearance-item">
                    <h4><i data-lucide="building"></i> Admin</h4>
                    <ul class="checklist">
                        <li><input type="checkbox" checked> ID Card Return</li>
                        <li><input type="checkbox"> Drawer Keys</li>
                        <li><input type="checkbox"> Parking Pass</li>
                    </ul>
                </div>
                <div class="clearance-item">
                    <h4><i data-lucide="landmark"></i> Finance</h4>
                    <ul class="checklist">
                        <li><input type="checkbox"> Petty Cash Closure</li>
                        <li><input type="checkbox"> Loan Verification</li>
                        <li><input type="checkbox"> Reimbursements</li>
                    </ul>
                </div>
            </div>
        `
    },
    6: {
        title: "Exit Interview",
        status: "Feedback Required",
        content: `
            <div class="card">
                <h3 class="card-title">Exit Feedback Survey</h3>
                <div class="form-group">
                    <label>How would you rate your growth at Antigraviity?</label>
                    <select class="form-control">
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Average</option>
                        <option>Poor</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>What could we have done differently to retain you?</label>
                    <textarea class="form-control" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Would you recommend us to a friend?</label>
                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                        <label><input type="radio" name="rec"> Yes</label>
                        <label><input type="radio" name="rec"> No</label>
                    </div>
                </div>
            </div>
        `
    },
    7: {
        title: "Final Settlement",
        status: "Processing Payout",
        content: `
            <div class="card">
                <h3 class="card-title">Full & Final Statement</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                    <tr style="border-bottom: 1px solid var(--border); height: 40px;">
                        <td style="font-weight: 600;">Basic Pay (Pro-rata)</td>
                        <td style="text-align: right;">$2,400.00</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border); height: 40px;">
                        <td style="font-weight: 600;">Leave Encashment</td>
                        <td style="text-align: right;">$450.00</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border); height: 40px;">
                        <td style="font-weight: 600;">Notice Pay / Dues</td>
                        <td style="text-align: right; color: var(--danger);">-$120.00</td>
                    </tr>
                    <tr style="height: 60px; font-size: 1.1rem; color: var(--primary);">
                        <td style="font-weight: 800;">Net Payable</td>
                        <td style="text-align: right; font-weight: 800;">$2,730.00</td>
                    </tr>
                </table>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem;">Payment will be credited to your salary account within 4-7 working days of LWD.</p>
            </div>
        `
    },
    8: {
        title: "Relieved",
        status: "Relieved",
        content: `
            <div class="success-msg">
                <div class="success-icon"><i data-lucide="check" style="width: 40px; height: 40px;"></i></div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Offboarding Complete</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Thank you for your contributions to Antigraviity. We wish you the best in your future endeavors!</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-primary"><i data-lucide="download"></i> Relieving Letter</button>
                    <button class="btn btn-secondary"><i data-lucide="download"></i> Service Certificate</button>
                </div>
            </div>
        `
    }
};

function renderStep(stepId) {
    const stepData = steps[stepId];
    document.getElementById('step-content').innerHTML = stepData.content;
    document.getElementById('current-status').textContent = stepData.status;
    
    // Update progress sidebar
    document.querySelectorAll('.step').forEach(s => {
        const id = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (id === stepId) s.classList.add('active');
        if (id < stepId) s.classList.add('completed');
    });

    // Update buttons
    document.getElementById('prev-btn').style.display = stepId === 1 ? 'none' : 'block';
    const nextBtn = document.getElementById('next-btn');
    if (stepId === totalSteps) {
        nextBtn.textContent = "Finish";
        nextBtn.style.opacity = '0.5';
    } else {
        nextBtn.textContent = "Next Step";
        nextBtn.style.opacity = '1';
    }

    lucide.createIcons();
}

function setRole(role) {
    currentRole = role;
    document.querySelectorAll('.switcher-btns button').forEach(b => {
        b.classList.toggle('active', b.textContent.toLowerCase() === role.substring(0, 3).toLowerCase() || (role === 'employee' && b.textContent === 'Emp'));
    });
    alert(`Switched to ${role.toUpperCase()} View`);
}

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentStep < totalSteps) {
        currentStep++;
        renderStep(currentStep);
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        renderStep(currentStep);
    }
});

// Initialize
renderStep(currentStep);
lucide.createIcons();
