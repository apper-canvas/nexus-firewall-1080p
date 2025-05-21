import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { getIcon } from '../utils/iconUtils';
import { AuthContext } from '../App';
import MainFeature from '../components/MainFeature';
import { fetchContacts, createContact, updateContact, deleteContact } from '../services/contactService';
import { fetchDeals, createDeal, updateDeal, deleteDeal } from '../services/dealService';
import { fetchTasks } from '../services/taskService';

const Home = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState({
    contacts: false,
    deals: false,
    tasks: false
  });
  const [error, setError] = useState({
    contacts: null,
    deals: null,
    tasks: null
  });
  const [stats, setStats] = useState({
    totalContacts: 0,
    activeDeals: 0,
    totalRevenue: 0,
    pendingTasks: 0
  });
  
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // Load contacts
  const loadContacts = async () => {
    setIsLoading(prev => ({ ...prev, contacts: true }));
    try {
      const data = await fetchContacts();
      setContacts(data);
      return data;
    } catch (error) {
      console.error("Error loading contacts:", error);
      setError(prev => ({ ...prev, contacts: "Failed to load contacts" }));
      toast.error("Failed to load contacts");
      return [];
    } finally {
      setIsLoading(prev => ({ ...prev, contacts: false }));
    }
  };

  // Calculate stats
  const calculateStats = (contactsData, dealsData, tasksData) => {
    const totalContacts = contactsData?.length || 0;
    const activeDeals = dealsData?.length || 0;
    const totalRevenue = dealsData?.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0) || 0;
    const pendingTasks = tasksData?.filter(task => task.status === 'pending')?.length || 0;

    setStats({
      totalContacts,
      activeDeals,
      totalRevenue,
      pendingTasks
    });
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'pie-chart' },
    { id: 'contacts', label: 'Contacts', icon: 'users' },
    { id: 'deals', label: 'Deals', icon: 'briefcase' },
    { id: 'tasks', label: 'Tasks', icon: 'check-square' },
    { id: 'reports', label: 'Reports', icon: 'bar-chart-2' },
  ];

  // Load deals
  const loadDeals = async () => {
    setIsLoading(prev => ({ ...prev, deals: true }));
    try {
      const data = await fetchDeals();
      setDeals(data);
      return data;
    } catch (error) {
      console.error("Error loading deals:", error);
      setError(prev => ({ ...prev, deals: "Failed to load deals" }));
      toast.error("Failed to load deals");
      return [];
    } finally {
      setIsLoading(prev => ({ ...prev, deals: false }));
    }
  };

  // Load tasks
  const loadTasks = async () => {
    setIsLoading(prev => ({ ...prev, tasks: true }));
    try {
      const data = await fetchTasks();
      setTasks(data);
      return data;
    } catch (error) {
      console.error("Error loading tasks:", error);
      setError(prev => ({ ...prev, tasks: "Failed to load tasks" }));
      toast.error("Failed to load tasks");
      return [];
    } finally {
      setIsLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Load all data and calculate stats
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [contactsData, dealsData, tasksData] = await Promise.all([
          loadContacts(), 
          loadDeals(),
          loadTasks()
        ]);
        
        calculateStats(contactsData, dealsData, tasksData);
      } catch (error) {
        console.error("Error loading data:", error);
        // Set error messages
        setError(prev => ({ ...prev, contacts: "Failed to load data", deals: "Failed to load data", tasks: "Failed to load data" }));
        toast.error("Failed to load dashboard data");
      }
    };
    
    loadAllData();
  }, []);

  // Update tab-specific data when tab changes
  useEffect(() => {
    const refreshTabData = async () => {
      switch (activeTab) { 
        case 'contacts': 
          if (!isLoading.contacts && (contacts.length === 0 || error.contacts)) {
            await loadContacts();
          }
          break;
        case 'deals':
          if (!isLoading.deals && (deals.length === 0 || error.deals)) {
            await loadDeals();
          }
          break;
        case 'tasks':
          if (!isLoading.tasks && (tasks.length === 0 || error.tasks)) {
            await loadTasks();
          }
          break;
        case 'dashboard':
          // Dashboard shows all data, so refresh everything
          const [contactsData, dealsData, tasksData] = await Promise.all([
            // Each Promise is wrapped with catch to prevent one failure from stopping all
            // This ensures robust loading even if one service fails
            contacts.length === 0 || error.contacts ? 
              loadContacts().catch(err => {
                console.error("Error refreshing contacts:", err);
                setError(prev => ({ ...prev, contacts: "Failed to refresh contacts" }));
                return [];
              }) 
              : Promise.resolve(contacts),
            contacts.length === 0 ? 
              loadContacts().catch(err => {
                console.error("Error refreshing contacts:", err);
                setError(prev => ({ ...prev, contacts: "Failed to refresh contacts" }));
                return [];
              }) 
              : Promise.resolve(contacts),
            deals.length === 0 || error.deals ? 
              loadDeals().catch(err => {
                console.error("Error refreshing deals:", err);
                setError(prev => ({ ...prev, deals: "Failed to refresh deals" }));
                return [];
              }) : Promise.resolve(deals),
            tasks.length === 0 || error.tasks ? 
              loadTasks().catch(err => {
                console.error("Error refreshing tasks:", err);
                setError(prev => ({ ...prev, tasks: "Failed to refresh tasks" }));
                return [];
              }) : Promise.resolve(tasks)
          ]);
          
          calculateStats(contactsData, dealsData, tasksData);
          break;
        default:
          break;
      }
    };
    
    refreshTabData();
  }, [activeTab, isLoading.contacts, isLoading.deals, isLoading.tasks, contacts.length, deals.length, tasks.length, error.contacts, error.deals, error.tasks]);

  const addNewContact = (contact) => {
    return createContact({
      ...contact
    }).then(newContact => {
      setContacts(prevContacts => [...prevContacts, newContact]);
      setStats(prevStats => ({
        ...prevStats,
        totalContacts: prevStats.totalContacts + 1
      }));
      toast.success(`Added new contact: ${newContact.Name}`);
      return newContact;
    });
  };

  // Icon components
  const MenuIcon = getIcon('menu');
  const XIcon = getIcon('x');
  const UserPlusIcon = getIcon('user-plus');
  const UsersIcon = getIcon('users');
  const BriefcaseIcon = getIcon('briefcase');
  const CheckSquareIcon = getIcon('check-square');
  const DollarSignIcon = getIcon('dollar-sign');
  const LogOutIcon = getIcon('log-out');

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-900">
      {/* Mobile navigation overlay */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsNavOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar navigation */}
      <motion.aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-surface-800 shadow-lg z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        initial={false}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-surface-200 dark:border-surface-700">
            <h1 className="text-xl font-bold text-primary dark:text-primary-light flex items-center">
              <BriefcaseIcon className="mr-2 h-6 w-6" />
              NexusCRM
            </h1>
            <button
              className="absolute top-4 right-4 lg:hidden text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
              onClick={() => setIsNavOpen(false)}
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const NavIcon = getIcon(item.icon);
              return (
                <button
                  key={item.id}
                  className={`flex items-center w-full px-4 py-3 text-left transition-colors rounded-lg ${
                    activeTab === item.id
                      ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light'
                      : 'text-surface-700 hover:bg-surface-200 dark:text-surface-300 dark:hover:bg-surface-700'
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsNavOpen(false);
                  }}
                >
                  <NavIcon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Logout button at the bottom of nav */}
            <div className="mt-auto pt-4 border-t border-surface-200 dark:border-surface-700">
              <button
                className="flex items-center w-full px-4 py-3 text-left transition-colors rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-surface-700"
                onClick={logout}
              >
                <LogOutIcon className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
            
            <div className="text-xs text-center mt-4 text-surface-500 dark:text-surface-400">
              v0.1.0
            </div>
          </nav>
        </div>
      </motion.aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white dark:bg-surface-800 shadow-sm z-10">
          <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
            <button
              className="lg:hidden text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
              onClick={() => setIsNavOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            
            <h2 className="text-xl font-semibold text-surface-800 dark:text-white ml-4 lg:ml-0">
              {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h2>
            
            <div className="flex items-center space-x-4">
              <button 
                className="btn-primary text-sm hidden sm:flex"
                onClick={() => setActiveTab('contacts')}
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add Contact
              </button>
            </div>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats cards - loading state */}
                  {(isLoading.contacts || isLoading.deals || isLoading.tasks) && <div className="text-center py-4">Loading dashboard data...</div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="neu-card-light dark:neu-card-dark">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-surface-500 dark:text-surface-400">Total Contacts</p>
                          <h3 className="text-2xl font-semibold mt-1">{stats.totalContacts}</h3>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <UsersIcon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="neu-card-light dark:neu-card-dark">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-surface-500 dark:text-surface-400">Active Deals</p>
                          <h3 className="text-2xl font-semibold mt-1">{stats.activeDeals}</h3>
                        </div>
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <BriefcaseIcon className="h-6 w-6 text-secondary" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="neu-card-light dark:neu-card-dark">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-surface-500 dark:text-surface-400">Total Revenue</p>
                          <h3 className="text-2xl font-semibold mt-1">${stats.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <DollarSignIcon className="h-6 w-6 text-green-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="neu-card-light dark:neu-card-dark">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-surface-500 dark:text-surface-400">Pending Tasks</p>
                          <h3 className="text-2xl font-semibold mt-1">{stats.pendingTasks}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <CheckSquareIcon className="h-6 w-6 text-amber-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main feature component - Add new contact form */}
                  <MainFeature onAddContact={addNewContact} />
                  
                  {/* Recent contacts */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Contacts {isLoading.contacts && <span className="text-sm font-normal text-surface-500">(Loading...)</span>}</h3>
                    <div className="overflow-x-auto">
                      {error.contacts && <div className="text-red-500 mb-4">{error.contacts}</div>}
                      {!isLoading.contacts && contacts.length > 0 && <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Company</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                          {contacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-medium text-surface-900 dark:text-white">{contact.Name}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                                <div className="text-surface-600 dark:text-surface-300">{contact.email}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                                <div className="text-surface-600 dark:text-surface-300">{contact.company}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex text-xs px-2 py-1 rounded-full ${
                                  contact.type === 'customer' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  contact.type === 'lead' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  contact.type === 'prospect' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                }`}>
                                  {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>}
                      {!isLoading.contacts && contacts.length === 0 && !error.contacts && (
                        <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                          No contacts found. Add your first contact to get started.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'contacts' && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-6">Contacts Management</h2>
                  <p className="text-surface-600 dark:text-surface-300 mb-4">
                    View and manage all your contacts in one place.
                  </p>
                  <button 
                    className="btn-primary mb-6"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add New Contact
                  </button>
                  
                  {isLoading.contacts && <div className="text-center py-4">Loading contacts...</div>}
                  <div className="overflow-x-auto">
                    {!isLoading.contacts && contacts.length > 0 && <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Company</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium text-surface-900 dark:text-white">{contact.Name}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                              <div className="text-surface-600 dark:text-surface-300">{contact.email}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <div className="text-surface-600 dark:text-surface-300">{contact.company}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex text-xs px-2 py-1 rounded-full ${
                                contact.type === 'customer' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                contact.type === 'lead' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                contact.type === 'prospect' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                                'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              }`}>
                                {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex text-xs px-2 py-1 rounded-full ${
                                contact.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>}
                    {!isLoading.contacts && contacts.length === 0 && !error.contacts && (
                      <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                        No contacts found. Add your first contact to get started.
                      </div>
                    )}
                    {error.contacts && <div className="text-center py-4 text-red-500">
                      {error.contacts}</div>}
                  </div>
                </div>
              )}
              
              {activeTab === 'deals' && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-6">Deals Pipeline</h2>
                  <p className="text-surface-600 dark:text-surface-300 mb-4">
                    Track all your sales opportunities and monitor their progress.
                  </p>
                  <button 
                    className="btn-primary mb-6"
                    onClick={() => toast.info("Deal creation coming soon!")}
                  >
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
                    Add New Deal
                  </button>
                  
                  {isLoading.deals && <div className="text-center py-4">Loading deals...</div>}
                  <div className="overflow-x-auto">
                    {!isLoading.deals && deals.length > 0 && <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Deal Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden sm:table-cell">Stage</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Probability</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                        {deals.map((deal) => (
                          <tr key={deal.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium text-surface-900 dark:text-white">{deal.Name}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-surface-900 dark:text-white font-medium">${parseFloat(deal.amount).toLocaleString()}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                              <span className={`inline-flex text-xs px-2 py-1 rounded-full ${
                                deal.stage === 'qualification' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                deal.stage === 'proposal' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                deal.stage === 'negotiation' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                                deal.stage === 'closed-won' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {deal.stage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5 mb-1">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    deal.probability >= 70 ? 'bg-green-500' :
                                    deal.probability >= 40 ? 'bg-amber-500' :
                                    'bg-blue-500'
                                  }`}
                                  style={{ width: `${deal.probability || 0}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-surface-600 dark:text-surface-400">{deal.probability}%</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-surface-600 dark:text-surface-300">{deal.contact?.Name || deal.contactName || deal.contact || 'Unknown'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>}
                    {!isLoading.deals && deals.length === 0 && !error.deals && (
                      <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                        No deals found. Create your first deal to get started.
                      </div>
                    )}
                    {error.deals && (
                      <div className="text-center py-4 text-red-500">
                        {error.deals}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {(activeTab === 'tasks' || activeTab === 'reports') && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="w-full max-w-md p-8 glass-card">
                    <div className="flex justify-center mb-4">
                      {activeTab === 'tasks' ? (
                        <CheckSquareIcon className="h-16 w-16 text-secondary" /> 
                      ) : (
                        getIcon('bar-chart-2')({ className: "h-16 w-16 text-primary" })
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {activeTab === 'tasks' ? 'Task Management' : 'Reports & Analytics'}
                    </h2>
                    <p className="text-surface-600 dark:text-surface-300 mb-6">
                      {activeTab === 'tasks' 
                        ? 'Manage your tasks, set priorities and track your progress.' 
                        : 'Generate custom reports and analyze your business performance.'}
                    </p>
                    <button 
                      className="btn-primary"
                      onClick={() => toast.info("Feature coming soon!")}
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Home;