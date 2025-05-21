/**
 * Contact Service
 * Handles all contact-related data operations
 */

// Helper function to get ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Contact table name
const TABLE_NAME = 'contact';

/**
 * Fetch all contacts
 */
export const fetchContacts = async () => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: ["id", "Name", "Tags", "email", "company", "phone", "title", "type", "status", "CreatedOn"],
      orderBy: [
        {
          field: "CreatedOn",
          direction: "desc"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

/**
 * Create a new contact
 */
export const createContact = async (contactData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare data - only include updateable fields
    const params = {
      records: [{
        Name: contactData.name,
        email: contactData.email,
        company: contactData.company,
        phone: contactData.phone,
        title: contactData.title,
        type: contactData.type,
        status: 'active'
      }]
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response || !response.success || !response.results || response.results.length === 0) {
      throw new Error("Failed to create contact");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

/**
 * Update an existing contact
 */
export const updateContact = async (id, contactData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare data - only include updateable fields
    const params = {
      records: [{
        id,
        Name: contactData.name,
        email: contactData.email,
        company: contactData.company,
        phone: contactData.phone,
        title: contactData.title,
        type: contactData.type,
        status: contactData.status
      }]
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update contact");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

/**
 * Delete a contact
 */
export const deleteContact = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error("Failed to delete contact");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

/**
 * Get contact type statistics
 */
export const fetchContactTypeStats = async () => {
  try {
    const contacts = await fetchContacts();
    
    // Count contacts by type
    const stats = {
      leads: 0,
      prospects: 0,
      customers: 0,
      partners: 0
    };
    
    contacts.forEach(contact => {
      if (contact.type === 'lead') stats.leads++;
      else if (contact.type === 'prospect') stats.prospects++;
      else if (contact.type === 'customer') stats.customers++;
      else if (contact.type === 'partner') stats.partners++;
    });
    
    return stats;
  } catch (error) {
    console.error("Error fetching contact type stats:", error);
    return { leads: 0, prospects: 0, customers: 0, partners: 0 };
  }
};