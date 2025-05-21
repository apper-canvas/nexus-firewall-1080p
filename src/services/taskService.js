/**
 * Task Service
 * Handles all task-related data operations
 */

// Helper function to get ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Task table name - using "task4" as per the provided schema
const TABLE_NAME = 'task4';

/**
 * Fetch all tasks
 */
export const fetchTasks = async () => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: ["id", "Name", "title", "status", "priority", "due_date", "contact", "deal", "CreatedOn"],
      orderBy: [
        {
          fieldName: "due_date",
          sortType: "ASC"
        }
      ],
      expands: [
        {
          name: "contact",
          fields: ["Name", "email", "company"]
        },
        {
          name: "deal",
          fields: ["Name", "amount", "stage"]
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response || !response.data) {
      return [];
    }
    
    // Format data for display
    const formattedData = response.data.map(task => {
      const contactName = task.contact?.Name || "Not assigned";
      const dealName = task.deal?.Name || "Not associated";
      
      return {
        ...task,
        contactName,
        dealName
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  try {
    const apperClient = getApperClient();
    
    // Format date field
    let formattedDate = taskData.due_date;
    if (taskData.due_date instanceof Date) {
      // Convert to ISO format YYYY-MM-DD
      formattedDate = taskData.due_date.toISOString().split('T')[0];
    }
    
    // Prepare data - only include updateable fields
    const params = {
      records: [{
        Name: taskData.Name || taskData.title, // Use either field
        title: taskData.title,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        due_date: formattedDate
      }]
    };
    
    // Add optional fields if provided
    if (taskData.contact) {
      params.records[0].contact = taskData.contact;
    }
    
    if (taskData.deal) {
      params.records[0].deal = taskData.deal;
    }
    
    if (taskData.Tags) {
      params.records[0].Tags = taskData.Tags;
    }
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response || !response.success || !response.results || response.results.length === 0) {
      throw new Error("Failed to create task");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (id, taskData) => {
  try {
    const apperClient = getApperClient();
    
    // Format date field
    let formattedDate = taskData.due_date;
    if (taskData.due_date instanceof Date) {
      // Convert to ISO format YYYY-MM-DD
      formattedDate = taskData.due_date.toISOString().split('T')[0];
    }
    
    // Prepare data - only include updateable fields
    const params = {
      records: [{
        id,
        Name: taskData.Name || taskData.title, // Use either field
        title: taskData.title,
        status: taskData.status,
        priority: taskData.priority,
        due_date: formattedDate
      }]
    };
    
    // Add optional fields if provided
    if (taskData.contact) {
      params.records[0].contact = taskData.contact;
    }
    
    if (taskData.deal) {
      params.records[0].deal = taskData.deal;
    }
    
    if (taskData.Tags) {
      params.records[0].Tags = taskData.Tags;
    }
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update task");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error("Failed to delete task");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};