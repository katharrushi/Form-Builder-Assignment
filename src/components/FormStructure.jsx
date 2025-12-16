import React, { useState } from "react";
import { Box, Paper, Typography, Chip, useTheme } from "@mui/material";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  IconGripVertical,
  IconBox,
  IconCube,
  IconLayoutRows,
  IconLayoutColumns,
  IconList,
  IconEdit,
  IconTarget,
  IconPlus,
  IconForms,
} from "@tabler/icons-react";
import ActionButtons from "./ActionButtons";
import ContextMenu from "./ContextMenu";
import CommonHeader from "./CommonHeader";

// Sortable field component
const SortableFieldItem = ({
  field,
  level = 0,
  parentId,
  onFieldSelect,
  onAddFieldToLayout,
  onAddLayoutToContainer,
  moveField,
  deleteField,
  selectedField,
}) => {
  const [contextMenu, setContextMenu] = useState(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: "structure-item",
      field: field,
      parentId: parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedField?.id === field.id;
  const isLayout = field.isLayout;
  const isGroup = field.type === "group";
  const isArray = field.type === "array";

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const getFieldIcon = (theme) => {
    const iconProps = { size: 18, color: theme.palette.grey[600] };
    if (isGroup) {
      return <IconBox {...iconProps} />;
    }
    if (field.type === "object") return <IconCube {...iconProps} />;
    if (field.type === "vertical-layout")
      return <IconLayoutRows {...iconProps} />;
    if (field.type === "horizontal-layout")
      return <IconLayoutColumns {...iconProps} />;
    if (field.type === "array") return <IconList {...iconProps} />;
    return <IconEdit {...iconProps} />;
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Paper
        elevation={isSelected ? 2 : 0}
        sx={{
          p: 2.5,
          mb: 1.5,
          ml: level * 2,
          cursor: "pointer",
          border: (theme) =>
            isSelected
              ? `2px solid ${theme.palette.primary.main}`
              : isGroup
              ? `2px solid ${theme.palette.warning.main}`
              : isArray
              ? `2px solid ${theme.palette.info.main}`
              : `1px solid ${theme.palette.grey[200]}`,
          borderRadius: 2,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          },
        }}
        onClick={() => onFieldSelect(field)}
        onContextMenu={handleContextMenu}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: 0,
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Box
              {...attributes}
              {...listeners}
              sx={{
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                color: "grey.400",
                "&:hover": { color: "grey.500" },
                "&:active": { cursor: "grabbing" },
              }}
            >
              <IconGripVertical size={16} />
            </Box>
            <Box
              sx={{ minWidth: "20px", display: "flex", alignItems: "center" }}
            >
              {getFieldIcon(useTheme())}
            </Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: isLayout || isArray ? "bold" : "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
                flex: 1,
              }}
            >
              {field.label}
            </Typography>
            {(isLayout || isArray) && (
              <Chip
                label={
                  isGroup
                    ? "Group"
                    : field.type === "object"
                    ? "Object"
                    : field.type === "array"
                    ? "Array"
                    : field.uischema?.type || "Layout"
                }
                size="small"
                color={
                  isGroup
                    ? "warning"
                    : field.type === "object"
                    ? "success"
                    : field.type === "array"
                    ? "info"
                    : "primary"
                }
                variant="outlined"
                sx={{
                  fontSize: level > 2 ? "10px" : "12px",
                  height: level > 2 ? 20 : 24,
                  "& .MuiChip-label": {
                    px: level > 2 ? 0.5 : 1,
                  },
                }}
              />
            )}
            {field.required && (
              <Typography variant="caption" color="error">
                *
              </Typography>
            )}
            {field.uischema?.options?.hidden && (
              <Chip
                label="Hidden"
                size="small"
                color="secondary"
                variant="outlined"
                sx={{
                  fontSize: "10px",
                  height: 18,
                  opacity: 0.7,
                  "& .MuiChip-label": {
                    px: 0.5,
                  },
                }}
              />
            )}
            {level > 0 && level <= 3 && (
              <Chip
                label={`L${level}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "9px",
                  height: 16,
                  minWidth: 20,
                  "& .MuiChip-label": {
                    px: 0.5,
                  },
                }}
              />
            )}
          </Box>

          <ActionButtons
            field={field}
            level={level}
            parentId={parentId}
            onFieldSelect={onFieldSelect}
            onAddFieldToLayout={onAddFieldToLayout}
            onAddLayoutToContainer={onAddLayoutToContainer}
            moveField={moveField}
            deleteField={deleteField}
          />
        </Box>

        {/* Render children for layouts AND arrays */}
        {(isLayout || isArray) &&
          field.children &&
          field.children.length > 0 && (
            <Box
              sx={{
                mt: 2,
                pl: 2,
                borderLeft: 2,
                borderColor: "grey.300",
              }}
            >
              <SortableContext
                items={field.children.map((child) => child.id)}
                strategy={verticalListSortingStrategy}
              >
                <DropZone
                  parentId={field.id}
                  index={0}
                  accepts={["field", "layout"]}
                />
                {field.children.map((child, index) => (
                  <React.Fragment key={child.id}>
                    <SortableFieldItem
                      field={child}
                      level={level + 1}
                      parentId={field.id}
                      onFieldSelect={onFieldSelect}
                      onAddFieldToLayout={onAddFieldToLayout}
                      onAddLayoutToContainer={onAddLayoutToContainer}
                      moveField={moveField}
                      deleteField={deleteField}
                      selectedField={selectedField}
                    />
                    <DropZone
                      parentId={field.id}
                      index={index + 1}
                      accepts={["field", "layout"]}
                    />
                  </React.Fragment>
                ))}
              </SortableContext>
            </Box>
          )}

        {/* Show empty state for layouts/arrays without children */}
        {(isLayout || isArray) &&
          (!field.children || field.children.length === 0) && (
            <DropZone
              parentId={field.id}
              index={0}
              accepts={["field", "layout"]}
              isEmpty={true}
              onAddField={() => onAddFieldToLayout(field.id)}
            />
          )}
      </Paper>

      <ContextMenu
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
        field={field}
        parentId={parentId}
        onFieldSelect={onFieldSelect}
        onAddFieldToLayout={onAddFieldToLayout}
        onAddLayoutToContainer={onAddLayoutToContainer}
        moveField={moveField}
        deleteField={deleteField}
      />
    </div>
  );
};

// Drop zone component
const DropZone = ({
  parentId,
  index,
  accepts,
  isEmpty = false,
  onAddField,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-${parentId || "root"}-${index}`,
    data: {
      parentId: parentId,
      index: index,
      accepts: [...accepts, "structure-item"], // Accept both palette items and existing structure items
    },
  });

  if (isEmpty) {
    return (
      <Box
        ref={setNodeRef}
        sx={{
          mt: 2,
          p: 4,
          border: isOver ? 2 : "2px dashed",
          borderColor: isOver ? "primary.main" : "grey.300",
          borderRadius: 3,
          textAlign: "center",
          color: isOver ? "primary.main" : "grey.500",
          cursor: "pointer",
          transition: "all 0.2s ease",
          minHeight: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-1px)",
          },
        }}
        onClick={onAddField}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {isOver ? <IconTarget size={20} /> : <IconPlus size={20} />}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {isOver ? "Drop here!" : "No fields yet"}
          </Typography>
        </Box>
        <Typography variant="caption" color="textSecondary">
          {isOver
            ? "Release to add item"
            : "Choose Template from form templates"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: isOver ? 50 : 24,
        borderRadius: 1,
        transition: "all 0.2s ease",
        margin: "8px 0",
        opacity: isOver ? 1 : 0.7,
        border: (theme) =>
          isOver
            ? `2px solid ${theme.palette.primary.main}`
            : `2px dashed ${theme.palette.grey[300]}`,
        borderColor: isOver ? "primary.main" : "grey.300",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        "&:hover": {
          opacity: 1,
          minHeight: 36,
          borderColor: "primary.main",
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: isOver ? "white" : "grey.500",
          fontWeight: 500,
          fontSize: "11px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {isOver ? (
          <>
            <IconTarget size={14} /> DROP HERE
          </>
        ) : (
          <>
            <IconPlus size={14} /> Drop items here
          </>
        )}
      </Typography>
    </Box>
  );
};

