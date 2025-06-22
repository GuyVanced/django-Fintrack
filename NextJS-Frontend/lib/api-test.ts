import { apiClient } from './api';

// Simple API test to debug category loading issues
export async function testCategoryAPIs() {
  console.log('=== API TEST START ===');
  
  try {
    // Test master categories
    console.log('Testing master categories...');
    const masterCategories = await apiClient.getMasterCategories();
    console.log('Master Categories Result:', masterCategories);
    
    // Test user categories
    console.log('Testing user categories...');
    const userCategories = await apiClient.getUserCategories();
    console.log('User Categories Result:', userCategories);
    
    console.log('=== API TEST SUCCESS ===');
  } catch (error) {
    console.error('=== API TEST ERROR ===');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Test function that can be called from browser console
if (typeof window !== 'undefined') {
  (window as any).testCategoryAPIs = testCategoryAPIs;
}
