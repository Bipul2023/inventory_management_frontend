import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Snackbar, Alert, Box, MenuItem, Select, FormControl, InputLabel,
  Grid, Divider
} from '@mui/material';

import { Add as AddIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import api from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { register, control, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm({
    defaultValues: {
      customer_id: '',
      items: [{ product_id: '', quantity: 1 }]
    },
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      showSnackbar("Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    reset({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
    setOpenCreateDialog(true);
  };

  const handleCloseCreate = () => {
    setOpenCreateDialog(false);
  };

  const calculateTotal = () => {
    let total = 0;
    (watchedItems || []).forEach(item => {
      if (item.product_id) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          total += product.price * (item.quantity || 1);
        }
      }
    });
    return total.toFixed(2);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        customer_id: data.customer_id,
        items: data.items.map(item => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity, 10)
        }))
      };
      
      await api.post('/orders', payload);
      showSnackbar("Order created successfully!", "success");
      handleCloseCreate();
      fetchData(); // Refresh list and products stock
    } catch (err) {
      console.error("Order creation error:", err);
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : (typeof detail === 'string' ? detail : "Failed to create order.");
      showSnackbar(errorMessage, "error");
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetailsDialog(true);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Helper to get customer name
  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.full_name : `Customer ${id}`;
  };

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-3">
        <Typography variant="h4" className="font-bold text-gray-800">
          Orders
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Create Order
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} className="shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <Table sx={{ minWidth: 650 }} aria-label="orders table">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold text-gray-600">Order ID</TableCell>
                <TableCell className="font-semibold text-gray-600">Customer</TableCell>
                <TableCell align="right" className="font-semibold text-gray-600">Total Amount (₹)</TableCell>
                <TableCell align="right" className="font-semibold text-gray-600">Items Count</TableCell>
                <TableCell align="center" className="font-semibold text-gray-600">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="py-8 text-gray-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell component="th" scope="row">#{order.id}</TableCell>
                    <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                    <TableCell align="right" className="font-medium text-green-600">
                      ₹{order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">{order.items?.length || 0}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleViewDetails(order)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Order Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreate} maxWidth="md" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent dividers>
          <form id="order-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <FormControl fullWidth variant="outlined" margin="dense" error={!!errors.customer_id}>
                <InputLabel id="customer-select-label">Select Customer</InputLabel>
                <Controller
                  name="customer_id"
                  control={control}
                  rules={{ required: "Customer is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="customer-select-label"
                      label="Select Customer"
                    >
                      {customers.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.full_name} ({c.email})</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.customer_id && <Typography color="error" variant="caption">{errors.customer_id.message}</Typography>}
              </FormControl>
            </div>

            <Typography variant="h6" className="mb-2 text-gray-700">Order Items</Typography>
            {fields.map((item, index) => (
              <Grid container spacing={2} key={item.id} alignItems="center" className="mb-3">
                <Grid item xs={6} className="w-42">
                  <FormControl fullWidth variant="outlined" error={!!errors?.items?.[index]?.product_id}>
                    <InputLabel id={`product-select-label-${index}`}>Product</InputLabel>
                    <Controller
                      name={`items.${index}.product_id`}
                      control={control}
                      rules={{ required: "Product is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId={`product-select-label-${index}`}
                          label="Product"
                        >
                          {products.map((p) => (
                            <MenuItem key={p.id} value={p.id} disabled={p.quantity_in_stock <= 0}>
                              {p.name} - ₹{p.price.toFixed(2)} (Stock: {p.quantity_in_stock})
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors?.items?.[index]?.product_id && <Typography color="error" variant="caption">{errors.items[index].product_id.message}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    variant="outlined"
                    {...register(`items.${index}.quantity`, { 
                      required: "Quantity is required",
                      min: { value: 1, message: "Min 1" }
                    })}
                    error={!!errors?.items?.[index]?.quantity}
                    helperText={errors?.items?.[index]?.quantity?.message}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={2} textAlign="center">
                  <IconButton color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => append({ product_id: '', quantity: 1 })} sx={{ mb: 2 }}>
              Add Another Item
            </Button>

            <Divider sx={{ my: 2 }} />
            <div className="flex justify-end">
              <Typography variant="h6" className="font-bold">
                Total: ₹{calculateTotal()}
              </Typography>
            </div>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseCreate} color="inherit">Cancel</Button>
          <Button 
            type="submit" 
            form="order-form"
            variant="contained" 
            color="primary"
            disabled={!isValid}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <div>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Customer:</strong> {getCustomerName(selectedOrder.customer_id)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom className="mb-4">
                <strong>Total Amount:</strong> <span className="text-green-600 font-bold">₹{selectedOrder.total_amount.toFixed(2)}</span>
              </Typography>
              
              <Typography variant="h6" className="mb-2 text-gray-700 border-b pb-1">Items</Typography>
              <List>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <Typography variant="body1" className="font-medium">{item.product.name}</Typography>
                      <Typography variant="body2" color="textSecondary">Qty: {item.quantity} @ ₹{item.unit_price.toFixed(2)}</Typography>
                    </div>
                    <Typography variant="body1" className="font-semibold mt-2">
                      ₹{(item.quantity * item.unit_price).toFixed(2)}
                    </Typography>
                  </div>
                ))}
              </List>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenDetailsDialog(false)} color="primary">Close</Button>
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

// Simple internal List component placeholder instead of importing from MUI just for layout
const List = ({ children }) => <div>{children}</div>;
