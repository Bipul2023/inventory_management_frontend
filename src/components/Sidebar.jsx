import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function Sidebar({ mobileOpen, handleDrawerToggle, drawerWidth }) {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Products', icon: <InventoryIcon />, path: '/products' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
  ];

  const drawerContent = (
    <>
      <div className="p-4 border-b border-gray-700 h-[64px] sm:h-auto flex items-center">
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Ethara System
        </Typography>
      </div>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            onClick={() => {
              if (mobileOpen) handleDrawerToggle();
            }}
            sx={{
              backgroundColor: location.pathname === item.path ? '#374151' : 'transparent',
              '&:hover': {
                backgroundColor: '#374151',
              }
            }}
          >
            <ListItemIcon sx={{ color: '#9ca3af' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: '#1f2937', 
            color: '#f3f4f6', 
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: '#1f2937', 
            color: '#f3f4f6', 
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
