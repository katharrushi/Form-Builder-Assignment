import React, { useState } from "react";
import { defaultFieldTypes } from "../types";
import {
  Typography,
  Box,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import {
  IconTarget,
  IconLayersLinked,
  IconForms,
  IconClipboard,
} from "@tabler/icons-react";

const DraggableFieldItem = ({ fieldType, onFieldSelect }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: fieldType.id,
      data: {
        type: "palette-item",
        fieldType: fieldType,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      elevation={isDragging ? 3 : 1}
      sx={{
        p: 1.5,
        mb: 1,
        cursor: isDragging ? "grabbing" : "grab",
        border: 1,
        borderColor: "grey.300",
        "&:hover": {
          backgroundColor: "grey.100",
          borderColor: "primary.main",
          transform: "translateY(-1px)",
        },
        display: "flex",
        alignItems: "center",
        gap: 1,
        userSelect: "none",
        transition: "all 0.2s ease",
        ...(isDragging && {
          backgroundColor: "primary.light",
          borderColor: "primary.main",
          boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}30`,
        }),
      }}
      onClick={() => onFieldSelect(fieldType)}
    >
      <Box
        sx={{
          minWidth: "24px",
          display: "flex",
          alignItems: "center",
          color: "primary.main",
        }}
      >
        {React.createElement(fieldType.icon, {
          size: 18,
          stroke: "currentColor",
        })}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {fieldType.label}
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ fontSize: "11px", lineHeight: 1.2 }}
        >
          {fieldType.isLayout ? "Layout Container" : "Form Input"}
        </Typography>
      </Box>
    </Paper>
  );
};

const FieldPalette = ({ onFieldSelect, onLoadSchema }) => {
  const [selectedSchema, setSelectedSchema] = useState("");

  const sampleSchemas = [
  {
      id: "organization-onboarding",
      name: "Organization Onboarding",
      description: "Comprehensive onboarding form",
    },
    {
      id: "product-order",
      name: "Product Order Form",
      description: "E-commerce order form",
    }
  
  ];

  const handleSchemaChange = (event) => {
    const schemaId = event.target.value;
    setSelectedSchema(schemaId);
    if (schemaId && onLoadSchema) {
      onLoadSchema(schemaId);
    }
  };

  const layoutTypes = defaultFieldTypes.filter((ft) => ft.isLayout && ft.id !== "object");
  const fieldTypes = defaultFieldTypes.filter((ft) => !ft.isLayout);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        backdropFilter: "blur(20px)",
        borderRight: { md: "1px solid" },
        borderColor: { md: "grey.200" },
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* Schema Loader Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box sx={{ color: "primary.main" }}>
          <IconClipboard size={20} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            color: "grey.900",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "-0.025em",
          }}
        >
          Form Templates
        </Typography>
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Choose Template</InputLabel>
        <Select
          value={selectedSchema}
          label="Choose Template"
          onChange={handleSchemaChange}
          sx={{
            backgroundColor: "background.paper",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "grey.300",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
          }}
        >
          <MenuItem value="">
            <em>Select a template...</em>
          </MenuItem>
          {sampleSchemas.map((schema) => (
            <MenuItem key={schema.id} value={schema.id}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {schema.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {schema.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

    

      {/* Form Fields Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box sx={{ color: "primary.main" }}>
          <IconForms size={20} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            color: "grey.900",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "-0.025em",
          }}
        >
          Form Fields
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          mb: 2.5,
          display: "block",
          color: "grey.600",
          fontSize: "0.875rem",
        }}
      >
        Input controls for data collection
      </Typography>
       
      <Box>
        {fieldTypes.map((fieldType) => (
          <DraggableFieldItem
            key={fieldType.id}
            fieldType={fieldType}
            onFieldSelect={onFieldSelect}
          />
        ))}
      </Box>

       <Divider sx={{ my: 2 }} />

  {/* Layout Elements Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box sx={{ color: "primary.main" }}>
          <IconLayersLinked size={20} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            color: "grey.900",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "-0.025em",
          }}
        >
          Layouts
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          mb: 2.5,
          display: "block",
          color: "grey.600",
          fontSize: "0.875rem",
        }}
      >
        Organize fields with containers
      </Typography>
      <Box sx={{ mb: 3 }}>
        {layoutTypes.map((fieldType) => (
          <DraggableFieldItem
            key={fieldType.id}
            fieldType={fieldType}
            onFieldSelect={onFieldSelect}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FieldPalette;
