import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ListAll from "./ListAll";
import CreateNFT from "./CreateNFT";
import TestList from "./components/TestList";
import CreateTestPage from "./components/CreateTestPage";
import DetailExam from "./views/DetailExam";
import Exams from "./views/Exams";
import CreateUniqueAsset from "./components/CreateUniqueAsset";
import Layout from "./components/Layout";
import ApprovalList from "./components/ApprovalList";
import "./App.css";

function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<ListAll />} />
                        {/* <Route path="/create" element={<CreateNFT />} /> */}
                        <Route path="/showTest" element={<TestList />} />
                        <Route path="/createTest" element={<CreateTestPage />} />
                        <Route path="/approvals" element={<ApprovalList />} />
                        <Route path="/exam/detail/:id" element={<DetailExam />} />
                        <Route path="/exam" element={<Exams />} />
                        <Route path="/CreateUniqueAsset" element={<CreateUniqueAsset />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
