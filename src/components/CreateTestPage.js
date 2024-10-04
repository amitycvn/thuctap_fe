import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

const CreateTestPage = () => {
  const [testName, setTestName] = useState('');
  const [questions, setQuestions] = useState([{
    QuestionText: '',
    OptionA: '',
    OptionB: '',
    OptionC: '',
    OptionD: '',
    CorrectOption: '',
    QuestionType: ''
  }]);
  const [errors, setErrors] = useState({ testName: {}, questions: [] });
  const navigate = useNavigate();

  const validateTestName = (name) => {
    const errors = {};
    if (!name) {
      errors.TestName = 'Tên bài kiểm tra là bắt buộc';
    } else if (name.length > 255) {
      errors.TestName = 'Tên bài kiểm tra không được dài quá 255 ký tự';
    }
    return errors;
  };

  const validateQuestion = (question) => {
    const errors = {};
    if (!question.QuestionText) {
      errors.QuestionText = 'Câu hỏi là bắt buộc';
    }
    if (question.OptionA && question.OptionA.length > 255) {
      errors.OptionA = 'Lựa chọn A không được dài quá 255 ký tự';
    }
    if (question.OptionB && question.OptionB.length > 255) {
      errors.OptionB = 'Lựa chọn B không được dài quá 255 ký tự';
    }
    if (question.OptionC && question.OptionC.length > 255) {
      errors.OptionC = 'Lựa chọn C không được dài quá 255 ký tự';
    }
    if (question.OptionD && question.OptionD.length > 255) {
      errors.OptionD = 'Lựa chọn D không được dài quá 255 ký tự';
    }
    if (question.CorrectOption && !['A', 'B', 'C', 'D'].includes(question.CorrectOption)) {
      errors.CorrectOption = 'Lựa chọn đúng phải là một trong các giá trị A, B, C, D';
    }
    if (!question.QuestionType) {
      errors.QuestionType = 'Loại câu hỏi là bắt buộc';
    } else if (question.QuestionType.length > 50) {
      errors.QuestionType = 'Loại câu hỏi không được dài quá 50 ký tự';
    }
    return errors;
  };

  const validateForm = () => {
    const testNameErrors = validateTestName(testName);
    const questionErrors = questions.map((question) => validateQuestion(question));

    setErrors({
      testName: testNameErrors,
      questions: questionErrors
    });

    return Object.keys(testNameErrors).length === 0 && questionErrors.every(qErrors => Object.keys(qErrors).length === 0);
  };

  const handleTestNameChange = (e) => {
    setTestName(e.target.value);
  };

  const handleQuestionChange = (index, e) => {
    const { name, value } = e.target;
    const newQuestions = questions.map((question, i) => {
      if (i === index) {
        return { ...question, [name]: value };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      QuestionText: '',
      OptionA: '',
      OptionB: '',
      OptionC: '',
      OptionD: '',
      CorrectOption: '',
      QuestionType: ''
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await addTest(testName, questions);
        setTestName('');
        setQuestions([{
          QuestionText: '',
          OptionA: '',
          OptionB: '',
          OptionC: '',
          OptionD: '',
          CorrectOption: '',
          QuestionType: ''
        }]);
        navigate('/showTest'); // Chuyển hướng sau khi submit thành công
      } catch (error) {
        console.error('Có lỗi xảy ra khi tạo bài kiểm tra!', error);
      }
    }
  };

  const addTest = async (testName, questions) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/createTest', { TestName: testName });
      const testId = response.data.id;
      const questionPromises = questions.map(question =>
        axios.post('http://127.0.0.1:8000/api/createQuestions', {
          QuestionText: question.QuestionText,
          OptionA: question.OptionA,
          OptionB: question.OptionB,
          OptionC: question.OptionC,
          OptionD: question.OptionD,
          CorrectOption: question.CorrectOption,
          QuestionType: question.QuestionType,
          test_id: testId
        })
      );
      await Promise.all(questionPromises);
    } catch (error) {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error', error.message);
      }
      console.error('Config:', error.config);
      throw error; // Ném lỗi để hàm gọi có thể bắt
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tạo Bài Kiểm Tra và Câu Hỏi
      </Typography>
      <form onSubmit={handleSubmit}>
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Thông Tin Bài Kiểm Tra
            </Typography>
            <TextField
              label="Tên bài kiểm tra"
              variant="outlined"
              fullWidth
              margin="normal"
              value={testName}
              onChange={handleTestNameChange}
              error={Boolean(errors.testName?.TestName)}
              helperText={errors.testName?.TestName}
            />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Câu Hỏi
            </Typography>
            {questions.map((question, index) => (
              <Card variant="outlined" sx={{ mb: 2 }} key={index}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Câu hỏi"
                        name="QuestionText"
                        variant="outlined"
                        fullWidth
                        value={question.QuestionText}
                        onChange={(e) => handleQuestionChange(index, e)}
                        error={Boolean(errors.questions[index]?.QuestionText)}
                        helperText={errors.questions[index]?.QuestionText}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Lựa chọn A"
                        name="OptionA"
                        variant="outlined"
                        fullWidth
                        value={question.OptionA}
                        onChange={(e) => handleQuestionChange(index, e)}
                        error={Boolean(errors.questions[index]?.OptionA)}
                        helperText={errors.questions[index]?.OptionA}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Lựa chọn B"
                        name="OptionB"
                        variant="outlined"
                        fullWidth
                        value={question.OptionB}
                        onChange={(e) => handleQuestionChange(index, e)}
                        error={Boolean(errors.questions[index]?.OptionB)}
                        helperText={errors.questions[index]?.OptionB}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Lựa chọn C"
                        name="OptionC"
                        variant="outlined"
                        fullWidth
                        value={question.OptionC}
                        onChange={(e) => handleQuestionChange(index, e)}
                        error={Boolean(errors.questions[index]?.OptionC)}
                        helperText={errors.questions[index]?.OptionC}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Lựa chọn D"
                        name="OptionD"
                        variant="outlined"
                        fullWidth
                        value={question.OptionD}
                        onChange={(e) => handleQuestionChange(index, e)}
                        error={Boolean(errors.questions[index]?.OptionD)}
                        helperText={errors.questions[index]?.OptionD}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Lựa chọn đúng"
                        name="CorrectOption"
                        variant="outlined"
                        fullWidth
                        value={question.CorrectOption}
                        onChange={(e) => handleQuestionChange(index, e)}
                        error={Boolean(errors.questions[index]?.CorrectOption)}
                        helperText={errors.questions[index]?.CorrectOption}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Loại câu hỏi"
                        name="QuestionType"
                        variant="outlined"
                        fullWidth
                        value={question.QuestionType}
                        onChange={(e) => handleQuestionChange(index, e)}
                        error={Boolean(errors.questions[index]?.QuestionType)}
                        helperText={errors.questions[index]?.QuestionType}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleAddQuestion}>
              Thêm Câu Hỏi
            </Button>
          </CardContent>
        </Card>
        <Button type="submit" variant="contained" color="success" sx={{ mt: 2 }}>
          Tạo Bài Kiểm Tra
        </Button>
      </form>
    </Container>
  );
};

export default CreateTestPage;
