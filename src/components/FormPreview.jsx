import React from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { Typography, Box } from "@mui/material";
import { IconEye } from "@tabler/icons-react";
import CommonHeader from "./CommonHeader";
import { customRenderers } from "../controls/renderers";


const renderersWithCustom = [...materialRenderers, ...customRenderers];

const FormPreview = ({
  formState,
  onDataChange,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
}) => {
  return (
    <Box>
      <CommonHeader
        title="Form Preview"
  
        icon={IconEye}
        showFormPreview={showFormPreview}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={showSchemaEditor}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={exportForm}
      />

      <Box sx={{ p: 2 }}>
        {formState. schema. properties &&
        Object.keys(formState.schema.properties).length > 0 ? (
          <JsonForms
            schema={formState.schema}
            uischema={formState.uischema}
            data={formState.data}
            renderers={renderersWithCustom}
            cells={materialCells}
            onChange={({ data }) => onDataChange(data)}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            No fields added yet.  Start by adding fields from the palette. 
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FormPreview;