export const DEFAULT_LANGUAGES = [
  { name: 'English', code: 'en' },
  { name: 'Hindi', code: 'hi' },
];

export const DEFAULT_ROLES = [
  { name: 'admin' },
  { name: 'instructor' },
  { name: 'student' },
];

export const DEFAULT_ADMIN_USER = {
  email: 'admin@gmail.com',
  password: 'Admin@123',
  roleName: 'admin',
};

export const DEFAULT_MODULES = [
  { route: '/roles', nameEn: 'Roles', nameHi: 'भूमिकाएं', icon: 'shield', sortOrder: 1 },
  { route: '/users', nameEn: 'Users', nameHi: 'उपयोगकर्ता', icon: 'users', sortOrder: 2 },
  { route: '/courses', nameEn: 'Courses', nameHi: 'पाठ्यक्रम', icon: 'book-open', sortOrder: 3 },
  { route: '/course-categories', nameEn: 'Course Categories', nameHi: 'पाठ्यक्रम श्रेणियां', icon: 'grid', sortOrder: 4 },
  { route: '/modules', nameEn: 'Modules', nameHi: 'मॉड्यूल', icon: 'layers', sortOrder: 5 },
  { route: '/permissions', nameEn: 'Permissions', nameHi: 'अनुमतियां', icon: 'key', sortOrder: 6 },
  { route: '/role-permissions', nameEn: 'Role Permissions', nameHi: 'भूमिका अनुमतियां', icon: 'lock', sortOrder: 7 },
];

export const DEFAULT_PERMISSIONS = [
  { code: 'view', en: 'View', hi: 'देखें' },
  { code: 'create', en: 'Create', hi: 'बनाएं' },
  { code: 'update', en: 'Update', hi: 'अपडेट' },
  { code: 'delete', en: 'Delete', hi: 'हटाएं' },
  { code: 'status', en: 'Status', hi: 'स्टेटस' },
  { code: 'publish', en: 'Publish', hi: 'प्रकाशित' },
  { code: 'unpublish', en: 'Unpublish', hi: 'अप्रकाशित' },
  { code: 'approve', en: 'Approve', hi: 'स्वीकृत' },
  { code: 'reject', en: 'Reject', hi: 'अस्वीकृत' },
  { code: 'assign', en: 'Assign', hi: 'असाइन' },
  { code: 'review', en: 'Review', hi: 'रिव्यू' },
  { code: 'preview', en: 'Preview', hi: 'प्रीव्यू' },
  { code: 'download', en: 'Download', hi: 'डाउनलोड' },
  { code: 'upload', en: 'Upload', hi: 'अपलोड' },
  { code: 'manage', en: 'Manage', hi: 'मैनेज' },
];

export const DEFAULT_ROUTE_PERMISSION_MAPS = [
  // Roles module
  { method: 'POST', route: '/roles', permission_code: 'create' },
  { method: 'GET', route: '/roles', permission_code: 'view' },
  { method: 'GET', route: '/roles/:id', permission_code: 'view' },
  { method: 'PUT', route: '/roles/:id', permission_code: 'update' },
  { method: 'DELETE', route: '/roles/:id', permission_code: 'delete' },

  // Users module
  { method: 'POST', route: '/users', permission_code: 'create' },
  { method: 'GET', route: '/users', permission_code: 'view' },
  { method: 'GET', route: '/users/:id', permission_code: 'view' },
  { method: 'PUT', route: '/users/:id', permission_code: 'update' },
  { method: 'DELETE', route: '/users/:id', permission_code: 'delete' },

  // Course Categories module
  { method: 'POST', route: '/course-categories', permission_code: 'create' },
  { method: 'GET', route: '/course-categories', permission_code: 'view' },
  { method: 'GET', route: '/course-categories/:id', permission_code: 'view' },
  { method: 'PUT', route: '/course-categories/:id', permission_code: 'update' },
  { method: 'DELETE', route: '/course-categories/:id', permission_code: 'delete' },

  // Modules module
  { method: 'POST', route: '/modules', permission_code: 'create' },
  { method: 'GET', route: '/modules', permission_code: 'view' },
  { method: 'GET', route: '/modules/:id', permission_code: 'view' },
  { method: 'PUT', route: '/modules/:id', permission_code: 'update' },
  { method: 'DELETE', route: '/modules/:id', permission_code: 'delete' },

  // Permissions module
  { method: 'POST', route: '/permissions', permission_code: 'create' },
  { method: 'GET', route: '/permissions', permission_code: 'view' },
  { method: 'GET', route: '/permissions/:id', permission_code: 'view' },
  { method: 'PUT', route: '/permissions/:id', permission_code: 'update' },
  { method: 'DELETE', route: '/permissions/:id', permission_code: 'delete' },

  // Role Permissions module
  { method: 'POST', route: '/role-permissions', permission_code: 'create' },
  { method: 'GET', route: '/role-permissions', permission_code: 'view' },
  { method: 'GET', route: '/role-permissions/:id', permission_code: 'view' },
  { method: 'PUT', route: '/role-permissions/:id', permission_code: 'update' },
  { method: 'DELETE', route: '/role-permissions/:id', permission_code: 'delete' },

  // Courses module
  { method: 'POST', route: '/courses', permission_code: 'create' },
  { method: 'GET', route: '/courses', permission_code: 'view' },
  { method: 'GET', route: '/courses/:id', permission_code: 'view' },
  { method: 'PUT', route: '/courses/:id', permission_code: 'update' },
  { method: 'DELETE', route: '/courses/:id', permission_code: 'delete' },

  // Favorite Courses module
  { method: 'POST', route: '/favorite-courses/:courseId', permission_code: 'create' },
  { method: 'DELETE', route: '/favorite-courses/:courseId', permission_code: 'delete' },
  { method: 'GET', route: '/favorite-courses', permission_code: 'view' },

  // Course Ratings module
  { method: 'POST', route: '/course-ratings', permission_code: 'create' },
  { method: 'GET', route: '/course-ratings/course/:courseId', permission_code: 'view' },
  { method: 'DELETE', route: '/course-ratings/:id', permission_code: 'delete' },
];

export const DEFAULT_ROLE_PERMISSIONS = [
  {
    roleName: 'instructor',
    defaultPermissionCodes: ['view'],
    overrides: {
      // Customize specific module permissions here.
      // E.g.: '/courses': ['view', 'create']
    } as Record<string, string[]>,
  },
  {
    roleName: 'student',
    defaultPermissionCodes: ['view'],
    overrides: {
      // E.g.: '/roles': []
    } as Record<string, string[]>,
  },
];
