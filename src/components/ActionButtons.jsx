import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconChevronDown,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';
import { defaultFieldTypes } from '../types';

const ActionButtons = ({
  field,
  level,
  parentId,
  onFieldSelect,
  onAddFieldToLayout,
  onAddLayoutToContainer,
  moveField,
  deleteField,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);

  const isLayout = field.isLayout;
  const layoutTypes = defaultFieldTypes.filter((ft) => ft.isLayout && ft.id !== "object");

  const handleMoreClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleAddClick = (event) => {
    event.stopPropagation();
    setAddMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAddMenuAnchor(null);
  };

  const handleAddField = () => {
    onAddFieldToLayout(field.id);
    handleClose();
  };

  const handleAddLayout = (layoutType) => {
    onAddLayoutToContainer(field.id, layoutType);
    handleClose();
  };

  // For deep nesting (level > 2), show minimal buttons
  if (level > 2) {
    return (
      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
        <Tooltip title="More options">
          <IconButton
            size="small"
            onClick={handleMoreClick}
            sx={{
              p: 0.25,
              color: 'grey.500',
              '&:hover': { color: 'primary.main', backgroundColor: 'grey.100' },
            }}
          >
            <IconDotsVertical size={16} />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{
            dense: true,
          }}
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onFieldSelect(field, true);
              handleClose();
            }}
          >
            <ListItemIcon>
              <IconEdit size={18} />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>

          {isLayout && (
            <MenuItem onClick={handleAddField}>
              <ListItemIcon>
                <IconPlus size={18} />
              </ListItemIcon>
              <ListItemText primary="Add Field" />
            </MenuItem>
          )}

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              moveField(field.id, 'up', parentId);
              handleClose();
            }}
          >
            <ListItemIcon>
              <IconArrowUp size={18} />
            </ListItemIcon>
            <ListItemText primary="Move Up" />
          </MenuItem>

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              moveField(field.id, 'down', parentId);
              handleClose();
            }}
          >
            <ListItemIcon>
              <IconArrowDown size={18} />
            </ListItemIcon>
            <ListItemText primary="Move Down" />
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              deleteField(field.id, parentId);
              handleClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <IconTrash
                size={18}
                color={(theme) => theme.palette.error.main}
              />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  // For shallower nesting, show more buttons
  return (
    <Box
      sx={{
        display: 'flex',
        gap: level > 1 ? 0.25 : 0.5,
        flexShrink: 0,
        alignItems: 'center',
      }}
    >
      {isLayout && (
        <Tooltip title="Add field or layout">
          <IconButton
            size="small"
            onClick={handleAddClick}
            sx={{
              p: level > 1 ? 0.25 : 0.5,
              color: 'success.main',
              '&:hover': {
                color: 'success.dark',
                backgroundColor: 'success.light',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconPlus size={level > 1 ? 16 : 18} />
              <IconChevronDown size={level > 1 ? 12 : 14} />
            </Box>
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onFieldSelect(field, true);
          }}
          sx={{
            p: level > 1 ? 0.25 : 0.5,
            color: 'primary.main',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'primary.light',
            },
          }}
        >
          <IconEdit size={level > 1 ? 16 : 18} />
        </IconButton>
      </Tooltip>

      <Tooltip title="More options">
        <IconButton
          size="small"
          onClick={handleMoreClick}
          sx={{
            p: level > 1 ? 0.25 : 0.5,
            color: 'grey.500',
            '&:hover': {
              color: 'grey.600',
              backgroundColor: 'grey.100',
            },
          }}
        >
          <IconDotsVertical size={level > 1 ? 16 : 18} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            deleteField(field.id, parentId);
          }}
          sx={{
            p: level > 1 ? 0.25 : 0.5,
            color: 'error.main',
            '&:hover': {
              color: 'error.dark',
              backgroundColor: 'error.light',
            },
          }}
        >
          <IconTrash size={level > 1 ? 16 : 18} />
        </IconButton>
      </Tooltip>

      {/* Add Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleClose}
        MenuListProps={{
          dense: true,
        }}
      >
        <MenuItem onClick={handleAddField}>
          <ListItemIcon>
            <IconEdit size={18} color={(theme) => theme.palette.primary.main} />
          </ListItemIcon>
          <ListItemText primary="Add Field" secondary="Add form input" />
        </MenuItem>

        <Divider />

        {layoutTypes.map((layoutType) => (
          <MenuItem
            key={layoutType.id}
            onClick={() => handleAddLayout(layoutType)}
          >
            <ListItemIcon>
              {React.createElement(layoutType.icon, {
                size: 18,
                color: (theme) => theme.palette.grey[500],
              })}
            </ListItemIcon>
            <ListItemText
              primary={layoutType.label}
              secondary={
                layoutType.id === 'group'
                  ? 'Container with border'
                  : layoutType.id === 'vertical-layout'
                  ? 'Stack vertically'
                  : 'Arrange horizontally'
              }
            />
          </MenuItem>
        ))}
      </Menu>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          dense: true,
        }}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            moveField(field.id, 'up', parentId);
            handleClose();
          }}
        >
          <ListItemIcon>
            <IconArrowUp size={18} />
          </ListItemIcon>
          <ListItemText primary="Move Up" />
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            moveField(field.id, 'down', parentId);
            handleClose();
          }}
        >
          <ListItemIcon>
            <IconArrowDown size={18} />
          </ListItemIcon>
          <ListItemText primary="Move Down" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ActionButtons;
