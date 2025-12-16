import {
  IconLayoutRows,
  IconLayoutColumns,
  IconBox,
  IconEdit,
  IconFileText,
  IconHash,
  IconMail,
  IconCalendar,
  IconSquareCheck,
  IconChevronDown,
  IconCircleDot,
  IconCube,
  IconList,
} from "@tabler/icons-react";

export const defaultFieldTypes = [
  // Layout Elements
  {
    id: "vertical-layout",
    type: "layout",
    label: "Vertical Layout",
    icon: IconLayoutRows,
    isLayout: true,
    schema: {},
    uischema: {
      type: "VerticalLayout",
      elements: [],
    },
  },
  {
    id: "horizontal-layout",
    type: "layout",
    label: "Horizontal Layout",
    icon: IconLayoutColumns,
    isLayout: true,
    schema: {},
    uischema: {
      type: "HorizontalLayout",
      elements: [],
    },
  },
  {
    id: "group",
    type: "group",
    label: "Group",
    icon: IconBox,
    isLayout: true,
    schema: {},
    uischema: {
      type: "Group",
      label: "Group Section",
      elements: [],
    },
  },
  // Form Fields
  {
    id: "text",
    type: "string",
    label: "Text Input",
    icon: IconEdit,
    schema: {
      type: "string",
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
    },
  },
  {
    id: "textarea",
    type: "string",
    label: "Textarea",
    icon: IconFileText,
    schema: {
      type: "string",
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
      options: {
        multi: true,
      },
    },
  },
  {
    id: "number",
    type: "number",
    label: "Number",
    icon: IconHash,
    schema: {
      type: "number",
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
    },
  },
  {
    id: "email",
    type: "string",
    label: "Email",
    icon: IconMail,
    schema: {
      type: "string",
      format: "email",
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
    },
  },
  {
    id: "date",
    type: "string",
    label: "Date",
    icon: IconCalendar,
    schema: {
      type: "string",
      format: "date",
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
    },
  },
  {
    id: "checkbox",
    type: "boolean",
    label: "Checkbox",
    icon: IconSquareCheck,
    schema: {
      type: "boolean",
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
    },
  },
  {
    id: "select",
    type: "string",
    label: "Select",
    icon: IconChevronDown,
    schema: {
      type: "string",
      enum: ["Option 1", "Option 2", "Option 3"],
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
    },
  },
  {
    id: "radio",
    type: "string",
    label: "Radio Group",
    icon: IconCircleDot,
    schema: {
      type: "string",
      enum: ["Option 1", "Option 2", "Option 3"],
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
      options: {
        format: "radio",
      },
    },
  },
  {
    id: "object",
    type: "object",
    label: "Object",
    icon: IconCube,
    isLayout: true,
    schema: {
      type: "object",
      properties: {},
    },
    uischema: {
      type: "Group",
      label: "Object",
      elements: [],
    },
  },
  {
    id: "array",
    type: "array",
    label: "Array",
    icon: IconList,
    schema: {
      type: "array",
      items: {
        type: "string",
      },
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
      options: {
        detail: {
          type: "VerticalLayout",
          elements: [],
        },
      },
    },
  },
  {
    id: "file",
    type: "string",
    label: "File Upload",
    icon: IconFileText,
    schema: {
      type: "string",
      format: "data-url",
      title: "Upload File",
    },
    uischema: {
      type: "Control",
      scope: "#/properties/field",
      options: {
        "ui:widget": "file",
        "ui:options": {
          accept: "",
        },
      },
    },
  },
];

export const generateFieldKey = (type) => {
  const timestamp = Date.now();
  return `${type}_${timestamp}`;
};
