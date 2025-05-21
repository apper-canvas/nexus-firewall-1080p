import { useState } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const ContactForm = ({ onSubmit, onCancel }) => {
  // Initialize form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    type: 'lead'
  });
  
  // State for form validation errors
  const [errors, setErrors] = useState({});
  
  // Get icons
  const AlertTriangleIcon = getIcon('alert-triangle');
  const CheckIcon = getIcon('check');
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user is typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-soft p-4 sm:p-6">
      <h4 className="text-lg font-medium mb-4 text-surface-900 dark:text-white">Add New Contact</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="name" className="input-label">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            className={`input-field ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertTriangleIcon className="h-3 w-3 mr-1" />
              {errors.name}
            </p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="email" className="input-label">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            id="email"
            name="email"
            className={`input-field ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertTriangleIcon className="h-3 w-3 mr-1" />
              {errors.email}
            </p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="phone" className="input-label">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="input-field"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (123) 456-7890"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-3 mt-6">
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <motion.button
          type="submit"
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CheckIcon className="h-4 w-4 mr-2" />
          Save Contact
        </motion.button>
      </div>
    </form>
  );
};

export default ContactForm;