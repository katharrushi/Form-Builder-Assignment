import React, { useState, useCallback } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Button,
  Typography,
} from "@mui/material";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  IconHammer,
  IconEye,
  IconEyeOff,
  IconCode,
  IconClipboard,
  IconDownload,
  IconX,
} from "@tabler/icons-react";

import FormPreview from "./components/FormPreview";
import FieldPalette from "./components/FieldPalette";
import SchemaEditor from "./components/SchemaEditor";
import FormStructure from "./components/FormStructure";
import FieldProperties from "./components/FieldProperties";

import { defaultFieldTypes } from "./types";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1ad7e8ff",
      light: "#4285f4",
      dark: "#1557b0",
    },
    secondary: {
      main: "#5f6368",
      light: "#80868b",
      dark: "#3c4043",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    divider: "#e8eaed",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
  },
});

const App = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [formData, setFormData] = useState({});
  const [propertiesDrawerOpen, setPropertiesDrawerOpen] = useState(false);

  const [activeId, setActiveId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const fieldCounter = React.useRef(0);
  const pendingOperations = React.useRef(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const buildSchemaFromFields = (fieldsArray, parentKey = null) => {
    const properties = {};
    const required = [];
    const nestedObjects = {};

    fieldsArray.forEach((field) => {
      if (!field.isLayout) {
        properties[field.key] = {
          ...field.schema,
          title: field.label,
        };

        if (field.required) {
          required.push(field.key);
        }
      } else if (field.type === "object") {
        // Object field - creates nested structure
        const childSchema = field.children
          ? buildSchemaFromFields(field.children, field.key)
          : { properties: {}, required: [] };
        properties[field.key] = {
          type: "object",
          title: field.label,
          properties: childSchema.properties,
          ...(childSchema.required &&
            childSchema.required.length > 0 && {
              required: childSchema.required,
            }),
        };
        // Add to required array if marked as required
        if (field.required) {
          required.push(field.key);
        }
        // Merge any nested objects from children
        Object.assign(nestedObjects, childSchema.nestedObjects || {});
      } else if (field.type === "array") {
        if (field.children && field.children.length > 0) {
          // Build schema for array items from children
          const childSchema = buildSchemaFromFields(field.children, null);

          properties[field.key] = {
            type: "array",
            title: field.label,
            items: {
              type: "object",
              properties: childSchema.properties,
              ...(childSchema.required &&
                childSchema.required.length > 0 && {
                  required: childSchema.required,
                }),
            },
            ...(field.schema.minItems && { minItems: field.schema.minItems }),
            ...(field.schema.maxItems && { maxItems: field.schema.maxItems }),
            ...(field.schema.uniqueItems && {
              uniqueItems: field.schema.uniqueItems,
            }),
          };
        } else {
          properties[field.key] = {
            ...field.schema,
            title: field.label,
          };
        }

        if (field.required) {
          required.push(field.key);
        }
      } else {
        if (field.children) {
          const childSchema = buildSchemaFromFields(field.children, parentKey);
          Object.assign(properties, childSchema.properties);

          if (childSchema.required) {
            required.push(...childSchema.required);
          }
          Object.assign(nestedObjects, childSchema.nestedObjects || {});
        }
      }
    });

    return { properties, required, nestedObjects };
  };

  const buildUISchemaForArrayItems = (fieldsArray) => {
    return fieldsArray
      .filter((field) => !field.uischema?.options?.hidden)
      .map((field) => {
        if (field.isLayout && field.type !== "array") {
          return {
            ...field.uischema,
            label: field.label,
            elements: field.children
              ? buildUISchemaForArrayItems(field.children)
              : [],
          };
        } else if (field.type === "array") {
          let nestedDetailElements = [];
          if (field.children && field.children.length > 0) {
            nestedDetailElements = buildUISchemaForArrayItems(field.children);
          }
          return {
            type: "Control",
            scope: `#/properties/${field.key}`,
            label: field.label,
            options: {
              ...field.uischema?.options,
              showSortButtons: true,
              ...(nestedDetailElements.length > 0 && {
                detail: {
                  type: "VerticalLayout",
                  elements: nestedDetailElements,
                },
              }),
            },
          };
        } else {
          return {
            type: "Control",
            scope: `#/properties/${field.key}`,
            label: field.label,
            options: field.uischema?.options,
          };
        }
      });
  };

  const buildUISchemaFromFields = (fieldsArray, parentKey = null) => {
    return fieldsArray
      .filter((field) => {
        return !field.uischema?.options?.hidden;
      })
      .map((field) => {
        if (field.isLayout) {
          if (field.type === "object") {
            return {
              type: "Group",
              label: field.label,
              elements: field.children
                ? buildUISchemaFromFields(
                    field.children,
                    parentKey
                      ? `${parentKey}/properties/${field.key}`
                      : field.key
                  )
                : [],
            };
          } else {
            // Regular layout (group, vertical, horizontal)
            const uischema = {};

            // Add icon first if it exists (for groups)
            if (field.icon) {
              uischema.icon = `Icon${field.icon}`; // Store as full icon name like IconStars
            }

            // Then add type, label, and elements
            uischema.type = field.uischema.type;
            uischema.label = field.label;
            uischema.elements = field.children
              ? buildUISchemaFromFields(field.children, parentKey)
              : [];

            // Add any other uischema properties
            if (field.uischema.options) {
              uischema.options = field.uischema.options;
            }

            return uischema;
          }
        } else {
          // Check if it's an array field
          if (field.type === "array") {
            const scope = parentKey
              ? `#/properties/${parentKey}/properties/${field.key}`
              : `#/properties/${field.key}`;

            let detailElements = [];
            if (field.children && field.children.length > 0) {
              detailElements = buildUISchemaForArrayItems(field.children);
            }

            return {
              type: "Control",
              scope: scope,
              label: field.label,
              options: {
                ...field.uischema?.options,
                showSortButtons: true,
                ...(detailElements.length > 0 && {
                  detail: {
                    type: "VerticalLayout",
                    elements: detailElements,
                  },
                }),
              },
            };
          } else {
            // Regular field
            const scope = parentKey
              ? `#/properties/${parentKey}/properties/${field.key}`
              : `#/properties/${field.key}`;
            return {
              ...field.uischema,
              scope: scope,
              label: field.label,
            };
          }
        }
      });
  };

  // Handle form data changes with nested object support
  const handleFormDataChange = (newData) => {
    setFormData(newData);
  };

  const createDefaultArrayItem = (children) => {
    const item = {};
    children.forEach((child) => {
      if (!child.isLayout) {
        // Initialize field with default value
        if (child.schema.type === "boolean") {
          item[child.key] = false;
        } else if (child.schema.type === "number") {
          item[child.key] = 0;
        } else if (child.schema.type === "array") {
          item[child.key] = [];
        } else {
          item[child.key] = "";
        }
      } else if (child.type === "object") {
        // Initialize nested object
        item[child.key] = child.children
          ? createDefaultArrayItem(child.children)
          : {};
      } else if (child.type === "array") {
        // Nested array
        item[child.key] = [];
      } else if (child.children) {
        // Layout fields - merge their children into current level
        const layoutData = createDefaultArrayItem(child.children);
        Object.assign(item, layoutData);
      }
    });
    return item;
  };

  // Initialize nested object data structure - FIXED VERSION
  const initializeNestedFormData = (fieldsArray, parentData = {}) => {
    const data = { ...parentData };

    fieldsArray.forEach((field) => {
      if (!field.isLayout) {
        // Initialize field with default value if not set
        if (!(field.key in data)) {
          if (field.schema.type === "boolean") {
            data[field.key] = false;
          } else if (field.schema.type === "number") {
            data[field.key] = 0;
          } else if (field.schema.type === "array") {
            // Arrays should be initialized with sample data if children exist
            if (field.children && field.children.length > 0) {
              // Create one sample item to show the structure
              const sampleItem = createDefaultArrayItem(field.children);
              data[field.key] = [sampleItem];
            } else {
              data[field.key] = [];
            }
          } else {
            data[field.key] = "";
          }
        }
      } else if (field.type === "object") {
        // Initialize nested object
        if (!(field.key in data)) {
          data[field.key] = {};
        }
        if (field.children) {
          data[field.key] = initializeNestedFormData(
            field.children,
            data[field.key]
          );
        }
      } else if (field.type === "array") {
        // Initialize array with sample data to show structure
        if (!(field.key in data)) {
          if (field.children && field.children.length > 0) {
            // Create one sample item to show the fields
            const sampleItem = createDefaultArrayItem(field.children);
            data[field.key] = [sampleItem];
          } else {
            data[field.key] = [];
          }
        } else if (Array.isArray(data[field.key])) {
          // If array exists but is empty and has children, add a sample item
          if (
            data[field.key].length === 0 &&
            field.children &&
            field.children.length > 0
          ) {
            const sampleItem = createDefaultArrayItem(field.children);
            data[field.key] = [sampleItem];
          }
        }
      } else if (field.children) {
        // Process children for layout fields
        Object.assign(data, initializeNestedFormData(field.children, data));
      }
    });

    return data;
  };

  React.useEffect(() => {
    if (fields.length > 0) {
      const currentData = { ...formData };
      const initializedData = initializeNestedFormData(fields, currentData);

      if (JSON.stringify(currentData) !== JSON.stringify(initializedData)) {
        setFormData(initializedData);
      }
    }
  }, [fields]);

  const schemaData = buildSchemaFromFields(fields);
  const formState = {
    schema: {
      type: "object",
      properties: schemaData.properties,
      ...(schemaData.required &&
        schemaData.required.length > 0 && { required: schemaData.required }),
    },
    uischema: {
      type: "VerticalLayout",
      elements: buildUISchemaFromFields(fields),
    },
    data: formData,
  };

  const addField = useCallback((fieldType, parentId, index) => {
    // Create a unique operation ID to prevent duplicates
    const operationId = `${fieldType.id}-${parentId || "root"}-${Date.now()}`;

    if (pendingOperations.current.has(operationId)) {
      return;
    }

    // Mark operation as pending
    pendingOperations.current.add(operationId);

    // Clean up after a short delay
    setTimeout(() => {
      pendingOperations.current.delete(operationId);
    }, 100);

    // Use a unique counter to prevent StrictMode duplications
    fieldCounter.current += 1;
    const uniqueId = fieldCounter.current;

    const fieldKey = fieldType.isLayout
      ? `layout_${uniqueId}`
      : `${fieldType.id}_${uniqueId}`;

    const newField = {
      id: `field_${uniqueId}`,
      type: fieldType.id,
      label: fieldType.isLayout ? fieldType.label : `${fieldType.label} Field`,
      key: fieldKey,
      required: false,
      schema: { ...fieldType.schema },
      uischema: { ...fieldType.uischema },
      isLayout: fieldType.isLayout,
      children: fieldType.isLayout || fieldType.id === "array" ? [] : undefined,
      parentId: parentId,
    };
    setFields((prev) => {
      const newFields = [...prev];

      if (parentId) {
        // Add to specific parent layout
        const addToParent = (fieldsArray) => {
          for (const field of fieldsArray) {
            if (
              field.id === parentId &&
              (field.isLayout || field.type === "array")
            ) {
              if (!field.children) field.children = [];
              if (typeof index === "number") {
                field.children.splice(index, 0, newField);
              } else {
                field.children.push(newField);
              }
              return true;
            }
            if (field.children && addToParent(field.children)) {
              return true;
            }
          }
          return false;
        };
        addToParent(newFields);
      } else {
        // Add to root level
        if (typeof index === "number") {
          newFields.splice(index, 0, newField);
        } else {
          newFields.push(newField);
        }
      }

      return newFields;
    });

    setSelectedField(newField);
    if (!fieldType.isLayout) {
      setPropertiesDrawerOpen(true);
    }
  }, []);

  const addFieldToLayout = useCallback(
    (parentId, index) => {
      const defaultFieldType =
        defaultFieldTypes.find((ft) => !ft.isLayout && ft.id !== "array") ||
        defaultFieldTypes[0];
      addField(defaultFieldType, parentId, index);
    },
    [addField]
  );

  const addLayoutToContainer = useCallback(
    (parentId, layoutType, index) => {
      addField(layoutType, parentId, index);
    },
    [addField]
  );

  const handleFieldSelect = useCallback(
    (fieldType) => {
      addField(fieldType);
    },
    [addField]
  );

  const handleFieldUpdate = useCallback((updatedField) => {
    setFields((prev) => {
      const updateFieldById = (fieldsArray, updatedField) => {
        return fieldsArray.map((field) => {
          if (field.id === updatedField.id) {
            // Replace with updated field (shallow copy to avoid accidental refs)
            return { ...updatedField };
          }
          if (field.children && field.children.length > 0) {
            const newChildren = updateFieldById(field.children, updatedField);
            // Only create a new parent object if children changed
            const childrenChanged = newChildren !== field.children;
            return childrenChanged
              ? { ...field, children: newChildren }
              : field;
          }
          return field;
        });
      };
      return updateFieldById(prev, updatedField);
    });
    setSelectedField(updatedField);
  }, []);

  const exportForm = () => {
    const exportData = {
      schema: formState.schema,
      uischema: formState.uischema,
      fields: fields,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "form-config.json");
    linkElement.click();
  };

  // Drag and Drop handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Determine what is being dragged
    if (active.data.current?.type === "palette-item") {
      // Dragging from palette
      const fieldType = defaultFieldTypes.find((ft) => ft.id === active.id);
      setDraggedItem({
        type: "palette-item",
        fieldType: fieldType,
      });
    } else {
      // Dragging existing field in structure
      const draggedField = findFieldById(fields, active.id);
      setDraggedItem({
        type: "structure-item",
        field: draggedField,
      });
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    // Handle dropping palette items into structure
    if (
      active.data.current?.type === "palette-item" &&
      over.data.current?.accepts
    ) {
      // Visual feedback logic can go here
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    // Handle different drag scenarios
    if (active.data.current?.type === "palette-item") {
      // Dragging from palette to structure
      const fieldType = defaultFieldTypes.find((ft) => ft.id === active.id);
      if (
        fieldType &&
        over.data.current?.accepts?.includes(
          fieldType.isLayout ? "layout" : "field"
        )
      ) {
        const dropTargetId = over.data.current.parentId;
        const dropIndex = over.data.current.index;
        addField(fieldType, dropTargetId, dropIndex);
      }
    } else if (active.data.current?.type === "structure-item") {
      // Dragging existing structure item
      if (
        over.data.current?.accepts?.includes("structure-item") ||
        over.data.current?.parentId !== undefined ||
        over.id.startsWith("drop-")
      ) {
        // Dropping into a drop zone
        const dropTargetId = over.data.current.parentId;
        const dropIndex = over.data.current.index;
        moveExistingField(active.id, dropTargetId, dropIndex);
      } else if (
        active.id !== over.id &&
        over.data.current?.type === "structure-item"
      ) {
        // Reordering within structure (dragging onto another field)
        handleReorderFields(active.id, over.id, over.data.current);
      }
    }

    setActiveId(null);
    setDraggedItem(null);
  };

  // Move existing field to new position
  const moveExistingField = (fieldId, targetParentId, targetIndex) => {
    setFields((prevFields) => {
      const newFields = [...prevFields];

      // Find and remove the field from its current position
      const fieldToMove = removeFieldById(newFields, fieldId);
      if (!fieldToMove) return prevFields;

      // Insert field at new position
      if (targetParentId) {
        // Moving into a layout
        const parent = findFieldById(newFields, targetParentId);
        if (parent && (parent.isLayout || parent.type === "array")) {
          if (!parent.children) parent.children = [];
          const insertIndex = Math.min(targetIndex, parent.children.length);
          parent.children.splice(insertIndex, 0, fieldToMove);
          fieldToMove.parentId = parent.id;
        }
      } else {
        // Moving to root level
        const insertIndex = Math.min(targetIndex, newFields.length);
        newFields.splice(insertIndex, 0, fieldToMove);
        fieldToMove.parentId = null;
      }

      return newFields;
    });
  };

  // Helper function to find field by ID
  const findFieldById = (fieldsArray, id) => {
    for (const field of fieldsArray) {
      if (field.id === id) return field;
      if (field.children) {
        const found = findFieldById(field.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleReorderFields = (activeId, overId, overData) => {
    setFields((prevFields) => {
      const newFields = [...prevFields];

      const activeField = findFieldById(newFields, activeId);
      const overField = findFieldById(newFields, overId);

      if (!activeField || !overField) return prevFields;

      removeFieldById(newFields, activeId);

      insertFieldAfter(newFields, activeField, overId, overData);

      return newFields;
    });
  };

  const removeFieldById = (fieldsArray, id) => {
    for (let i = 0; i < fieldsArray.length; i++) {
      if (fieldsArray[i].id === id) {
        return fieldsArray.splice(i, 1)[0];
      }
      if (fieldsArray[i].children) {
        const removed = removeFieldById(fieldsArray[i].children, id);
        if (removed) return removed;
      }
    }
    return null;
  };

  const insertFieldAfter = (fieldsArray, fieldToInsert, afterId, overData) => {
    if (overData?.parentId) {
      const parent = findFieldById(fieldsArray, overData.parentId);
      if (parent && (parent.isLayout || parent.type === "array")) {
        if (!parent.children) parent.children = [];
        const insertIndex =
          overData.index !== undefined
            ? overData.index
            : parent.children.length;
        parent.children.splice(insertIndex, 0, fieldToInsert);
        fieldToInsert.parentId = parent.id;
        return true;
      }
    }

    for (let i = 0; i < fieldsArray.length; i++) {
      if (fieldsArray[i].id === afterId) {
        fieldsArray.splice(i + 1, 0, fieldToInsert);
        fieldToInsert.parentId = null;
        return true;
      }
      if (fieldsArray[i].children) {
        if (
          insertFieldAfter(
            fieldsArray[i].children,
            fieldToInsert,
            afterId,
            overData
          )
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Custom collision detection for better drop zone targeting
  const customCollisionDetection = (args) => {
    const { active, droppableContainers } = args;

    // For palette items, use closest center
    if (active.data.current?.type === "palette-item") {
      return closestCenter(args);
    }

    const dropZones = Array.from(droppableContainers.values()).filter(
      (container) => container.id.includes("drop-")
    );

    if (dropZones.length > 0) {
      const dropZoneCollisions = rectIntersection({
        ...args,
        droppableContainers: new Map(dropZones.map((zone) => [zone.id, zone])),
      });

      if (dropZoneCollisions && dropZoneCollisions.length > 0) {
        return dropZoneCollisions;
      }
    }

    return closestCenter(args);
  };

  const getAllFieldIds = (fieldsArray) => {
    const ids = [];
    fieldsArray.forEach((field) => {
      ids.push(field.id);
      if (field.children) {
        ids.push(...getAllFieldIds(field.children));
      }
    });
    return ids;
  };

  const mapSchemaPropertyToFieldType = useCallback((property) => {
    const { type, enum: enumValues, format } = property;

    if (enumValues && enumValues.length > 0) {
      if (enumValues.length <= 3) {
        return (
          defaultFieldTypes.find((ft) => ft.id === "radio") ||
          defaultFieldTypes[0]
        );
      } else {
        return (
          defaultFieldTypes.find((ft) => ft.id === "select") ||
          defaultFieldTypes[0]
        );
      }
    }

    switch (type) {
      case "string":
        if (format === "email") {
          return (
            defaultFieldTypes.find((ft) => ft.id === "email") ||
            defaultFieldTypes[0]
          );
        }
        if (format === "date") {
          return (
            defaultFieldTypes.find((ft) => ft.id === "date") ||
            defaultFieldTypes[0]
          );
        }
        if (property.maxLength && property.maxLength > 100) {
          return (
            defaultFieldTypes.find((ft) => ft.id === "textarea") ||
            defaultFieldTypes[0]
          );
        }
        return (
          defaultFieldTypes.find((ft) => ft.id === "text") ||
          defaultFieldTypes[0]
        );
      case "number":
      case "integer":
        return (
          defaultFieldTypes.find((ft) => ft.id === "number") ||
          defaultFieldTypes[0]
        );
      case "boolean":
        return (
          defaultFieldTypes.find((ft) => ft.id === "checkbox") ||
          defaultFieldTypes[0]
        );
      default:
        return (
          defaultFieldTypes.find((ft) => ft.id === "text") ||
          defaultFieldTypes[0]
        );
    }
  }, []);

  const convertSchemaToFieldsHelper = (schema, uischema = null) => {
    if (!schema || !schema.properties) return [];

    if (uischema && uischema.elements) {
      const fields = [];
      const processedKeys = new Set();

      uischema.elements.forEach((element) => {
        if (element.type === "Group" && element.elements) {
          fieldCounter.current += 1;
          const groupId = fieldCounter.current;

          const groupField = {
            id: `field_${groupId}`,
            type: "group",
            label: element.label || "Group",
            key: `group_${groupId}`,
            isLayout: true,
            schema: {},
            uischema: { type: "Group", label: element.label },
            children: [],
            parentId: null,
          };

          element.elements.forEach((control) => {
            if (control.type === "Control" && control.scope) {
              const propKey = control.scope.replace("#/properties/", "");
              const property = schema.properties[propKey];
              if (property) {
                processedKeys.add(propKey);
                fieldCounter.current += 1;
                const fieldId = fieldCounter.current;

                const fieldType = mapSchemaPropertyToFieldType(property);
                const childField = {
                  id: `field_${fieldId}`,
                  type: fieldType.id,
                  label: property.title || propKey,
                  key: propKey,
                  required: schema.required?.includes(propKey) || false,
                  isLayout: false,
                  schema: { ...fieldType.schema, ...property },
                  uischema: {
                    ...fieldType.uischema,
                    scope: `#/properties/${propKey}`,
                  },
                  parentId: `field_${groupId}`,
                };
                groupField.children.push(childField);
              }
            }
          });

          fields.push(groupField);
        }
      });

      // Add any remaining fields not in groups
      Object.entries(schema.properties).forEach(([key, property]) => {
        if (!processedKeys.has(key)) {
          fieldCounter.current += 1;
          const fieldId = fieldCounter.current;
          const fieldType = mapSchemaPropertyToFieldType(property);
          fields.push({
            id: `field_${fieldId}`,
            type: fieldType.id,
            label: property.title || key,
            key,
            required: schema.required?.includes(key) || false,
            isLayout: false,
            schema: { ...fieldType.schema, ...property },
            uischema: { ...fieldType.uischema, scope: `#/properties/${key}` },
            parentId: null,
          });
        }
      });

      return fields;
    }

    const fields = [];

    Object.entries(schema.properties).forEach(([key, property]) => {
      // Use the shared ref counter so ids are unique across the app
      fieldCounter.current += 1;
      const uniqueId = fieldCounter.current;

      // Helper label
      const label =
        property.title ||
        key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

      // Object (nested) properties -> create an object layout with children
      if (property.type === "object" && property.properties) {
        const objectType =
          defaultFieldTypes.find((ft) => ft.id === "object") ||
          defaultFieldTypes[0];
        let children = convertSchemaToFieldsHelper(property, uischema);
        // assign parentId for each child so the designer knows their parent
        children = children.map((c) => ({
          ...c,
          parentId: `field_${uniqueId}`,
        }));

        const newField = {
          id: `field_${uniqueId}`,
          type: objectType.id,
          label,
          key,
          required: schema.required?.includes(key) || false,
          isLayout: true,
          schema: { ...objectType.schema, ...property },
          uischema: { ...objectType.uischema, label },
          children,
          parentId: null,
        };

        fields.push(newField);
        return;
      }

      // Array of objects -> create an array field whose item detail contains children
      if (
        property.type === "array" &&
        property.items &&
        property.items.type === "object"
      ) {
        const arrayType =
          defaultFieldTypes.find((ft) => ft.id === "array") ||
          defaultFieldTypes[0];
        let children = convertSchemaToFieldsHelper(property.items, uischema);
        // children belong to this array field (set parentId to this array field's id)
        children = children.map((c) => ({
          ...c,
          parentId: `field_${uniqueId}`,
        }));

        // keep the original items schema but attach children for designer
        const newField = {
          id: `field_${uniqueId}`,
          type: arrayType.id,
          label,
          key,
          required: schema.required?.includes(key) || false,
          isLayout: false, // array itself is a control but will have nested detail
          schema: { ...arrayType.schema, ...property },
          uischema: { ...arrayType.uischema, scope: `#/properties/${key}` },
          children,
          parentId: null,
        };

        fields.push(newField);
        return;
      }

      // Regular scalar or enum fields
      const fieldType = mapSchemaPropertyToFieldType(property);
      const newField = {
        id: `field_${uniqueId}`,
        type: fieldType.id,
        label,
        key,
        required: schema.required?.includes(key) || false,
        isLayout: fieldType.isLayout || false,
        schema: { ...fieldType.schema, ...property },
        uischema: { ...fieldType.uischema, scope: `#/properties/${key}` },
        parentId: null,
      };

      if (property.enum) {
        newField.schema.enum = property.enum;
      }

      fields.push(newField);
    });

    return fields;
  };

  const convertSchemaToFields = useCallback((schema, uischema = null) => {
    return convertSchemaToFieldsHelper(schema, uischema);
  }, []);

  // Schema loading functionality
  const handleLoadSchemaFromPalette = useCallback(
    (schemaId) => {
      // Simple sample schemas for the dropdown
      const sampleSchemas = [
        {
          id: "product-order",
          name: "Product Order Form",
          description:
            "E-commerce order form with product selection and shipping details",
          tags: ["E-commerce", "Order", "Shopping"],
          schema: {
            type: "object",
            properties: {
              customerName: {
                type: "string",
                title: "Full Name",
              },
              email: {
                type: "string",
                format: "email",
                title: "Email",
              },
              phone: {
                type: "string",
                title: "Phone Number",
              },
              product: {
                type: "string",
                title: "Product",
                enum: [
                  "Laptop",
                  "Smartphone",
                  "Tablet",
                  "Headphones",
                  "Smart Watch",
                ],
              },
              quantity: {
                type: "number",
                title: "Quantity",
                minimum: 1,
                maximum: 10,
              },
              shippingAddress: {
                type: "string",
                title: "Shipping Address",
                maxLength: 500,
              },
              shippingMethod: {
                type: "string",
                title: "Shipping Method",
                enum: [
                  "Standard (5-7 days)",
                  "Express (2-3 days)",
                  "Overnight",
                ],
              },
              giftWrap: {
                type: "boolean",
                title: "Gift Wrap ($5 extra)",
              },
              specialInstructions: {
                type: "string",
                title: "Special Instructions",
                maxLength: 200,
              },
            },
            required: [
              "customerName",
              "email",
              "product",
              "quantity",
              "shippingAddress",
            ],
          },
        },
        {
          id: "organization-onboarding",
          name: "Organization Onboarding Form",
          description:
            "Comprehensive onboarding form for new organizations with multiple departments and contacts",
          tags: ["Onboarding", "Organization", "Multi-department"],
          schema: {
            type: "object",
            properties: {
              personal_info: {
                type: "object",
                properties: {
                  first_name: {
                    type: "string",
                    isTitle: true,
                    tableView: true,
                    showAvatar: true,
                    picturePath: "personal_info.profile_picture",
                    title: "First Name",
                  },
                  middle_name: {
                    type: "string",
                    title: "Middle Name",
                  },
                  last_name: {
                    type: "string",
                    isTitle: true,
                    tableView: true,
                    title: "Last Name",
                  },
                  blood_group: {
                    type: "string",
                    title: "Blood Group",
                    enum: [
                      "A+",
                      "A-",
                      "B+",
                      "B-",
                      "AB+",
                      "AB-",
                      "O+",
                      "O-",
                      "Prefer not to say",
                    ],
                  },
                  date_of_birth: {
                    type: "string",
                    format: "date",
                    title: "Date of Birth",
                  },
                  gender: {
                    type: "string",
                    enum: ["Male", "Female", "Other", "Prefer not to say"],
                  },
                  marital_status: {
                    type: "string",
                    enum: [
                      "Single",
                      "Married",
                      "Divorced",
                      "Widowed",
                      "Prefer not to say",
                    ],
                  },
                  nationality: {
                    type: "string",
                  },
                  profile_picture: {
                    type: "string",
                  },
                },
                required: [
                  "first_name",
                  "last_name",
                  "date_of_birth",
                  "gender",
                  "nationality",
                ],
              },
              contact_info: {
                type: "object",
                properties: {
                  contact_number: {
                    type: "string",
                    title: "Contact Number",
                  },
                  email: {
                    type: "string",
                    title: "Email",
                  },
                  current_address: {
                    type: "object",
                    properties: {
                      address_line_1: {
                        type: "string",
                      },
                      address_line_2: {
                        type: "string",
                      },
                      city: {
                        type: "string",
                      },
                      state: {
                        type: "string",
                      },
                      country: {
                        type: "string",
                      },
                      zipcode: {
                        type: "string",
                      },
                    },
                    required: [
                      "address_line_1",
                      "address_line_2",
                      "city",
                      "state",
                      "country",
                      "zipcode",
                    ],
                  },
                  permanent_address: {
                    type: "object",
                    properties: {
                      address_line_1: {
                        type: "string",
                      },
                      address_line_2: {
                        type: "string",
                      },
                      city: {
                        type: "string",
                      },
                      state: {
                        type: "string",
                      },
                      country: {
                        type: "string",
                      },
                      zipcode: {
                        type: "string",
                      },
                    },
                    required: [
                      "address_line_1",
                      "address_line_2",
                      "city",
                      "state",
                      "country",
                      "zipcode",
                    ],
                  },
                },
                required: ["contact_number", "email"],
              },
              education: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    degree: {
                      type: "string",
                      enum: [
                        "High School",
                        "Associate",
                        "Bachelor",
                        "Master",
                        "Doctorate",
                      ],
                    },
                    field_of_study: {
                      type: "string",
                    },
                    institution_name: {
                      type: "string",
                    },
                    start_year: {
                      type: "number",
                    },
                    end_year: {
                      type: "number",
                    },
                  },
                  required: [
                    "degree",
                    "field_of_study",
                    "institution_name",
                    "start_year",
                  ],
                },
                minItems: 1,
                uniqueItems: true,
              },
              emergency_contacts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    first_name: {
                      type: "string",
                    },
                    middle_name: {
                      type: "string",
                    },
                    last_name: {
                      type: "string",
                    },
                    contact_number: {
                      type: "string",
                    },
                    email: {
                      type: "string",
                    },
                    relation: {
                      type: "string",
                    },
                  },
                  required: [
                    "first_name",
                    "last_name",
                    "contact_number",
                    "relation",
                  ],
                },
                minItems: 1,
                uniqueItems: true,
              },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    organisation: {
                      type: "string",
                    },
                    experience_years: {
                      type: "number",
                    },
                    startDate: {
                      type: "string",
                      format: "date",
                      title: "Start Date",
                    },
                    endDate: {
                      type: "string",
                      format: "date",
                      title: "End Date",
                    },
                    address: {
                      type: "string",
                    },
                    contact: {
                      type: "string",
                    },
                  },
                  required: [
                    "organisation",
                    "experience_years",
                    "startDate",
                    "endDate",
                    "address",
                    "contact",
                  ],
                },
              },
              certifications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    issuer: {
                      type: "string",
                    },
                    number: {
                      type: "string",
                    },
                    level: {
                      type: "string",
                    },
                    name: {
                      type: "string",
                    },
                    issue_date: {
                      type: "string",
                      format: "date",
                    },
                    expiry_date: {
                      type: "string",
                      format: "date",
                    },
                  },
                  required: [
                    "issuer",
                    "number",
                    "level",
                    "name",
                    "issue_date",
                    "expiry_date",
                  ],
                },
              },
              passport: {
                type: "object",
                properties: {
                  number: {
                    type: "string",
                  },
                  nationality: {
                    type: "string",
                  },
                  expiry_date: {
                    type: "string",
                    format: "date",
                  },
                  full_name: {
                    type: "string",
                  },
                },
                required: ["number", "nationality", "expiry_date", "full_name"],
              },
              visa: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    visa_number: {
                      type: "string",
                    },
                    name: {
                      type: "string",
                    },
                    nationality: {
                      type: "string",
                    },
                    date_of_birth: {
                      type: "string",
                      format: "date",
                    },
                    issue_date: {
                      type: "string",
                      format: "date",
                    },
                    expiry_date: {
                      type: "string",
                      format: "date",
                    },
                    visa_type: {
                      type: "string",
                      enum: [
                        "Tourist",
                        "Business",
                        "Work",
                        "Student",
                        "Transit",
                      ],
                    },
                  },
                  required: [
                    "visa_number",
                    "name",
                    "nationality",
                    "date_of_birth",
                    "issue_date",
                    "expiry_date",
                    "visa_type",
                  ],
                },
                uniqueItems: true,
              },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    type: {
                      type: "string",
                    },
                    description: {
                      type: "string",
                    },
                    status: {
                      type: "string",
                      enum: [
                        "UPLOAD-PENDING",
                        "REVIEW-PENDING",
                        "ACCEPTED",
                        "REJECTED",
                      ],
                    },
                    comments: {
                      type: "string",
                    },
                  },
                  required: ["id", "type", "description", "status"],
                },
              },
              documents_issued: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    type: {
                      type: "string",
                    },
                    description: {
                      type: "string",
                    },
                  },
                  required: ["id", "type", "description"],
                },
              },
              employment_info: {
                type: "object",
                properties: {
                  employeeid: {
                    type: "string",
                    title: "Employee Id",
                    tableView: true,
                    isSubTitle: true,
                  },
                  joining_date: {
                    type: "string",
                    format: "date",
                  },
                  email: {
                    type: "string",
                    title: "Email",
                  },
                  employee_level: {
                    type: "string",
                    enum: [
                      "Junior",
                      "Mid",
                      "Senior",
                      "Lead",
                      "Manager",
                      "Director",
                      "VP",
                      "C-Level",
                    ],
                  },
                  job_role: {
                    type: "object",
                    properties: {
                      code: {
                        type: "string",
                      },
                      title: {
                        type: "string",
                        tableView: true,
                        title: "Job Role",
                      },
                    },
                    required: ["code", "title"],
                  },
                  designation: {
                    type: "string",
                    title: "Designation",
                    tableView: true,
                  },
                  office_location: {
                    type: "string",
                    title: "Office Location",
                    tableView: true,
                    isSubTitle: true,
                  },
                  salary: {
                    type: "object",
                    tableView: true,
                    title: "Salary Details",
                    properties: {
                      currency: {
                        type: "string",
                        title: "Currency",
                      },
                      currency_icon: {
                        type: "string",
                        title: "Currency Icon",
                      },
                      basic_salary: {
                        type: "number",
                        title: "Basic Salary",
                      },
                      allowances: {
                        type: "number",
                        title: "Allowances",
                      },
                      deductions: {
                        type: "number",
                        title: "Deductions",
                      },
                      net_salary: {
                        type: "number",
                        title: "Net Salary",
                      },
                    },
                    required: [
                      "currency",
                      "currency_icon",
                      "basic_salary",
                      "allowances",
                      "deductions",
                      "net_salary",
                    ],
                  },
                  hr_partner: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        title: "HR Partner",
                      },
                      employeeid: {
                        type: "string",
                      },
                    },
                    required: ["name", "employeeid"],
                  },
                  reporting_manager: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      employeeid: {
                        type: "string",
                      },
                    },
                    required: ["name", "employeeid"],
                  },

                  accounts: {
                    type: "array",
                    title: "Accounts",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          title: "Account ID",
                        },
                        name: {
                          type: "string",
                          title: "Account Name",
                          tableView: true,
                          isSubTitle: true,
                        },
                        start_date: {
                          type: "string",
                          format: "date",
                          title: "Start Date",
                        },
                        end_date: {
                          type: "string",
                          format: "date",
                          title: "End Date",
                        },
                        projects: {
                          type: "array",
                          title: "Projects",
                          items: {
                            type: "object",
                            properties: {
                              id: {
                                type: "string",
                                title: "Project ID",
                              },
                              name: {
                                type: "string",
                                title: "Project Name",
                                tableView: true,
                              },
                              start_date: {
                                type: "string",
                                format: "date",
                                title: "Start Date",
                              },
                              end_date: {
                                type: "string",
                                format: "date",
                                title: "End Date",
                              },
                            },
                            required: ["id", "name", "start_date", "end_date"],
                          },
                        },
                      },
                      required: ["id", "name", "start_date", "end_date"],
                    },
                  },
                },
                required: [
                  "salary",
                  "job_role",
                  "employeeid",
                  "designation",
                  "joining_date",
                  "hr_partner",
                  "employee_level",
                  "office_location",
                  "reporting_manager",
                ],
              },
              skills: {
                type: "array",
                title: "Skills",
                tableView: true,
                items: {
                  type: "object",
                  properties: {
                    skill: {
                      type: "string",
                      title: "Skills",
                      tableView: true,
                    },
                    self: {
                      type: "number",
                      title: "Self Rating",
                    },
                    system: {
                      type: "number",
                      title: "System Rating",
                    },
                  },
                  required: ["skill"],
                },
              },
            },
            required: [
              "personal_info",
              "contact_info",
              "education",
              "emergency_contacts",
              "skills",
              "documents",
              "documents_issued",
              "employment_info",
            ],
          },
        },
      ];

      const selectedSchema = sampleSchemas.find((s) => s.id === schemaId);
      if (selectedSchema && selectedSchema.schema) {
        // Convert schema to fields format
        const convertedFields = convertSchemaToFields(
          selectedSchema.schema,
          selectedSchema.uischema
        );
        setFields(convertedFields);
        setFormData({});
        setSelectedField(null);
        setPropertiesDrawerOpen(false);
      }
    },
    [convertSchemaToFields]
  );

  const isGroup = selectedField?.uischema?.type === "Group";

  const isLayout =
    selectedField?.isLayout && selectedField?.uischema?.type !== "Group";

  const formTitle = isGroup
    ? "Group Properties"
    : isLayout
    ? "Layout Properties"
    : "Field Properties";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext
          items={getAllFieldIds(fields)}
          strategy={verticalListSortingStrategy}
        >
          <Box
            sx={{
              width: "100vw",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[200]} 100%)`,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "primary.contrastText",
                p: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    margin: 0,
                    fontSize: { xs: "20px", sm: "28px" },
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Form Builder
                </Typography>
              </Box>
            </Box>

            {/* Main Content */}
            <Box
              sx={{
                display: "flex",
                flex: 1,
                overflow: "hidden",
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              {/* Left Sidebar - Field Palette */}
              <Box
                sx={{
                  width: { xs: "100%", md: "320px" },
                  minWidth: { md: "320px" },
                  maxHeight: { xs: "40vh", md: "none" },
                  borderRight: { md: 1 },
                  borderColor: { md: "grey.200" },
                  borderBottom: { xs: 1, md: "none" },
                  display: "flex",
                  flexDirection: "column",
                  overflow: "auto",
                  boxShadow: { md: 1 },
                }}
              >
                {" "}
                <FieldPalette
                  onFieldSelect={handleFieldSelect}
                  onLoadSchema={handleLoadSchemaFromPalette}
                />{" "}
              </Box>

              {/* Center Content - Toggle between Form Structure and Form Preview */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "auto",
                  minHeight: { xs: "60vh", md: "auto" },
                }}
              >
                {/* Schema Editor (when enabled) */}
                {showSchemaEditor && (
                  <SchemaEditor
                    formState={formState}
                    onFormStateChange={(newFormState) =>
                      setFormData(newFormState.data)
                    }
                    showFormPreview={showFormPreview}
                    setShowFormPreview={setShowFormPreview}
                    showSchemaEditor={showSchemaEditor}
                    setShowSchemaEditor={setShowSchemaEditor}
                    exportForm={exportForm}
                  />
                )}

                {/* Content Area - Either Form Structure or Form Preview */}
                {!showSchemaEditor && (
                  <div
                    style={{
                      flex: 1,
                      overflow: "auto",
                    }}
                  >
                    {showFormPreview ? (
                      /* Form Preview Mode */
                      <FormPreview
                        formState={formState}
                        onDataChange={handleFormDataChange}
                        showFormPreview={showFormPreview}
                        setShowFormPreview={setShowFormPreview}
                        showSchemaEditor={showSchemaEditor}
                        setShowSchemaEditor={setShowSchemaEditor}
                        exportForm={exportForm}
                      />
                    ) : (
                      /* Form Structure Mode */
                      <FormStructure
                        fields={fields}
                        onFieldsChange={setFields}
                        onFieldSelect={(field, openDrawer = false) => {
                          setSelectedField(field);

                          if (openDrawer) {
                            setPropertiesDrawerOpen(true);
                          }
                        }}
                        selectedField={selectedField}
                        onAddFieldToLayout={addFieldToLayout}
                        onAddLayoutToContainer={addLayoutToContainer}
                        showFormPreview={showFormPreview}
                        setShowFormPreview={setShowFormPreview}
                        showSchemaEditor={showSchemaEditor}
                        setShowSchemaEditor={setShowSchemaEditor}
                        exportForm={exportForm}
                      />
                    )}
                  </div>
                )}
              </Box>
            </Box>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId && draggedItem ? (
                <Box
                  sx={{
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: "primary.contrastText",
                    p: "8px 12px",
                    borderRadius: 1,
                    fontSize: "14px",
                    fontWeight: "bold",
                    boxShadow: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <span>
                    {draggedItem.type === "palette-item"
                      ? draggedItem.fieldType?.icon &&
                        React.createElement(draggedItem.fieldType.icon, {
                          size: 16,
                        })
                      : "📝"}
                  </span>
                  <span>
                    {draggedItem.type === "palette-item"
                      ? draggedItem.fieldType?.label
                      : draggedItem.field?.label || "Field"}
                  </span>
                </Box>
              ) : null}
            </DragOverlay>
          </Box>

          {/* Properties Panel */}
          {propertiesDrawerOpen && selectedField && (
            <Box
              sx={{
                position: "fixed",
                right: 0,
                top: 0,
                width: { xs: "100vw", sm: "400px", md: "380px" },
                height: "100vh",
                background: "white",
                boxShadow:
                  "-4px 0 25px -5px rgb(0 0 0 / 0.1), -2px 0 10px -5px rgb(0 0 0 / 0.04)",
                zIndex: 1000,
                overflow: "auto",
                borderLeft: 1,
                borderColor: "grey.200",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: 1,
                  borderColor: "grey.200",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "grey.50",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ margin: 0, fontWeight: 600, color: "grey.800" }}
                >
                  {formTitle}
                </Typography>
                <Button
                  onClick={() => setPropertiesDrawerOpen(false)}
                  size="small"
                  sx={{
                    minWidth: "auto",
                    p: 1,
                    borderRadius: 1.5,
                    color: "grey.500",
                    "&:hover": {
                      backgroundColor: "grey.200",
                      color: "grey.600",
                    },
                  }}
                >
                  <IconX size={20} />
                </Button>
              </Box>
              <Box sx={{ p: 3 }}>
                <FieldProperties
                  field={selectedField}
                  onFieldUpdate={handleFieldUpdate}
                />
              </Box>
            </Box>
          )}
        </SortableContext>
      </DndContext>
    </ThemeProvider>
  );
};

export default App;
