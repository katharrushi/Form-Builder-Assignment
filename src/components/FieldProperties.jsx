import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  FormControlLabel,
  Box,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Grid,
  Slider,
} from "@mui/material";
import {
  IconPlus,
  IconTrash,
  IconSettings,
  IconChevronDown,
  IconEdit,
} from "@tabler/icons-react";
import { defaultFieldTypes } from "../types";

const FieldProperties = ({ field, onFieldUpdate }) => {
  const [localField, setLocalField] = useState(field);
  const [enumOptions, setEnumOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [layout, setLayout] = useState("");

  const ALL_ROLE_CODES = [
    "OWNER",
    "HR",
    "EXE",
    "MGM",
    "SAL",
    "FIN",
    "OPR",
    "USER",
    "ADM",
  ];

  const getRoleDisplayName = (code) => ALL_ROLE_CODES[code] || code;
  const handleAccessChipClick = (roleCode) => {
    const exists = selectedAccess.includes(roleCode);
    const newSelected = exists
      ? selectedAccess.filter((r) => r !== roleCode)
      : [...selectedAccess, roleCode];
    setSelectedAccess(newSelected);
    handleSchemaUpdate({
      allowedAccess: newSelected.length > 0 ? newSelected : undefined,
    });
  };

  const handleLayoutChange = (event) => {
    const newLayoutType = event.target.value;
    setLayout(newLayoutType);

    const uischemaType =
      newLayoutType === "horizontal-layout"
        ? "HorizontalLayout"
        : "VerticalLayout";

    const updatedField = {
      ...localField,
      label:
        newLayoutType === "horizontal-layout"
          ? "Horizontal Layout"
          : "Vertical Layout",
      type: newLayoutType,
      uischema: {
        ...localField.uischema,
        type: uischemaType,
      },
    };

    setLocalField(updatedField);
    onFieldUpdate(updatedField);
  };

  
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (field && field.id !== localField?.id) {
      setLocalField({ ...field });
      if (field.isLayout) {
        setLayout(field.type);
      }
      if (field.schema?.enum) {
        setEnumOptions([...field.schema.enum]);
      } else {
        setEnumOptions([]);
      }
      setSelectedAccess(field.schema?.allowedAccess || []);
    }
  }, [field?.id]);
  /* eslint-enable react-hooks/exhaustive-deps */

  if (!localField) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <IconSettings
          size={48}
          style={{ marginBottom: "16px" }}
          color="currentColor"
        />
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ fontWeight: 500, color: "grey.400" }}
        >
          Select a field to edit
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Click on any field in the form structure to configure its properties
        </Typography>
      </Box>
    );
  }

  const handleUpdate = (updates) => {
    const updatedField = { ...localField, ...updates };
    setLocalField(updatedField);
    onFieldUpdate(updatedField);
  };

  const handleSchemaUpdate = (schemaUpdates) => {
    const updatedSchema = { ...localField.schema, ...schemaUpdates };
    handleUpdate({ schema: updatedSchema });
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const newOptions = [...enumOptions, newOption.trim()];
      setEnumOptions(newOptions);
      handleSchemaUpdate({ enum: newOptions });
      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = enumOptions.filter((_, i) => i !== index);
    setEnumOptions(newOptions);
    handleSchemaUpdate({
      enum: newOptions.length > 0 ? newOptions : undefined,
    });
  };

  const handleFieldTypeChange = (newTypeId) => {
    const newFieldType = defaultFieldTypes.find((ft) => ft.id === newTypeId);
    if (newFieldType && !newFieldType.isLayout) {
      const updatedField = {
        ...localField,
        type: newFieldType.id,
        schema: { ...newFieldType.schema, title: localField.label },
        uischema: {
          ...newFieldType.uischema,
          scope: `#/properties/${localField.key}`,
        },
      };

      // Preserve enum options if switching to/from select/radio
      if (hasEnumOptions && ["select", "radio"].includes(newTypeId)) {
        updatedField.schema.enum = enumOptions;
      }

      setLocalField(updatedField);
      onFieldUpdate(updatedField);

      // Update enum options state for new type
      if (newFieldType.schema.enum) {
        setEnumOptions([...newFieldType.schema.enum]);
      } else if (!["select", "radio"].includes(newTypeId)) {
        setEnumOptions([]);
      }
    }
  };

  const getFieldTypeIcon = (typeId) => {
    const fieldType = defaultFieldTypes.find((ft) => ft.id === typeId);
    return fieldType?.icon || IconEdit;
  };

  const availableFieldTypes = defaultFieldTypes.filter((ft) => !ft.isLayout);
  const hasEnumOptions = ["select", "radio"].includes(localField.type);
  const isGroup = localField.uischema?.type === "Group";
  const isLayout = localField.isLayout && localField.uischema?.type !== "Group";

  const handleUiOptionsUpdate = (updates) => {
    const existingUiOptions =
      localField.uischema?.options?.["ui:options"] || {};
    const updatedUiSchema = {
      ...localField.uischema,
      options: {
        ...localField.uischema?.options,
        "ui:options": {
          ...existingUiOptions,
          ...updates,
        },
      },
    };
    handleUpdate({ uischema: updatedUiSchema });
  };

  return (
    <Box>
      {/* Basic Properties */}
      <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 1 }}>
        <AccordionSummary expandIcon={<IconChevronDown />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Basic Properties
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {/* Show label field only for groups and non-layout fields */}
            {!isLayout && (
              <TextField
                label={isGroup ? "Group Title" : "Label"}
                fullWidth
                value={localField.label}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  if (isGroup) {
                    const updatedUISchema = {
                      ...localField.uischema,
                      label: newLabel,
                    };
                    handleUpdate({
                      label: newLabel,
                      uischema: updatedUISchema,
                    });
                  } else {
                    handleUpdate({ label: newLabel });
                  }
                }}
                margin="normal"
                variant="outlined"
                helperText={
                  isGroup
                    ? "Displayed as the group header"
                    : "The display label for this field"
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}

            {/* Layout selector for vertical/horizontal layouts */}
            {isLayout && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="layout-select-label">Layout Type</InputLabel>
                <Select
                  labelId="layout-select-label"
                  value={layout}
                  label="Layout Type"
                  onChange={handleLayoutChange}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="vertical-layout">Vertical Layout</MenuItem>
                  <MenuItem value="horizontal-layout">
                    Horizontal Layout
                  </MenuItem>
                </Select>
              </FormControl>
            )}

            {!isLayout && !isGroup && (
              <>
                <TextField
                  label="Field Key"
                  fullWidth
                  value={localField.key}
                  onChange={(e) => handleUpdate({ key: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  helperText="Unique identifier for this field"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={localField.type}
                    label="Field Type"
                    onChange={(e) => handleFieldTypeChange(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {availableFieldTypes.map((fieldType) => {
                      const IconComponent = fieldType.icon;
                      return (
                        <MenuItem key={fieldType.id} value={fieldType.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconComponent size={18} />
                            <Typography>{fieldType.label}</Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={localField.required || false}
                      onChange={(e) =>
                        handleUpdate({ required: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label="Required Field"
                  sx={{ mt: 1 }}
                />
              </>
            )}

            {isGroup && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localField.uischema?.options?.collapsed || false}
                      onChange={(e) => {
                        const updatedUISchema = {
                          ...localField.uischema,
                          options: {
                            ...localField.uischema?.options,
                            collapsed: e.target.checked,
                          },
                        };
                        handleUpdate({ uischema: updatedUISchema });
                      }}
                      color="primary"
                    />
                  }
                  label="Collapsible Group"
                  sx={{ mt: 1 }}
                />

                {localField.uischema?.options?.collapsed && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          localField.uischema?.options
                            ?.showUnfocusedDescription || false
                        }
                        onChange={(e) => {
                          const updatedUISchema = {
                            ...localField.uischema,
                            options: {
                              ...localField.uischema?.options,
                              showUnfocusedDescription: e.target.checked,
                            },
                          };
                          handleUpdate({ uischema: updatedUISchema });
                        }}
                        color="primary"
                      />
                    }
                    label="Start Collapsed"
                  />
                )}
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
      {/* Display Options */}
      {!isLayout && !isGroup && (
        <Accordion sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Display Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <TextField
                label="Default Value"
                fullWidth
                value={localField.schema?.default || ""}
                onChange={(e) => {
                  let defaultValue = e.target.value;

                  // Convert to appropriate type
                  if (localField.type === "number") {
                    defaultValue = defaultValue
                      ? Number(defaultValue)
                      : undefined;
                  } else if (localField.type === "checkbox") {
                    defaultValue = defaultValue.toLowerCase() === "true";
                  }

                  handleSchemaUpdate({ default: defaultValue });
                }}
                margin="normal"
                variant="outlined"
                helperText="Initial value for this field"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* File Upload Options */}
      {localField.type === "file" && (
        <Accordion sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              File Upload Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <TextField
                label="Allowed File Types"
                fullWidth
                value={
                  localField.uischema?.options?.["ui:options"]?.accept || ""
                }
                onChange={(e) =>
                  handleUiOptionsUpdate({
                    accept: e.target.value || undefined,
                  })
                }
                margin="normal"
                variant="outlined"
                helperText="Comma-separated list of allowed file types (e.g., .jpg, .png, .pdf)"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Validation Rules */}
      {!isLayout && !isGroup && (
        <Accordion sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Validation Rules
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {(localField.type === "text" ||
                localField.type === "textarea" ||
                localField.type === "email") && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Min Length"
                        type="number"
                        fullWidth
                        value={localField.schema?.minLength || ""}
                        onChange={(e) =>
                          handleSchemaUpdate({
                            minLength: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        margin="normal"
                        variant="outlined"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max Length"
                        type="number"
                        fullWidth
                        value={localField.schema?.maxLength || ""}
                        onChange={(e) =>
                          handleSchemaUpdate({
                            maxLength: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        margin="normal"
                        variant="outlined"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Pattern (RegEx)"
                    fullWidth
                    value={localField.schema?.pattern || ""}
                    onChange={(e) =>
                      handleSchemaUpdate({
                        pattern: e.target.value || undefined,
                      })
                    }
                    margin="normal"
                    variant="outlined"
                    helperText="Regular expression for validation (e.g., ^[A-Za-z]+$ for letters only)"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </>
              )}

              {localField.type === "number" && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Minimum Value"
                      type="number"
                      fullWidth
                      value={localField.schema?.minimum || ""}
                      onChange={(e) =>
                        handleSchemaUpdate({
                          minimum: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      margin="normal"
                      variant="outlined"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Maximum Value"
                      type="number"
                      fullWidth
                      value={localField.schema?.maximum || ""}
                      onChange={(e) =>
                        handleSchemaUpdate({
                          maximum: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      margin="normal"
                      variant="outlined"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Options for Select/Radio Fields */}
      {hasEnumOptions && (
        <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  label="New Option"
                  size="small"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddOption();
                    }
                  }}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                  }}
                />
                <IconButton
                  onClick={handleAddOption}
                  sx={{
                    color: "success.main",
                    backgroundColor: "success.light",
                    borderRadius: 1.5,
                    "&:hover": {
                      backgroundColor: (theme) => theme.palette.success.light,
                      color: "success.dark",
                    },
                  }}
                >
                  <IconPlus size={20} />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {enumOptions.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    onDelete={() => handleRemoveOption(index)}
                    deleteIcon={<IconTrash size={16} />}
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      "& .MuiChip-deleteIcon": {
                        color: "error.main",
                        "&:hover": { color: "error.dark" },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Advanced Options */}
      {!isLayout && !isGroup && (
        <Accordion sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Advanced Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Allowed Access */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 600 }}
              >
                Allowed Access
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {ALL_ROLE_CODES.map((roleCode) => (
                  <Chip
                    key={roleCode}
                    size="small"
                    variant={
                      selectedAccess.includes(roleCode) ? "filled" : "outlined"
                    }
                    color={
                      selectedAccess.includes(roleCode) ? "primary" : "default"
                    }
                    label={getRoleDisplayName(roleCode)}
                    clickable
                    onClick={() => handleAccessChipClick(roleCode)}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={localField.uischema?.options?.readonly || false}
                    onChange={(e) => {
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          readonly: e.target.checked,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    color="primary"
                  />
                }
                label="Read Only"
                sx={{ mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localField.uischema?.options?.hidden || false}
                    onChange={(e) => {
                      const isHidden = e.target.checked;
                      const updatedUISchema = { ...localField.uischema };

                      if (isHidden) {
                        updatedUISchema.options = {
                          ...updatedUISchema.options,
                          hidden: true,
                        };
                      } else {
                        if (updatedUISchema.options) {
                          const { hidden: _hidden, ...otherOptions } =
                            updatedUISchema.options;
                          updatedUISchema.options = otherOptions;
                          if (
                            Object.keys(updatedUISchema.options).length === 0
                          ) {
                            delete updatedUISchema.options;
                          }
                        }
                      }

                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    color="primary"
                  />
                }
                label="Hidden Field"
                sx={{ mb: 1 }}
              />

              {localField.type === "textarea" && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Rows: {localField.uischema?.options?.rows || 3}
                  </Typography>
                  <Slider
                    value={localField.uischema?.options?.rows || 3}
                    onChange={(e, value) => {
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          rows: value,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Field Info */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: "grey.50",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Typography variant="subtitle2" gutterBottom color="grey.700">
          {isGroup
            ? "Group Container"
            : isLayout
            ? "Layout Container"
            : "Field Information"}
        </Typography>

        {!isGroup && !isLayout && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            {React.createElement(getFieldTypeIcon(localField.type), {
              size: 16,
              color: "#666",
            })}
            <Typography variant="body2" color="grey.600">
              Type: {localField.type}
            </Typography>
          </Box>
        )}

        {!isGroup && !isLayout && localField.schema.format && (
          <Typography variant="body2" color="grey.600" sx={{ mb: 1 }}>
            Format: {localField.schema.format}
          </Typography>
        )}

        <Typography
          variant="body2"
          color="grey.500"
          sx={{ fontStyle: "italic" }}
        >
          {isGroup
            ? "Groups provide visual separation and can contain any fields or layouts"
            : isLayout
            ? localField.type === "vertical-layout"
              ? "Stacks elements vertically"
              : "Arranges elements horizontally"
            : `Key: ${localField.key}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default FieldProperties;
