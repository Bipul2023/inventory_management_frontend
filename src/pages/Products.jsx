import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Snackbar, Alert, Box
} from '@mui/material';

import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', sku: '', price: '', quantity_in_stock: '' }
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      showSnackbar("Failed to load products.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (product = null) => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity_in_stock: product.quantity_in_stock
      });
      setIsEditing(true);
      setCurrentId(product.id);
    } else {
      reset({ name: '', sku: '', price: '', quantity_in_stock: '' });
      setIsEditing(false);
      setCurrentId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset({ name: '', sku: '', price: '', quantity_in_stock: '' });
    setCurrentId(null);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        price: parseFloat(data.price),
        quantity_in_stock: parseInt(data.quantity_in_stock, 10)
      };

      if (isEditing && currentId) {
        await api.put(`/products/${currentId}`, payload);
        showSnackbar("Product updated successfully!", "success");
      } else {
        await api.post('/products', payload);
        showSnackbar("Product created successfully!", "success");
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      console.error("Save error:", err);
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : (typeof detail === 'string' ? detail : "Failed to save product.");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete.id}`);
      showSnackbar("Product deleted successfully!", "success");
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : (typeof detail === 'string' ? detail : "Failed to delete product.");
      showSnackbar(errorMessage, "error");
    } finally {
      setDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4" className="font-bold text-gray-800">
          Products
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} className="shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <Table sx={{ minWidth: 650 }} aria-label="products table">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold text-gray-600">ID</TableCell>
                <TableCell className="font-semibold text-gray-600">Name</TableCell>
                <TableCell className="font-semibold text-gray-600">SKU</TableCell>
                <TableCell align="right" className="font-semibold text-gray-600">Price (₹)</TableCell>
                <TableCell align="right" className="font-semibold text-gray-600">Stock</TableCell>
                <TableCell align="center" className="font-semibold text-gray-600">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-8 text-gray-500">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell component="th" scope="row">{product.id}</TableCell>
                    <TableCell className="font-medium text-gray-800">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell align="right">₹{product.price.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={product.quantity_in_stock} 
                        color={product.quantity_in_stock < 10 ? 'error' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenDialog(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(product)}>
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
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent dividers>
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <TextField
              label="Product Name"
              type="text"
              fullWidth
              variant="outlined"
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="SKU"
              type="text"
              fullWidth
              variant="outlined"
              {...register("sku", { required: "SKU is required" })}
              error={!!errors.sku}
              helperText={errors.sku?.message}
            />
            <TextField
              label="Price"
              type="number"
              fullWidth
              variant="outlined"
              {...register("price", { 
                required: "Price is required", 
                min: { value: 0.01, message: "Price must be greater than 0" } 
              })}
              error={!!errors.price}
              helperText={errors.price?.message}
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label="Stock Quantity"
              type="number"
              fullWidth
              variant="outlined"
              {...register("quantity_in_stock", { 
                required: "Quantity is required",
                min: { value: 0, message: "Quantity cannot be negative" }
              })}
              error={!!errors.quantity_in_stock}
              helperText={errors.quantity_in_stock?.message}
            />
          </form>
        </DialogContent>
        <DialogActions className="px-6 py-4">
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button 
            type="submit" 
            form="product-form"
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
          <Typography>Are you sure you want to delete the product "{productToDelete?.name}"?</Typography>
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
