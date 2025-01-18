import axios from 'axios';

export const fetchEmployees = async () => {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_URL}/employees`,
    );
    return data;
  } catch (error) {
    console.error('Error displaying employees: ', error);
    alert('Error displaying employees');
    throw error;
  }
};
