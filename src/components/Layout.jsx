import React, { useState } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const drawerWidth = 240;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex">
      <CssBaseline />
      
      {/* AppBar for mobile */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { sm: 'none' }, // Hide on desktop
          backgroundColor: '#1f2937' // Match sidebar dark theme
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Ethara Assessment
          </Typography>
        </Toolbar>
      </AppBar>

      <nav
        className="sm:w-[240px] sm:shrink-0"
        aria-label="navigation folders"
      >
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      </nav>

      <main
        className="flex-1 p-6 sm:w-[calc(100%-240px)] min-h-screen mt-14 sm:mt-0 bg-gray-50"
      >
        <Outlet />
      </main>
    </div>
  );
}
