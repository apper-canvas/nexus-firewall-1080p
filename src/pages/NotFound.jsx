import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  // Icons
  const HomeIcon = getIcon('home');
  const AlertCircleIcon = getIcon('alert-circle');
  
  // Auto redirect after countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [countdown, navigate]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <motion.div 
        className="max-w-md w-full glass-card py-12 px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6"
          variants={itemVariants}
        >
          <AlertCircleIcon className="h-12 w-12 text-red-500 dark:text-red-400" />
        </motion.div>
        
        <motion.h1 
          className="text-4xl sm:text-5xl font-bold mb-4 text-surface-900 dark:text-white"
          variants={itemVariants}
        >
          404
        </motion.h1>
        
        <motion.h2 
          className="text-xl sm:text-2xl font-semibold mb-6 text-surface-800 dark:text-surface-100"
          variants={itemVariants}
        >
          Page Not Found
        </motion.h2>
        
        <motion.p 
          className="text-surface-600 dark:text-surface-300 mb-8"
          variants={itemVariants}
        >
          The page you are looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <p className="mt-6 text-sm text-surface-500 dark:text-surface-400">
            Redirecting in {countdown} seconds...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;