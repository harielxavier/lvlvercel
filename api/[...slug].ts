// Database imports - only import if needed to avoid serverless function bloat
let Pool: any, drizzle: any, users: any, tenants: any, employees: any, departments: any, eq: any, desc: any;

// Lazy load database dependencies
async function loadDatabaseDependencies() {
  if (!Pool) {
    const neonModule = await import('@neondatabase/serverless');
    const drizzleModule = await import('drizzle-orm/neon-serverless');
    const schemaModule = await import('../shared/schema');
    const drizzleOrmModule = await import('drizzle-orm');

    Pool = neonModule.Pool;
    drizzle = drizzleModule.drizzle;
    users = schemaModule.users;
    tenants = schemaModule.tenants;
    employees = schemaModule.employees;
    departments = schemaModule.departments;
    eq = drizzleOrmModule.eq;
    desc = drizzleOrmModule.desc;
  }
}

// Feature flag for bypassing authentication during testing
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true' || process.env.NODE_ENV === 'development';

// Database connection for fetching real data
let db: any = null;

async function initializeDatabase() {
  if (!db && process.env.DATABASE_URL) {
    await loadDatabaseDependencies();
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: { users, tenants, employees, departments } });
  }
  return db;
}

// Fallback mock user data for testing (used when database is unavailable)
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@lvlup.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'platform_admin',
    tenantId: 1,
    profileImageUrl: null
  },
  {
    id: 2,
    email: 'manager@lvlup.com',
    firstName: 'Manager',
    lastName: 'Smith',
    role: 'manager',
    tenantId: 1,
    profileImageUrl: null
  },
  {
    id: 3,
    email: 'employee@lvlup.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'employee',
    tenantId: 1,
    profileImageUrl: null
  }
];

