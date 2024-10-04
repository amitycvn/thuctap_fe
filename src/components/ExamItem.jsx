// components/ExamItem.jsx
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { styled } from '@mui/material/styles';

const StyledCard = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    textAlign: 'center',
    boxShadow: theme.shadows[2],
    '&:hover': {
        boxShadow: theme.shadows[4],
    },
}));

export default function ExamItem({ data }) {
    const navigate = useNavigate();

    const handleStartExam = () => {
        navigate(`/exam/detail/${data.id}`);
    };

    return (
        <StyledCard>
            <h3 className="text-lg font-bold">{data.TestName}</h3>
            <div className="flex justify-center items-center gap-4 mt-2 text-gray-600">
                <div >
                    <AccessTimeIcon />
                    <span className="ml-1">10 phút</span>
                </div>

            </div>
            <div className="flex justify-center items-center gap-4 mt-2 text-gray-600">

                <div >
                    <QuestionAnswerIcon />
                    <span className="ml-1">30 câu hỏi</span>
                </div>
            </div>
            <div className="mt-2">
                <span className="inline-block px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">#TOEIC Test</span>
            </div>
            <Button variant="contained" color="primary" className="mt-4 w-full" onClick={handleStartExam}>
                Làm bài
            </Button>
        </StyledCard>
    );
}
