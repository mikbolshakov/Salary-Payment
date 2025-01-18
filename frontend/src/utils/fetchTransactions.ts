import axios from 'axios';

export const fetchTransactions = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/transactions`,
    );
    return response.data;
  } catch (error) {
    console.error('Error displaying transactions:', error);
    alert('Error displaying transactions');
    throw error;
  }
};