const FormStructure = ({
  fields,
  onFieldsChange,
  onFieldSelect,
  selectedField,
  onAddFieldToLayout,
  onAddLayoutToContainer,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
}) => {
  const moveField = (fieldId, direction, parentId) => {
    const newFields = [...fields];

    const moveInArray = (array, targetId) => {
      const index = array.findIndex((f) => f.id === targetId);
      if (index === -1) return false;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= array.length) return false;

      // Swap elements
      [array[index], array[newIndex]] = [array[newIndex], array[index]];
      return true;
    };

    if (parentId) {
      // Find parent and move within its children
      const findAndMoveInChildren = (fieldsArray) => {
        for (const field of fieldsArray) {
          if (field.id === parentId && field.children) {
            return moveInArray(field.children, fieldId);
          }
          if (field.children && findAndMoveInChildren(field.children)) {
            return true;
          }
        }
        return false;
      };
      findAndMoveInChildren(newFields);
    } else {
      // Move in root level
      moveInArray(newFields, fieldId);
    }

    onFieldsChange(newFields);
  };

  const deleteField = (fieldId, parentId) => {
    const newFields = [...fields];

    const deleteFromArray = (array, targetId) => {
      const index = array.findIndex((f) => f.id === targetId);
      if (index !== -1) {
        array.splice(index, 1);
        return true;
      }
      return false;
    };

    if (parentId) {
      // Delete from parent's children
      const findAndDeleteFromChildren = (fieldsArray) => {
        for (const field of fieldsArray) {
          if (field.id === parentId && field.children) {
            return deleteFromArray(field.children, fieldId);
          }
          if (field.children && findAndDeleteFromChildren(field.children)) {
            return true;
          }
        }
        return false;
      };
      findAndDeleteFromChildren(newFields);
    } else {
      // Delete from root level
      deleteFromArray(newFields, fieldId);
    }

    onFieldsChange(newFields);
  };

  return (
    <Box>
      <CommonHeader
        title="Form Design"
        description="Drag fields and layouts to organize your form"
        icon={IconForms}
        showFormPreview={showFormPreview}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={showSchemaEditor}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={exportForm}
      />

      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        {fields.length === 0 ? (
          <DropZone
            parentId={null}
            index={0}
            accepts={["field", "layout"]}
            isEmpty={true}
            onAddField={() => {
              // Could add a default field here if needed
              console.log("Add field to empty form");
            }}
          />
        ) : (
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <DropZone parentId={null} index={0} accepts={["field", "layout"]} />
            {fields.map((field, index) => (
              <React.Fragment key={field.id}>
                <SortableFieldItem
                  field={field}
                  level={0}
                  parentId={null}
                  onFieldSelect={onFieldSelect}
                  onAddFieldToLayout={onAddFieldToLayout}
                  onAddLayoutToContainer={onAddLayoutToContainer}
                  moveField={moveField}
                  deleteField={deleteField}
                  selectedField={selectedField}
                />
                <DropZone
                  parentId={null}
                  index={index + 1}
                  accepts={["field", "layout"]}
                />
              </React.Fragment>
            ))}
          </SortableContext>
        )}
      </Box>
    </Box>
  );
};

export default FormStructure;
