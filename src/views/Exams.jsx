// views/Exams.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import ExamItem from '../components/ExamItem';
import { Link } from 'react-router-dom';
import {
  Card,
  Typography,
  Box,
  LinearProgress,
  Button,
  Alert
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function Exams() {
    const [exams, setExams] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [claimedRewards, setClaimedRewards] = useState([]);

    const rewards = [
        { 
            id: "reward_basic",
            threshold: 1, 
            name: "Mốc thưởng cơ bản", 
            description: "Hoàn thành bài thi đầu tiên",
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTljoPNHNoSKvICEdoMStryO63bZ9FUkn1GA&s"
        },
        { 
            id: "reward_intermediate",
            threshold: 3, 
            name: "Mốc thưởng trung cấp", 
            description: "Hoàn thành 3 bài thi",
            imageUrl: "https://static.ffx.io/images/$zoom_0.473%2C$multiply_1.545%2C$ratio_1%2C$width_378%2C$x_0%2C$y_0/t_crop_custom/q_86%2Cf_auto/d22d363b42bd80403a8a0847e21360116d15edfa"
        },
        { 
            id: "reward_advanced",
            threshold: 5, 
            name: "Mốc thưởng cao cấp", 
            description: "Hoàn thành 5 bài thi",
            imageUrl: "https://www.cnet.com/a/img/resize/e547a2e4388fcc5ab560f821ac170a59b9fb0143/hub/2021/12/13/d319cda7-1ddd-4855-ac55-9dcd9ce0f6eb/unnamed.png?auto=webp&fit=crop&height=1200&width=1200"
        }
    ];

    const createNFTForUser = async (traitType, value, description, name, imageUrl) => {
        const publicKey = sessionStorage.getItem('public_key');
        const options = {
            method: 'POST',
            url: 'https://api.gameshift.dev/nx/unique-assets',
            headers: {
                accept: 'application/json',
                'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI5ZDE3NDg3MS01MDdjLTQyYWEtODU5ZS1kMmFiNDRjY2U5ZDEiLCJzdWIiOiI4OGQzOGNiNi1hOTI1LTRlMDQtYWExMC1mZTJmMDBhYWQ4YzIiLCJpYXQiOjE3MzE0Nzk0NjN9.1yYN2JyuD9SIiCPp1aaPa8MXtqZlJEAyiQ6Q8oA8Zic',
                'content-type': 'application/json'
            },
            data: {
                details: {
                    attributes: [{traitType: traitType, value: value}],
                    collectionId: '253ae962-7962-4818-bdcf-7b7f59dfb6e2',
                    description: description,
                    imageUrl: imageUrl,
                    name: name
                },
                destinationUserReferenceId: publicKey
            }
        };

        try {
            const response = await axios.request(options);
            console.log('Item transferred successfully', response.data);
        } catch (error) {
            console.error('There was an error transferring the item!', error);
            throw error;
        }
    };

    useEffect(() => {
        // Fetch exams
        axios.get('http://127.0.0.1:8000/api/tests')
            .then(response => {
                setExams(response.data.tests || []);
            })
            .catch(error => {
                console.error('There was an error fetching the exams!', error);
            });

        // Fetch total records and reward history
        const publicKey = sessionStorage.getItem('public_key');
        if (publicKey) {
            axios.get(`http://127.0.0.1:8000/api/approval?public_key=${publicKey}`)
                .then(response => {
                    setTotalRecords(response.data.total_records);
                    // Lấy danh sách reward_milestone đã nhận
                    setClaimedRewards(response.data.reward_history.map(reward => reward.reward_milestone));
                })
                .catch(error => {
                    setError('Không thể tải thông tin mốc thưởng');
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const claimReward = async (rewardId, threshold) => {
        const publicKey = sessionStorage.getItem('public_key');
        if (!publicKey) {
            setError('Vui lòng kết nối ví để nhận thưởng');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('http://127.0.0.1:8000/api/reward-milestone-history', {
                public_key: publicKey,
                reward_milestone: rewardId,
                reward_value: threshold
            });

            if (response.status === 200) {
                setClaimedRewards(prev => [...prev, rewardId]);
                const reward = rewards.find(r => r.id === rewardId);
                await createNFTForUser(
                    reward.id,
                    threshold.toString(),
                    reward.description,
                    reward.name,
                    reward.imageUrl
                );
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi nhận thưởng');
            console.error('Error claiming reward:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRewardStatus = (threshold, rewardId) => {
        if (claimedRewards.includes(rewardId)) return 'claimed';
        if (totalRecords >= threshold) return 'completed';
        return 'locked';
    };

    return (
        <div className='container mx-auto px-4'>
            <div className="flex gap-2 mb-4">
                <Link to="/listNFT">
                    <button className='btn btn-success'>Danh sách chứng chỉ</button>
                </Link>
                <Link to="/buyNFT">
                    <button className='btn btn-warning'>Mua chứng chỉ</button>
                </Link>
            </div>

            {/* Rewards Section */}
            <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Mốc thưởng
                </Typography>

                {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : !sessionStorage.getItem('public_key') ? (
                    <Alert severity="info">
                        Vui lòng kết nối ví để xem mốc thưởng
                    </Alert>
                ) : (
                    <>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Tiến độ: {totalRecords} bài thi đã hoàn thành
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={(totalRecords / 5) * 100} 
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {rewards.map((reward) => (
                                <Card
                                    key={reward.id}
                                    sx={{
                                        p: 2,
                                        flex: '1 1 300px',
                                        opacity: getRewardStatus(reward.threshold, reward.id) === 'locked' ? 0.7 : 1,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <EmojiEventsIcon 
                                            color={getRewardStatus(reward.threshold, reward.id) === 'locked' ? 'disabled' : 'primary'} 
                                            sx={{ fontSize: 32 }}
                                        />
                                        <Box flex={1}>
                                            <Typography variant="h6">
                                                {reward.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {reward.description}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Yêu cầu: {reward.threshold} bài thi
                                            </Typography>
                                            {getRewardStatus(reward.threshold, reward.id) === 'claimed' && (
                                                <Typography 
                                                    variant="body2" 
                                                    color="success.main"
                                                    sx={{ mt: 1, fontStyle: 'italic' }}
                                                >
                                                    Đã nhận thưởng
                                                </Typography>
                                            )}
                                        </Box>
                                        {getRewardStatus(reward.threshold, reward.id) === 'completed' && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => claimReward(reward.id, reward.threshold)}
                                                disabled={loading}
                                            >
                                                {loading ? 'Đang xử lý...' : 'Nhận thưởng'}
                                            </Button>
                                        )}
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                    </>
                )}
            </Card>

            {/* Exams Section */}
            <h1 className='text-center text-3xl font-bold uppercase mt-8'>Danh sách đề thi</h1>
            <div id="exams-grid" className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8'>
                {exams.map(exam => (
                    <ExamItem key={exam.id} data={exam} />
                ))}
            </div>
        </div>
    );
}
