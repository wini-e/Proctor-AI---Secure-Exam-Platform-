import axios from 'axios';
const API_URL = 'http://localhost:5000/api/v1/exams';

export const createExam = async (examData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(API_URL, examData, config);
  return response.data;
};

export const getExamByAccessCode = async (accessCode, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/access/${accessCode}`, config);
  return response.data;
};

export const fetchMyExams = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/my-exams`, config);
  return response.data;
};

export const getExamDetails = async (examId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/${examId}`, config);
    return response.data;
};

export const updateExamDetails = async (examId, examData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${examId}`, examData, config);
    return response.data;
};

export const startExamById = async (examId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/${examId}/start`, config);
  return response.data;
};

export const deleteExamById = async (examId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${examId}`, config);
    return response.data;
};