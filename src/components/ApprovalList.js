import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for Material-UI Table
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${TableCell.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${TableCell.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ApprovalList = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/approvals');
        setApprovals(response.data);
      } catch (error) {
        setError('There was an error fetching the approvals');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const updateApprovalStatus = async (id) => {
    try {
      if (window.confirm('Are you sure you want to approve this item?')) {
        const response = await axios.put(`http://127.0.0.1:8000/api/approvals/${id}/status`);
        setApprovals(prevApprovals =>
          prevApprovals.map(approval =>
            approval.id === id ? { ...approval, status: 1 } : approval
          )
        );
        setSuccess('Approval status updated successfully');
      }
    } catch (error) {
      setError('Error updating approval status');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div    >
      <Typography variant="h4" gutterBottom>Approval List</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {approvals.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell>Public Key</StyledTableCell>
                <StyledTableCell>Consent URL</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Created At</StyledTableCell>
                <StyledTableCell>Updated At</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvals.map((approval) => (
                <StyledTableRow key={approval.id}>
                  <StyledTableCell>{approval.id}</StyledTableCell>
                  <StyledTableCell>{approval.public_key}</StyledTableCell>
                  <StyledTableCell>
                    <a href={approval.consent_url} target="_blank" rel="noopener noreferrer">
                      Access
                    </a>
                  </StyledTableCell>
                  <StyledTableCell>
                    {approval.status == 1 ? 'Approved' : 'Pending'}
                  </StyledTableCell>
                  <StyledTableCell>{new Date(approval.created_at).toLocaleString()}</StyledTableCell>
                  <StyledTableCell>{new Date(approval.updated_at).toLocaleString()}</StyledTableCell>
                  <StyledTableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => updateApprovalStatus(approval.id)}
                      disabled={approval.status == 1}
                    >
                      Approve
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No approvals found</Typography>
      )}
    </div>
  );
};

export default ApprovalList;
