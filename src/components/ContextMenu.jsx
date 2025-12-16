import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  ViewModule as ViewModuleIcon,
  ViewWeek as ViewWeekIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  ContentCut as CutIcon,
} from '@mui/icons-material';
import { defaultFieldTypes } from '../types';

const ContextMenu = ({
  anchorEl,
  open,
  onClose,
  targetField,
  onAddField,
  onAddLayout,
  onEditField,
  onDeleteField,
  onCopyField,
  onCutField,
}) => {
  const layoutTypes = defaultFieldTypes.filter((ft) => ft.isLayout);
  const fieldTypes = defaultFieldTypes.filter((ft) => !ft.isLayout);

  const handleAddField = (fieldType) => {
    onAddField(fieldType);
    onClose();
  };

  const handleAddLayout = (layoutType) => {
    onAddLayout(layoutType);
    onClose();
  };

  const handleAction = (action) => {
    action();
    onClose();
  };

  if (!targetField) return null;

  const isLayout = targetField.isLayout;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          minWidth: 220,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Field Actions */}
      <MenuItem onClick={() => handleAction(onEditField)}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Edit Properties" />
      </MenuItem>

      <MenuItem onClick={() => handleAction(onCopyField)}>
        <ListItemIcon>
          <CopyIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Copy" />
      </MenuItem>

      <MenuItem onClick={() => handleAction(onCutField)}>
        <ListItemIcon>
          <CutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Cut" />
      </MenuItem>

      <Divider />

      {/* Layout-specific actions */}
      {isLayout && (
        <>
          <MenuItem disabled>
            <ListItemText
              primary={
                <Typography variant="caption" color="textSecondary">
                  Add to {targetField.label}
                </Typography>
              }
            />
          </MenuItem>

          {/* Quick add common field types */}
          <MenuItem
            onClick={() =>
              handleAddField(fieldTypes.find((ft) => ft.id === 'text'))
            }
          >
            <ListItemIcon>
              <Typography>📝</Typography>
            </ListItemIcon>
            <ListItemText primary="Add Text Field" />
          </MenuItem>

          <MenuItem
            onClick={() =>
              handleAddField(fieldTypes.find((ft) => ft.id === 'select'))
            }
          >
            <ListItemIcon>
              <Typography>📋</Typography>
            </ListItemIcon>
            <ListItemText primary="Add Select Field" />
          </MenuItem>

          <MenuItem
            onClick={() =>
              handleAddField(fieldTypes.find((ft) => ft.id === 'checkbox'))
            }
          >
            <ListItemIcon>
              <Typography>☑️</Typography>
            </ListItemIcon>
            <ListItemText primary="Add Checkbox" />
          </MenuItem>

          <Divider />

          {/* Layout options */}
          {layoutTypes.map((layoutType) => (
            <MenuItem
              key={layoutType.id}
              onClick={() => handleAddLayout(layoutType)}
            >
              <ListItemIcon>
                <Typography>{layoutType.icon}</Typography>
              </ListItemIcon>
              <ListItemText
                primary={`Add ${layoutType.label}`}
                secondary={
                  layoutType.id === 'group'
                    ? 'Visual container with border'
                    : layoutType.id === 'vertical-layout'
                    ? 'Stack elements vertically'
                    : 'Arrange elements horizontally'
                }
              />
            </MenuItem>
          ))}

          <Divider />
        </>
      )}

      <MenuItem
        onClick={() => handleAction(onDeleteField)}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </MenuItem>
    </Menu>
  );
};

export default ContextMenu;
