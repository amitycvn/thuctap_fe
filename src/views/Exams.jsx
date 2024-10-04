// views/Exams.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import ExamItem from '../components/ExamItem';

export default function Exams() {
    const [exams, setExams] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/tests')
            .then(response => {
                setExams(response.data.tests || []);
            })
            .catch(error => {
                console.error('There was an error fetching the exams!', error);
            });
    }, []);

    return (
        <div className='container mx-auto px-4'>
            <h1 className='text-center text-3xl font-bold uppercase mt-8'>Danh sách đề thi</h1>
            <div id="exams-grid" className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8'>
                {exams.map(exam => (
                    <ExamItem key={exam.id} data={exam} />
                ))}
            </div>
        </div>
    );
}