// Function to fetch organizational hierarchy from database
async function getOrganizationalHierarchy() {
  try {
    const database = await initializeDatabase();

    if (!database) {
      console.log('Database not available, using mock data');
      return {
        tenants: [{ id: '1', name: 'Mock Company', subscriptionTier: 'forming', isActive: true }],
        users: MOCK_USERS,
        employees: [],
        departments: []
      };
    }

    // Fetch all tenants
    const allTenants = await database.select().from(tenants).orderBy(desc(tenants.createdAt));

    // Fetch all users with their tenant information
    const allUsers = await database
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        tenantId: users.tenantId,
        profileImageUrl: users.profileImageUrl,
        phoneNumber: users.phoneNumber,
        createdAt: users.createdAt,
        tenantName: tenants.name,
        tenantTier: tenants.subscriptionTier
      })
      .from(users)
      .leftJoin(tenants, eq(users.tenantId, tenants.id))
      .orderBy(desc(users.createdAt));

    // Fetch all employees with additional info
    const allEmployees = await database
      .select({
        id: employees.id,
        userId: employees.userId,
        tenantId: employees.tenantId,
        employeeNumber: employees.employeeNumber,
        departmentId: employees.departmentId,
        managerId: employees.managerId,
        status: employees.status,
        hireDate: employees.hireDate
      })
      .from(employees);

    // Fetch all departments
    const allDepartments = await database
      .select()
      .from(departments)
      .orderBy(departments.name);

    return {
      tenants: allTenants,
      users: allUsers,
      employees: allEmployees,
      departments: allDepartments
    };
  } catch (error) {
    console.error('Error fetching organizational hierarchy:', error);
    return {
      tenants: [{ id: '1', name: 'Mock Company', subscriptionTier: 'forming', isActive: true }],
      users: MOCK_USERS,
      employees: [],
      departments: []
    };
  }
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url || '/unknown';
  console.log(`API Request: ${req.method} ${path} (BYPASS_AUTH: ${BYPASS_AUTH})`);

  // Health check
  if (path.includes('/health')) {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      bypassAuth: BYPASS_AUTH
    });
  }

  // Auth status - return authenticated when bypassing
  if (path.includes('/auth/status')) {
    return res.status(200).json({
      isAuthenticated: BYPASS_AUTH,
      hasVercelOAuth: !!(process.env.VERCEL_CLIENT_ID && process.env.VERCEL_CLIENT_SECRET),
      isDevelopment: process.env.NODE_ENV === 'development',
      bypassAuth: BYPASS_AUTH
    });
  }

  // User endpoint - return selected user when bypassing auth
  if (path.includes('/auth/user') || path.includes('/api/user')) {
    if (BYPASS_AUTH) {
      try {
        const hierarchy = await getOrganizationalHierarchy();
        const selectedUserId = req.headers['x-selected-user-id'] || req.query.selectedUserId;

        if (selectedUserId) {
          const selectedUser = hierarchy.users.find(u => u.id === selectedUserId);
          if (selectedUser) {
            return res.status(200).json(selectedUser);
          }
        }

        // Return the first user as default (preferably platform_admin)
        const adminUser = hierarchy.users.find(u => u.role === 'platform_admin') || hierarchy.users[0];
        return res.status(200).json(adminUser || MOCK_USERS[0]);
      } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(200).json(MOCK_USERS[0]);
      }
    }
    return res.status(200).json({ user: null });
  }

  // Users list endpoint for user selection
  if (path.includes('/api/users') && BYPASS_AUTH) {
    try {
      const hierarchy = await getOrganizationalHierarchy();
      return res.status(200).json(hierarchy.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(200).json(MOCK_USERS);
    }
  }

  // Organizational hierarchy endpoint for admin interface
  if (path.includes('/api/hierarchy') && BYPASS_AUTH) {
    try {
      const hierarchy = await getOrganizationalHierarchy();
      return res.status(200).json(hierarchy);
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      return res.status(500).json({ error: 'Failed to fetch organizational hierarchy' });
    }
  }

  // Employees endpoint
  if (path.includes('/api/employees')) {
    return res.status(200).json([]);
  }

  // Logout endpoint
  if (path.includes('/api/logout')) {
    // Clear any auth cookies (even though we're not using them in this simplified version)
    res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    
    // For GET requests (from window.location.href), redirect to login
    if (req.method === 'GET') {
      res.writeHead(302, { Location: '/api/login' });
      return res.end();
    }
    
    // For other requests, return JSON success
    return res.status(200).json({ 
      success: true,
      message: 'Logged out successfully'
    });
  }

  // Login page endpoint - show comprehensive admin interface when bypassing auth
  if (path.includes('/api/login')) {
    if (BYPASS_AUTH) {
      try {
        const hierarchy = await getOrganizationalHierarchy();

        // Group users by tenant
        const usersByTenant = hierarchy.users.reduce((acc: any, user: any) => {
          const tenantId = user.tenantId || 'no-tenant';
          if (!acc[tenantId]) {
            acc[tenantId] = [];
          }
          acc[tenantId].push(user);
          return acc;
        }, {});

        // Create tenant lookup
        const tenantLookup = hierarchy.tenants.reduce((acc: any, tenant: any) => {
          acc[tenant.id] = tenant;
          return acc;
        }, {});

        // Generate HTML for the comprehensive admin interface
        const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>LVL UP Performance - Multi-Tenant Admin Interface (Testing Mode)</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 1200px;
                margin: 2rem auto;
                padding: 0 1rem;
                background: #f9fafb;
                line-height: 1.6;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              .warning {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 1rem;
                margin-bottom: 2rem;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
              }
              .stat-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
              }
              .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #1e40af;
              }
              .stat-label {
                color: #64748b;
                font-size: 0.875rem;
              }
              .tenant-section {
                margin-bottom: 2rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
              }
              .tenant-header {
                background: #f3f4f6;
                padding: 1rem;
                border-bottom: 1px solid #e5e7eb;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .tenant-header:hover {
                background: #e5e7eb;
              }
              .tenant-name {
                font-weight: bold;
                font-size: 1.1rem;
              }
              .tenant-info {
                display: flex;
                gap: 1rem;
                align-items: center;
              }
              .tier-badge {
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: bold;
              }
              .forming { background-color: #fbbf24; color: #92400e; }
              .storming { background-color: #f59e0b; color: #92400e; }
              .norming { background-color: #10b981; color: #065f46; }
              .performing { background-color: #3b82f6; color: #1e40af; }
              .user-grid {
                display: none;
                padding: 1rem;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1rem;
              }
              .user-grid.expanded {
                display: grid;
              }
              .user-card {
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 1rem;
                cursor: pointer;
                transition: all 0.2s;
                background: white;
              }
              .user-card:hover {
                background-color: #f9fafb;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              .user-name {
                font-weight: bold;
                margin-bottom: 0.5rem;
              }
              .user-email {
                color: #6b7280;
                font-size: 0.875rem;
                margin-bottom: 0.5rem;
              }
              .role-badge {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: bold;
              }
              .platform-admin { background-color: #dc2626; color: white; }
              .manager { background-color: #2563eb; color: white; }
              .employee { background-color: #16a34a; color: white; }
              .expand-icon {
                transition: transform 0.2s;
              }
              .expanded .expand-icon {
                transform: rotate(90deg);
              }
              .no-users {
                padding: 2rem;
                text-align: center;
                color: #6b7280;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 LVL UP Performance - Multi-Tenant Admin Interface</h1>
              <div class="warning">
                <strong>⚠️ Testing Mode:</strong> Authentication is bypassed. This interface shows the complete organizational hierarchy from the database. Click any user to switch context.
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${hierarchy.tenants.length}</div>
                  <div class="stat-label">Total Tenants</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${hierarchy.users.length}</div>
                  <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${hierarchy.employees.length}</div>
                  <div class="stat-label">Employee Records</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${hierarchy.departments.length}</div>
                  <div class="stat-label">Departments</div>
                </div>
              </div>

              <h2>Organizational Hierarchy</h2>
              ${Object.keys(usersByTenant).map(tenantId => {
                const tenant = tenantLookup[tenantId] || { name: 'Unknown Tenant', subscriptionTier: 'unknown', isActive: false };
                const users = usersByTenant[tenantId];
                const userCount = users.length;

                return `
                <div class="tenant-section">
                  <div class="tenant-header" onclick="toggleTenant('${tenantId}')">
                    <div>
                      <div class="tenant-name">${tenant.name}</div>
                      <div class="tenant-info">
                        <span class="tier-badge ${tenant.subscriptionTier}">${tenant.subscriptionTier?.toUpperCase() || 'UNKNOWN'}</span>
                        <span style="color: #6b7280; font-size: 0.875rem;">${userCount} user${userCount !== 1 ? 's' : ''}</span>
                        <span style="color: ${tenant.isActive ? '#10b981' : '#ef4444'}; font-size: 0.875rem;">
                          ${tenant.isActive ? '● Active' : '● Inactive'}
                        </span>
                      </div>
                    </div>
                    <span class="expand-icon">▶</span>
                  </div>
                  <div class="user-grid" id="tenant-${tenantId}">
                    ${users.length > 0 ? users.map((user: any) => `
                      <div class="user-card" onclick="selectUser('${user.id}')">
                        <div class="user-name">${user.firstName || 'Unknown'} ${user.lastName || 'User'}</div>
                        <div class="user-email">${user.email || 'No email'}</div>
                        <span class="role-badge ${user.role?.replace('_', '-') || 'employee'}">${user.role?.replace('_', ' ').toUpperCase() || 'EMPLOYEE'}</span>
                        ${user.phoneNumber ? `<div style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">📞 ${user.phoneNumber}</div>` : ''}
                        ${user.createdAt ? `<div style="color: #6b7280; font-size: 0.875rem;">Joined: ${new Date(user.createdAt).toLocaleDateString()}</div>` : ''}
                      </div>
                    `).join('') : '<div class="no-users">No users found in this tenant</div>'}
                  </div>
                </div>
                `;
              }).join('')}
            </div>
            <script>
              function toggleTenant(tenantId) {
                const userGrid = document.getElementById('tenant-' + tenantId);
                const header = userGrid.previousElementSibling;

                if (userGrid.classList.contains('expanded')) {
                  userGrid.classList.remove('expanded');
                  header.classList.remove('expanded');
                } else {
                  userGrid.classList.add('expanded');
                  header.classList.add('expanded');
                }
              }

              function selectUser(userId) {
                // Store selected user in localStorage for the frontend to use
                localStorage.setItem('selectedUserId', userId);
                // Redirect to home page
                window.location.href = '/';
              }

              // Auto-expand first tenant if it has users
              document.addEventListener('DOMContentLoaded', function() {
                const firstTenant = document.querySelector('.tenant-section');
                if (firstTenant) {
                  const firstTenantId = firstTenant.querySelector('.user-grid').id.replace('tenant-', '');
                  toggleTenant(firstTenantId);
                }
              });
            </script>
          </body>
        </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
      } catch (error) {
        console.error('Error generating admin interface:', error);
        // Fallback to simple interface with mock data
        const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>LVL UP Performance - User Selection (Testing Mode)</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; background: #f9fafb; }
              .container { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .error { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; color: #dc2626; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 LVL UP Performance</h1>
              <div class="error">
                <strong>Database Error:</strong> Could not load organizational hierarchy. Using fallback interface.
              </div>
              <p>Please check the database connection and try again.</p>
              <button onclick="window.location.reload()">Retry</button>
            </div>
          </body>
        </html>
        `;
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
      }
    }

    // Normal behavior when auth is not bypassed
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  // Default response
  return res.status(200).json({ 
    message: 'API endpoint',
    path,
    timestamp: new Date().toISOString()
  });
}
