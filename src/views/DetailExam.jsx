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
import { useSelector } from "react-redux";
import { sendTokenTranformService } from "../services/sendTokenTranformService";

export default function DetailExam() {
    const { userTest } = useSelector((state) => { return state.userTest })
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
        clearInterval(timerIdRef.current);
        setTimeTaken(10 * 60 - timeLeft);

        const newResults = {};
        let count = 0;
        questions.forEach(question => {
            const userAnswer = userAnswers[question.id];
            const correctAnswer = question.CorrectOption;
            const isCorrect = userAnswer == correctAnswer;
            newResults[question.id] = isCorrect;
            if (isCorrect) {
                count++;
            }
        });
        setResults(newResults);
        setCorrectCount(count);
        setSubmitted(true);

        const publicKey = sessionStorage.getItem('public_key');

        const data = {
            UserTestID: userTest.id,
            TotalQuestions: questions.length,
            CorrectAnswers: count,
            Score: (count / questions.length) * 10,
            time_work: 3 * 60 - timeLeft,
            next_page: tabSwitches,
            public_key: publicKey,
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/submit-result', data);
            console.log('Result saved successfully', response.data);

            if (count >= 2 && tabSwitches <= 2) {
                setShowTransferButton(true);
                setMessage("Bạn đã đạt yêu cầu. Nhấn 'Nhận chứng chỉ' để nhận.");
            } else {
                let errorMessage = [];
                if (count <= 2) {
                    errorMessage.push("Bạn cần trả lời đúng trên 2 câu");
                }
                if (tabSwitches > 2) {
                    errorMessage.push("Số lần chuyển tab không được quá 2 lần");
                }
                setMessage(errorMessage.join(" và ") + " để nhận chứng chỉ.");
                setShowTransferButton(false);
            }
        } catch (error) {
            console.error('There was an error saving the result!', error);
            setMessage("Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại.");
        }
    }, [questions, userAnswers, timeLeft, tabSwitches]);

    const storeApproval = async (publicKey, testId) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/post-approval', {
                public_key: publicKey,
                consent_url: testId,
                status: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            console.log('Approval stored successfully', response.data);
        } catch (error) {
            console.error('There was an error storing the approval!', error);
        }
    };


    const createNFTForUser = async (itemId) => {
        const publicKey = sessionStorage.getItem('public_key');

        try {
            await storeApproval(publicKey, id);

            const options = {
                method: 'POST',
                url: 'https://api.gameshift.dev/nx/unique-assets',
                headers: {
                    accept: 'application/json',
                    'x-api-key': process.env.REACT_APP_X_API_KEY,
                    'content-type': 'application/json'
                },
                data: {
                    details: {
                        attributes: [{ traitType: 'id_test', value: id }],
                        collectionId: '4eda06ed-b497-4941-af90-ceae9c655aee',
                        description: 'Congratulations on completing test ' + id,
                        imageUrl: 'https://crossmint.myfilebase.com/ipfs/QmQLoLxkb67oL79WJHTadDTLfjTH7EuExAkNtEyBY1eiu8',
                        name: 'Approved Test ' + id
                    },
                    destinationUserReferenceId: publicKey
                }
            };

            const response = await axios.request(options);
            console.log('Item transferred successfully', response.data);
        } catch (error) {
            console.error('There was an error in the process!', error);
            throw error;
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

    const handleReceiveCertificate = async () => {
        try {
            // Tính tổng điểm dựa trên số câu đúng
            const totalScore = (correctCount / questions.length) * 10; // Chuyển đổi sang thang điểm 10
            const roundedScore = Math.floor(totalScore); // Làm tròn xuống

            alert('Chứng chỉ sẽ được gửi đến ví của bạn sau ít phút nữa');
            setShowTransferButton(false);

            // Lấy public key của người dùng
            const publicKey = sessionStorage.getItem('public_key');

            // Tạo NFT
            await createNFTForUser(id);

            // Khởi tạo service và gửi token tương ứng với điểm số
            const sendTokenService = new sendTokenTranformService();
            const result = await sendTokenService.sendToken(
                'EawY8hMipRETvdcX3RPqNPT2ziD3m6kSh5xg5Ypxsppc', 
                publicKey, 
                roundedScore // Sử dụng điểm đã làm tròn thay vì giá trị cố định
            );

            if (result.success) {
                setMessage(`Token và NFT đã được gửi thành công! Bạn nhận được ${roundedScore} token cho bài thi này.`);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage("Có lỗi xảy ra khi tạo chứng chỉ và gửi token. Vui lòng thử lại.");
            setShowTransferButton(true);
        }
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
                    {/* {showTransferButton && (
                        <Button
                            variant="contained"
                            className="w-[100%] !my-3"
                            onClick={async () => {
                                try {
                                    alert('Chứng chỉ sẽ được gửi đến ví của bạn sau ít phút nữa');
                                    setShowTransferButton(false);
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    await createNFTForUser(id);
                                } catch (error) {
                                    setMessage("Có lỗi xảy ra khi tạo chứng chỉ. Vui lòng thử lại.");
                                    setShowTransferButton(true);
                                }
                            }}
                        >
                            Nhận chứng chỉ
                        </Button>
                    )} */}
                    {showTransferButton && (
                        <Button
                            variant="contained"
                            className="w-[100%] !my-3"
                            onClick={handleReceiveCertificate}
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
