import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Alert from '@mui/material/Alert';

export default function DetailExam() {
    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState({});
    const [correctCount, setCorrectCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10 * 60); // 3 minutes in seconds
    const [timeTaken, setTimeTaken] = useState(0); // time taken in seconds
    const [tabSwitches, setTabSwitches] = useState(0); // Number of tab switches
    const [showTransferButton, setShowTransferButton] = useState(false); // New state for showing transfer button
    const [message, setMessage] = useState(""); // State for showing messages
    const questionRefs = useRef({});
    const timerIdRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/testQuestion/${id}`);
                setQuestions(response.data.testQuestions || []);
            } catch (error) {
                console.error("There was an error fetching the questions!", error);
            }
        };

        fetchQuestions();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => prev + 1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        timerIdRef.current = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerIdRef.current);
    }, [timeLeft]);

    const handleAnswerChange = useCallback((questionId, answer) => {
        setUserAnswers(prevAnswers => ({ ...prevAnswers, [questionId]: answer }));
    }, []);

    const handleSubmit = useCallback(async () => {
        clearInterval(timerIdRef.current); // Stop the timer
        setTimeTaken(10 * 60 - timeLeft); // Calculate time taken

        //console.log("User Answers:", userAnswers); // Check the user answers

        const newResults = {};
        let count = 0;
        questions.forEach(question => {
            const userAnswer = userAnswers[question.id];
            const correctAnswer = question.CorrectOption;
            const isCorrect = userAnswer == correctAnswer;
            //console.log(`Question ID: ${question.id}, User Answer: ${userAnswer}, Correct Answer: ${correctAnswer}, Is Correct: ${isCorrect}`);
            newResults[question.id] = isCorrect;
            if (isCorrect) {
                count++;
            }
        });
        setResults(newResults);
        setCorrectCount(count);
        setSubmitted(true);

        const publicKey = sessionStorage.getItem('public_key'); // Retrieve public_key from session storage

        // Send results to API
        const data = {
            TotalQuestions: questions.length,
            CorrectAnswers: count,
            Score: (count / questions.length) * 10,
            time_work: 3 * 60 - timeLeft,
            next_page: tabSwitches,
            public_key: publicKey, // Use public_key here
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/submit-result', data);
            console.log('Result saved successfully', response.data);

            // Check conditions for creating unique asset
            if (count > 1 && tabSwitches <= 2) {
                const assetResponse = await createUniqueAsset();
                if (assetResponse && assetResponse.id) {
                    // Set the asset ID in session storage
                    sessionStorage.setItem('unique_asset_id', assetResponse.id);
                    setShowTransferButton(true);
                    setMessage("Bạn đã đạt yêu cầu. Nhấn 'Nhận chứng chỉ' để nhận.");
                }
            } else {
                setMessage("Bạn phải trả lời đúng trên 20 câu và số lần chuyển tab không quá 2 lần mới được nhận chứng chỉ.");
            }
        } catch (error) {
            console.error('There was an error saving the result or creating the unique asset!', error);
        }
    }, [questions, userAnswers, timeLeft, tabSwitches]);

    const createUniqueAsset = async () => {
        const options = {
            method: 'POST',
            url: 'https://api.gameshift.dev/nx/unique-assets',
            headers: {
                accept: 'application/json',
                'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJmYzAxNjMzZS0yNzFhLTQ2ZGEtOGUyZC1lYjVjNTAxODcyNzMiLCJzdWIiOiIxMWE4ODUxZC03ZWViLTQyNjktYTMzOS05MGZiNzAyZjFjYzMiLCJpYXQiOjE3MjE2MzM5MDB9.LRGC8FSwaSogOSbZ50Fnjw_v1Y7T_BcSJCVuG08Inqc',
                'content-type': 'application/json'
            },
            data: {
                details: {
                    collectionId: '6cfdd0b2-9e0c-43ce-8311-eb0f622f330f',
                    description: 'abc',
                    imageUrl: 'https://pngimg.com/uploads/certified/certified_PNG14.png',
                    name: 'Certification'
                },
                destinationUserReferenceId: '1',
            }
        };

        try {
            const response = await axios.request(options);
            console.log('Unique Asset created successfully', response.data);
            return response.data;
        } catch (error) {
            console.error('There was an error creating the unique asset!', error);
            throw error;
        }
    };

    const storeApproval = async (publicKey, consentUrl) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/post-approval', {
                public_key: publicKey,
                consent_url: consentUrl,
                status: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            console.log('Approval stored successfully', response.data);
        } catch (error) {
            console.error('There was an error storing the approval!', error);
        }
    };

    const transferItem = async (itemId) => {
        const publicKey = sessionStorage.getItem('public_key');
        const options = {
            method: 'POST',
            url: `https://api.gameshift.dev/nx/users/1/items/${itemId}/transfer`,
            headers: {
                accept: 'application/json',
                'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJmYzAxNjMzZS0yNzFhLTQ2ZGEtOGUyZC1lYjVjNTAxODcyNzMiLCJzdWIiOiIxMWE4ODUxZC03ZWViLTQyNjktYTMzOS05MGZiNzAyZjFjYzMiLCJpYXQiOjE3MjE2MzM5MDB9.LRGC8FSwaSogOSbZ50Fnjw_v1Y7T_BcSJCVuG08Inqc',
                'content-type': 'application/json',
            },
            data: {
                destinationWallet: publicKey,
                quantity: '1',
            },
        };

        try {
            const response = await axios.request(options);
            console.log('Item transferred successfully', response.data);

            const consentUrl = response.data.consentUrl;
            await storeApproval(publicKey, consentUrl);
        } catch (error) {
            console.error('There was an error transferring the item!', error);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const scrollToQuestion = (questionId) => {
        questionRefs.current[questionId]?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-[#efefef] p-[24px]">
            
            {submitted && (
                <>
                    <div className="exam-container flex items-start gap-x-[24px] mt-[24px]">
                        <div className="exam-content bg-white w-[30%] rounded-[8px] p-[16px]">
                        <Alert severity="info"><p className="text-600">Đáp án đúng: {correctCount}/{questions.length}</p>
                            <p className="text-600">{`Thời gian làm bài: ${formatTime(timeTaken)}`}</p>
                            <p className="text-600">Số lần chuyển tab: {tabSwitches}</p></Alert>
                            
                        </div>
                        
                    </div>
                </>
            )}


            <div className="exam-container flex items-start gap-x-[24px] mt-[24px]">
                <div className="exam-content bg-white w-[80%] rounded-[8px] p-[16px]">
                    <h3>

                    </h3>
                    <p className="note italic">
                        Choose the correct letter A, B, C, or D
                    </p>
                    <div className="questions">
                        {questions.length > 0 ? (
                            questions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="relative py-2"
                                    ref={el => (questionRefs.current[question.id] = el)}
                                >
                                    <div className="absolute t-0 l-0 question-index p-4 rounded-[50%] bg-blue-100 w-[36px] h-[36px] flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                    <div className="question-info ml-[46px] mb-1">
                                        <FormLabel
                                            id={`radio-buttons-group-label-${question.id}`}
                                        >
                                            {question.QuestionText}
                                            <RadioGroup
                                                aria-labelledby={`radio-buttons-group-label-${question.id}`}
                                                name={`radio-buttons-group-${question.id}`}
                                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                            >
                                                <FormControlLabel
                                                    value="A"
                                                    className="!p-0"
                                                    control={<Radio />}
                                                    label={`A. ${question.OptionA}`}
                                                    disabled={submitted}
                                                />
                                                <FormControlLabel
                                                    value="B"
                                                    control={<Radio />}
                                                    label={`B. ${question.OptionB}`}
                                                    disabled={submitted}
                                                />
                                                <FormControlLabel
                                                    value="C"
                                                    control={<Radio />}
                                                    label={`C. ${question.OptionC}`}
                                                    disabled={submitted}
                                                />
                                                <FormControlLabel
                                                    value="D"
                                                    control={<Radio />}
                                                    label={`D. ${question.OptionD}`}
                                                    disabled={submitted}
                                                />
                                            </RadioGroup>

                                        </FormLabel>
                                        {submitted && (
                                            <div className="mt-2">
                                                {results[question.id] ? (
                                                    <div className="text-green-600 flex items-center">
                                                        <CheckCircleIcon /> Đúng
                                                    </div>
                                                ) : (
                                                    <div className="text-red-600 flex items-center">
                                                        <CancelIcon /> Sai. Đáp án đúng: {question.CorrectOption}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div>No questions available</div>
                        )}
                    </div>
                </div>
                <div className="exam-overview bg-white w-[20%] rounded p-[16px]">
                    <p>Thời gian còn lại:</p>
                    <h3 className="text-red-500 text-[24px] font-bold">{formatTime(timeLeft)}</h3>
                    {!submitted && (
                        <Button
                            variant="contained"
                            className="w-[100%] !my-3"
                            onClick={handleSubmit}
                        >
                            NỘP BÀI
                        </Button>
                    )}
                    {showTransferButton && (
                        <Button
                            variant="contained"
                            className="w-[100%] !my-3"
                            onClick={async () => {
                                const uniqueAssetId = sessionStorage.getItem('unique_asset_id');
                                if (uniqueAssetId) {
                                    alert('Chứng chỉ sẽ được gửi đến ví của bạn sau ít phút nữa')
                                    setShowTransferButton(false);
                                    await new Promise(resolve => setTimeout(resolve, 30000));
                                    await transferItem(uniqueAssetId);
                                    
                                }
                                
                            }}
                            
                        >
                            Nhận chứng chỉ
                        </Button>
                    )}

                    {message && <p className="text-yellow-500 italic font-bold font-[12px] mt-1" >{message}</p>}

                    
                    <div className="status-questions flex items-center gap-1 flex-wrap">
                        {questions.length > 0 && questions.map((ques, index) => (
                            <div
                                key={ques.id}
                                className={`!w-[36px] !h-[36px] border border-1 border-gray rounded-[12px] flex items-center justify-center ${userAnswers[ques.id] ? 'bg-green-500' : ''}`}
                                onClick={() => scrollToQuestion(ques.id)}
                            >
                                {index + 1}
                            </div>
                        ))}
                        <p className="text-[14px] text-red-700">
                        Chú ý: bạn có thể click vào số thứ tự câu hỏi trong bài
                        để đánh dấu review
                    </p>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
