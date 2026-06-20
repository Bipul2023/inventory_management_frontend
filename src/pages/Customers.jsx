import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Snackbar, Alert, Box
} from '@mui/material';

import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import api from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { full_name: '', email: '', phone_number: '' }
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      showSnackbar("Failed to load customers.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      reset({
        full_name: customer.full_name,
        email: customer.email,
        phone_number: customer.phone_number || ''
      });
      setIsEditing(true);
      setCurrentId(customer.id);
    } else {
      reset({ full_name: '', email: '', phone_number: '' });
      setIsEditing(false);
      setCurrentId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset({ full_name: '', email: '', phone_number: '' });
    setCurrentId(null);
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing && currentId) {
        await api.put(`/customers/${currentId}`, data);
        showSnackbar("Customer updated successfully!", "success");
      } else {
        await api.post('/customers', data);
        showSnackbar("Customer created successfully!", "success");
      }
      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      console.error("Save error:", err);
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : (typeof detail === 'string' ? detail : "Failed to save customer.");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await api.delete(`/customers/${customerToDelete.id}`);
      showSnackbar("Customer deleted successfully!", "success");
      fetchCustomers();
    } catch (err) {
      console.error("Delete error:", err);
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : (typeof detail === 'string' ? detail : "Failed to delete customer.");
      showSnackbar(errorMessage, "error");
    } finally {
      setDeleteDialog(false);
      setCustomerToDelete(null);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-3">
        <Typography variant="h4" className="font-bold text-gray-800">
          Customers
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="bg-green-600 hover:bg-green-700"
        >
          Add Customer
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} className="shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <Table sx={{ minWidth: 650 }} aria-label="customers table">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold text-gray-600">ID</TableCell>
                <TableCell className="font-semibold text-gray-600">Full Name</TableCell>
                <TableCell className="font-semibold text-gray-600">Email</TableCell>
                <TableCell className="font-semibold text-gray-600">Phone</TableCell>
                <TableCell align="center" className="font-semibold text-gray-600">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="py-8 text-gray-500">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell component="th" scope="row">{customer.id}</TableCell>
                    <TableCell className="font-medium text-gray-800">{customer.full_name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone_number || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenDialog(customer)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(customer)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        <DialogContent dividers>
          <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <TextField
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              {...register("full_name", { required: "Full name is required" })}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Phone Number"
              type="tel"
              fullWidth
              variant="outlined"
              {...register("phone_number")}
              error={!!errors.phone_number}
              helperText={errors.phone_number?.message}
            />
          </form>
        </DialogContent>
        <DialogActions className="px-6 py-4">
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button 
            type="submit"
            form="customer-form"
            variant="contained" 
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the customer "{customerToDelete?.full_name}"?</Typography>
        </DialogContent>
        <DialogActions className="px-6 py-4">
          <Button onClick={() => setDeleteDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
