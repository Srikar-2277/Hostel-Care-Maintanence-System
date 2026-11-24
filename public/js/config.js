// HostelCare Global Configuration & Metadata
const CONFIG = {
  API_BASE_URL: '/api',
  APP_NAME: 'HostelCare',
  DEFAULT_HOSTEL: 'Mandakini & Cauvery Complex',

  CATEGORIES: [
    { id: 'Plumbing', label: 'Plumbing', icon: 'droplet', desc: 'Leaks, taps, flush, washbasin, drains' },
    { id: 'Electrical', label: 'Electrical', icon: 'zap', desc: 'Lights, fan, sockets, short circuit, MCB' },
    { id: 'Furniture', label: 'Furniture', icon: 'archive', desc: 'Bed, study table, chair, almirah, shelves' },
    { id: 'Cleaning and Sanitation', label: 'Cleaning & Sanitation', icon: 'sparkles', desc: 'Corridor, washroom cleaning, waste bin' },
    { id: 'Doors and Windows', label: 'Doors & Windows', icon: 'maximize-2', desc: 'Door lock, latches, mesh, hinges, glass' },
    { id: 'Internet and Wi-Fi', label: 'Internet & Wi-Fi', icon: 'wifi', desc: 'Access point, LAN port, signal drop' },
    { id: 'Other', label: 'Other Issues', icon: 'help-circle', desc: 'Civil, pest control, miscellaneous issues' }
  ],

  PRIORITIES: [
    { id: 'Low', label: 'Low', color: '#64748b', desc: 'Minor cosmetic or non-urgent repair (3-5 days)' },
    { id: 'Medium', label: 'Medium', color: '#2563eb', desc: 'Standard maintenance task (24-48 hours)' },
    { id: 'High', label: 'High', color: '#ea580c', desc: 'Affects daily routine significantly (12-24 hours)' },
    { id: 'Emergency', label: 'Emergency', color: '#dc2626', desc: 'Immediate safety or water/power hazard (1-4 hours)' }
  ],

  LIFECYCLE_STAGES: [
    { key: 'Submitted', label: 'Submitted', order: 1 },
    { key: 'Under Review', label: 'Under Review', order: 2 },
    { key: 'Approved', label: 'Approved', order: 3 },
    { key: 'Assigned', label: 'Assigned', order: 4 },
    { key: 'Accepted', label: 'Accepted', order: 5 },
    { key: 'In Progress', label: 'In Progress', order: 6 },
    { key: 'Work Completed', label: 'Work Completed', order: 7 },
    { key: 'Awaiting Confirmation', label: 'Awaiting Confirmation', order: 8 },
    { key: 'Resolved', label: 'Resolved', order: 9 }
  ],

  HOSTEL_BLOCKS: ['Block A', 'Block B', 'Block C', 'Block D', 'Girl\'s Wing 1', 'Girl\'s Wing 2'],
  FLOORS: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']
};
