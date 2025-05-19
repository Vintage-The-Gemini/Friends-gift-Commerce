// utils/mpesaService.js
const axios = require('axios');

class MpesaService {
  constructor() {
    this.baseUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortCode = process.env.MPESA_SHORTCODE || '174379'; // Default sandbox shortcode
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://example.com/api/contributions/mpesa-callback';
    
    this.validateConfig();
  }
  
  /**
   * Validate required configuration
   */
  validateConfig() {
    const missingConfig = [];
    
    if (!this.consumerKey) missingConfig.push('MPESA_CONSUMER_KEY');
    if (!this.consumerSecret) missingConfig.push('MPESA_CONSUMER_SECRET');
    if (!this.passkey) missingConfig.push('MPESA_PASSKEY');
    if (!this.shortCode) missingConfig.push('MPESA_SHORTCODE');
    
    if (missingConfig.length > 0) {
      console.warn(`M-PESA configuration incomplete. Missing: ${missingConfig.join(', ')}`);
    }
  }
  
  /**
   * Get Safaricom OAuth token
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    try {
      // Check for credentials
      if (!this.consumerKey || !this.consumerSecret) {
        throw new Error('M-PESA credentials not configured');
      }
      
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Failed to get access token from Safaricom');
      }
      
      return response.data.access_token;
    } catch (error) {
      console.error('M-PESA access token error:', error.message);
      if (error.response) {
        console.error('Response details:', {
          status: error.response.status,
          data: error.response.data,
        });
      }
      throw new Error('Failed to authenticate with M-PESA');
    }
  }
  
  /**
   * Generate timestamp in the format required by Safaricom
   * @returns {string} Timestamp (YYYYMMDDHHmmss)
   */
  getTimestamp() {
    const date = new Date();
    return (
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2)
    );
  }
  
  /**
   * Initiate STK Push
   * @param {string} phoneNumber - Customer phone (format: 254XXXXXXXXX, no leading +)
   * @param {number} amount - Amount to charge
   * @param {string} reference - Reference for the transaction
   * @param {string} description - Transaction description
   * @returns {Promise<Object>} STK push response
   */
  async initiateSTKPush(phoneNumber, amount, reference, description) {
    try {
      // Check for required config
      if (!this.passkey || !this.shortCode) {
        throw new Error('M-PESA passkey or shortcode not configured');
      }
      
      // Remove leading + if present
      const formattedPhone = phoneNumber.replace('+', '');
      
      // Get access token
      const accessToken = await this.getAccessToken();
      
      // Create password (format: shortcode+passkey+timestamp)
      const timestamp = this.getTimestamp();
      const password = Buffer.from(
        `${this.shortCode}${this.passkey}${timestamp}`
      ).toString('base64');
      
      // Ensure amount is an integer (no decimals allowed)
      const intAmount = Math.round(amount);
      
      // Make STK push request
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          BusinessShortCode: this.shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: intAmount,
          PartyA: formattedPhone,
          PartyB: this.shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: this.callbackUrl,
          AccountReference: reference.toString().substring(0, 12), // Max 12 chars
          TransactionDesc: description.substring(0, 13), // Max 13 chars
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('M-PESA STK push error:', error.message);
      
      // Return detailed error for debugging
      if (error.response) {
        console.error('M-PESA API response error:', {
          status: error.response.status,
          data: error.response.data,
        });
      }
      
      throw new Error('Failed to initiate M-PESA payment');
    }
  }
  
  /**
   * Check transaction status
   * @param {string} checkoutRequestID - The checkout request ID from STK push
   * @returns {Promise<Object>} Transaction status response
   */
  async checkTransactionStatus(checkoutRequestID) {
    try {
      // Get access token
      const accessToken = await this.getAccessToken();
      
      // Create password
      const timestamp = this.getTimestamp();
      const password = Buffer.from(
        `${this.shortCode}${this.passkey}${timestamp}`
      ).toString('base64');
      
      // Make status request
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          BusinessShortCode: this.shortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestID,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('M-PESA transaction status error:', error.message);
      if (error.response) {
        console.error('Response details:', {
          status: error.response.status,
          data: error.response.data,
        });
      }
      throw new Error('Failed to check M-PESA transaction status');
    }
  }
}

// Create and export a singleton instance
const mpesaService = new MpesaService();
module.exports = mpesaService;