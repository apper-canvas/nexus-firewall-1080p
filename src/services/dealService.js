/**
 * Deal Service
 * Handles all deal-related data operations
 */

// Helper function to get ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Deal table name
const TABLE_NAME = 'deal';

/**
 * Fetch all deals
 */
export const fetchDeals = async () => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: ["id", "Name", "Tags", "amount", "stage", "probability", "contact", "CreatedOn"],
      orderBy: [
        {
          field: "CreatedOn",
          direction: "desc"
        }
      ],
      expands: [
        {
          name: "contact",
          fields: ["Name", "email", "company"]
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response || !response.data) {
      return [];
    }
    
    // Format data for display
    const formattedData = response.data.map(deal => {
      // If contact is expanded, use the contact name
      const contactName = deal.contact?.Name || "Unknown Contact";
      
      return {
        ...deal,
        contactName
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error("Error fetching deals:", error);
    throw error;
  }
};

/**
 * Create a new deal
 */
export const createDeal = async (dealData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare data - only include updateable fields
    const params = {
      records: [{
        Name: dealData.name,
        amount: dealData.amount,
        stage: dealData.stage,
        probability: dealData.probability,
        contact: dealData.contactId
      }]
    };
    
    if (dealData.Tags) {
      params.records[0].Tags = dealData.Tags;
    }
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response || !response.success || !response.results || response.results.length === 0) {
      throw new Error("Failed to create deal");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating deal:", error);
    throw error;
  }
};

/**
 * Update an existing deal
 */
export const updateDeal = async (id, dealData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare data - only include updateable fields
    const params = {
      records: [{
        id,
        Name: dealData.name,
        amount: dealData.amount,
        stage: dealData.stage,
        probability: dealData.probability,
        contact: dealData.contactId
      }]
    };
    
    if (dealData.Tags) {
      params.records[0].Tags = dealData.Tags;
    }
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update deal");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating deal:", error);
    throw error;
  }
};

/**
 * Delete a deal
 */
export const deleteDeal = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error("Failed to delete deal");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting deal:", error);
    throw error;
  }
};