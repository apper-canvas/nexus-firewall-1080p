import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { fetchContactTypeStats } from '../services/contactService';

const MainFeature = ({ onAddContact }) => {
  // State for contact stats
  const [contactStats, setContactStats] = useState({ leads: 0, prospects: 0, customers: 0, partners: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  // State management for form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    type: 'lead',
    title: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Icon components
  const UserPlusIcon = getIcon('user-plus'); 
  const XIcon = getIcon('x'); 
  const CheckIcon = getIcon('check'); 
  const AlertTriangleIcon = getIcon('alert-triangle');
  const UserIcon = getIcon('user');
  const UserCheckIcon = getIcon('user-check');
  const UsersIcon = getIcon('users');
  const HandshakeIcon = getIcon('handshake');

  // Load contact stats
  useEffect(() => {
    const loadContactStats = async () => {
      setIsLoadingStats(true);
      try {
        const stats = await fetchContactTypeStats();
        setContactStats(stats);
      } catch (error) {
        console.error("Error loading contact stats:", error);
        toast.error("Failed to load contact statistics");
      } finally {
        setIsLoadingStats(false);
      }
    };
    loadContactStats();
  }, []);

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: undefined });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = "Email address is invalid";
    }
    
    if (!formData.company.trim()) {
      errors.company = "Company is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Call parent component function to add contact
        await onAddContact(formData);
        
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          type: 'lead',
          title: ''
        });
        
        // Close form
        setIsFormOpen(false);
      } catch (error) {
        toast.error("Failed to add contact. Please try again.");
        console.error("Error adding contact:", error);
      }
      setIsSubmitting(false);
      
    } else {
      toast.error("Please fix the errors in the form.");
    }
  };
  
  return (
    <div className="glass-card p-6 overflow-hidden relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Contact Management</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`btn flex items-center ${isFormOpen ? 'btn-outline' : 'btn-primary'}`}
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          {isFormOpen ? (
            <>
              <XIcon className="h-4 w-4 mr-2" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              <span>Add Contact</span>
            </>
          )}
        </motion.button>
      </div>
      
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-soft p-4 sm:p-6">
              <h4 className="text-lg font-medium mb-4 text-surface-900 dark:text-white">Add New Contact</h4>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="input-group">
                    <label htmlFor="name" className="input-label">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`input-field ${formErrors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertTriangleIcon className="h-3 w-3 mr-1" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="email" className="input-label">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`input-field ${formErrors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertTriangleIcon className="h-3 w-3 mr-1" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="company" className="input-label">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className={`input-field ${formErrors.company ? 'border-red-500 dark:border-red-500' : ''}`}
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Acme Inc."
                    />
                    {formErrors.company && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertTriangleIcon className="h-3 w-3 mr-1" />
                        {formErrors.company}
                      </p>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="phone" className="input-label">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input-field"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (123) 456-7890"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="title" className="input-label">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="input-field"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="CEO"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="type" className="input-label">Contact Type</label>
                    <select
                      id="type"
                      name="type"
                      className="input-field"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="lead">Lead</option>
                      <option value="prospect">Prospect</option>
                      <option value="customer">Customer</option>
                      <option value="partner">Partner</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Contact
                  </motion.button>
                </div>
              </form>
            </div>
            
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Contact management tips</h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Add detailed information to better categorize contacts</li>
                      <li>Assign leads to team members for follow-up</li>
                      <li>Regular updates keep your contact database valuable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isFormOpen && (
        <div className="mt-2">
          <p className="text-surface-600 dark:text-surface-300">
            Add and manage your business contacts. Keep track of leads, prospects, customers, and partners in one centralized system.
          </p>
          
          {isLoadingStats ? <div className="text-center py-4">Loading contact statistics...</div> : <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium">Leads</h4>
                  <p className="text-2xl font-semibold">{contactStats.leads}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                  <UserCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium">Prospects</h4>
                  <p className="text-2xl font-semibold">{contactStats.prospects}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium">Customers</h4>
                  <p className="text-2xl font-semibold">{contactStats.customers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                  <HandshakeIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium">Partners</h4>
                  <p className="text-2xl font-semibold">{contactStats.partners}</p>
                </div>
              </div>
            </div>
          </div>}
        </div>
      )}
    </div>
  );
};

export default MainFeature;