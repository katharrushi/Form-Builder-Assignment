import React, { useRef } from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Typography, Box, Button } from "@mui/material";
import { IconUpload } from "@tabler/icons-react";

const FileUploadControlBase = ({
  data,
  path,
  handleChange,
  label,
  visible,
  enabled,
  errors,
  required,
}) => {
  const inputRef = useRef(null);

  if (visible === false) return null;

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange(path, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
        {required ? " *" : ""}
      </Typography>

      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
        disabled={!enabled}
      />

      <Button
        variant="outlined"
        fullWidth
        startIcon={<IconUpload size={18} />}
        onClick={() => inputRef.current?.click()}
        disabled={!enabled}
        sx={{
          justifyContent: "flex-start",
          borderStyle: "dashed",
          py: 1.5,
        }}
      >
        {data ? "Change file" : "Click to upload or drag file"}
      </Button>

      {data && (
        <Typography
          variant="caption"
          sx={{ mt: 0.5, display: "block" }}
          color="textSecondary"
        >
          File selected
        </Typography>
      )}

      {errors && (
        <Typography variant="caption" color="error">
          {errors}
        </Typography>
      )}
    </Box>
  );
};

const FileUploadControl = withJsonFormsControlProps(FileUploadControlBase);

export default FileUploadControl;
