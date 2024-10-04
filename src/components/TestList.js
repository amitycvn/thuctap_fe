import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, TextField, Typography, Box, CircularProgress, Alert } from '@mui/material';

const TestList = () => {
    const [tests, setTests] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTestName, setSelectedTestName] = useState('');
    const [editQuestion, setEditQuestion] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/tests')
            .then(response => {
                if (response.data && Array.isArray(response.data.tests)) {
                    setTests(response.data.tests);
                } else {
                    setTests([]);
                }
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    const fetchQuestions = (testId, testName) => {
        setLoading(true);
        axios.get(`http://127.0.0.1:8000/api/testQuestion/${testId}`)
            .then(response => {
                if (response.data && Array.isArray(response.data.testQuestions)) {
                    setQuestions(response.data.testQuestions);
                } else {
                    setQuestions([]);
                }
                setSelectedTestName(testName);
                setModalOpen(true);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setQuestions([]);
    };

    const handleEditModalOpen = (question) => {
        setEditQuestion(question);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setEditQuestion(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditQuestion({ ...editQuestion, [name]: value });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        axios.put(`http://127.0.0.1:8000/api/testQuestion/${editQuestion.id}`, editQuestion)
            .then(response => {
                setQuestions(questions.map(q => (q.id === editQuestion.id ? editQuestion : q)));
                handleEditModalClose();
            })
            .catch(error => {
                setError(error);
                handleEditModalClose();
            });
    };

    const handleDeleteQuestion = (questionId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
            axios.delete(`http://127.0.0.1:8000/api/deleteQuestion/${questionId}`)
                .then(response => {
                    setQuestions(questions.filter(q => q.id !== questionId));
                })
                .catch(error => {
                    setError(error);
                });
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">Error: {error.message}</Alert>;
    }

    return (
        <div style={{ padding: 20 }}>
            <Typography variant="h4" gutterBottom>Danh sách bài kiểm tra</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Bài kiểm tra</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell>{test.TestName}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="primary" onClick={() => fetchQuestions(test.id, test.TestName)}>Xem câu hỏi</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{ width: '90%', maxWidth: 1200, margin: 'auto', padding: 4, backgroundColor: 'white', borderRadius: 2, height: '80vh', overflow: 'auto' }}>
                    <Typography variant="h6" id="modal-title">Các câu hỏi cho bài kiểm tra {selectedTestName}</Typography>
                    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Question ID</TableCell>
                                    <TableCell>Test ID</TableCell>
                                    <TableCell>Question Text</TableCell>
                                    <TableCell>Option A</TableCell>
                                    <TableCell>Option B</TableCell>
                                    <TableCell>Option C</TableCell>
                                    <TableCell>Option D</TableCell>
                                    <TableCell>Correct Option</TableCell>
                                    <TableCell>Question Type</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {questions.map(question => (
                                    <TableRow key={question.id}>
                                        <TableCell>{question.id}</TableCell>
                                        <TableCell>{question.test_id}</TableCell>
                                        <TableCell>{question.QuestionText}</TableCell>
                                        <TableCell>{question.OptionA}</TableCell>
                                        <TableCell>{question.OptionB}</TableCell>
                                        <TableCell>{question.OptionC}</TableCell>
                                        <TableCell>{question.OptionD}</TableCell>
                                        <TableCell>{question.CorrectOption}</TableCell>
                                        <TableCell>{question.QuestionType}</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="secondary" onClick={() => handleEditModalOpen(question)}>Edit</Button>
                                            <Button variant="contained" color="error" onClick={() => handleDeleteQuestion(question.id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button variant="contained" color="secondary" onClick={handleModalClose} sx={{ marginTop: 2 }}>Đóng</Button>
                </Box>
            </Modal>

            {editQuestion && (
                <Modal
                    open={editModalOpen}
                    onClose={handleEditModalClose}
                    aria-labelledby="edit-modal-title"
                    aria-describedby="edit-modal-description"
                >
                    <Box sx={{ width: 400, margin: 'auto', padding: 4, backgroundColor: 'white', borderRadius: 2 }}>
                        <Typography variant="h6" id="edit-modal-title">Chỉnh sửa câu hỏi</Typography>
                        <form onSubmit={handleEditSubmit}>
                            <TextField
                                label="Question Text"
                                name="QuestionText"
                                value={editQuestion.QuestionText}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Option A"
                                name="OptionA"
                                value={editQuestion.OptionA}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Option B"
                                name="OptionB"
                                value={editQuestion.OptionB}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Option C"
                                name="OptionC"
                                value={editQuestion.OptionC}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Option D"
                                name="OptionD"
                                value={editQuestion.OptionD}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Correct Option"
                                name="CorrectOption"
                                value={editQuestion.CorrectOption}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Question Type"
                                name="QuestionType"
                                value={editQuestion.QuestionType}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                            <Box sx={{ marginTop: 2 }}>
                                <Button type="submit" variant="contained" color="primary">Save</Button>
                                <Button type="button" variant="outlined" color="secondary" onClick={handleEditModalClose} sx={{ marginLeft: 2 }}>Cancel</Button>
                            </Box>
                        </form>
                    </Box>
                </Modal>
            )}
        </div>
    );
};

export default TestList;
