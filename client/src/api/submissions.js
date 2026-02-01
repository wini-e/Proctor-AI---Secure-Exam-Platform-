import axios from 'axios';
const API_URL = 'http://localhost:5000/api/v1/submissions';

export const startStudentExam = async (examId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(`${API_URL}/start/${examId}`, {}, config);
  return response.data;
};

export const updateStudentExam = async (submissionId, answers, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/update/${submissionId}`, { answers }, config);
  return response.data;
};

export const fetchSubmissionResult = async (submissionId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/${submissionId}/result`, config);
    return response.data;
};

export const fetchSubmissionsForExam = async (examId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/exam/${examId}`, config);
    return response.data;
};

export const fetchMyResults = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/my-results`, config);
    return response.data;
};

export const fetchSubmissionDetails = async (submissionId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/${submissionId}/details`, config);
    return response.data;
};