export const mockUsers = [
    {
        id: '1',
        email: 'admin@kipsreality.com',
        password: 'admin123',
        name: 'System Admin',
        role: 'admin' as const,
        avatar: '/avatars/admin.png'
    },
    {
        id: '2',
        email: 'manager@kipsreality.com',
        password: 'manager123',
        name: 'Property Manager',
        role: 'property-manager' as const,
        avatar: '/avatars/manager.png'
    },
    {
        id: '3',
        email: 'tenant@kipsreality.com',
        password: 'tenant123',
        name: 'John Tenant',
        role: 'tenant' as const,
        avatar: '/avatars/tenant.png'
    },
    {
        id: '4',
        email: 'vendor@kipsreality.com',
        password: 'vendor123',
        name: 'Vendor Services',
        role: 'vendor' as const,
        avatar: '/avatars/vendor.png'
    }
]