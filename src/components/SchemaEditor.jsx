import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Box } from '@mui/material';
import { IconCode } from '@tabler/icons-react';
import CommonHeader from './CommonHeader';

const SchemaEditor = ({
  formState,
  onFormStateChange,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
}) => {
  const [schemaText, setSchemaText] = useState('');
  const [uischemaText, setUischemaText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setSchemaText(JSON.stringify(formState.schema, null, 2));
    setUischemaText(JSON.stringify(formState.uischema, null, 2));
  }, [formState]);

  const handleApply = () => {
    try {
      const newSchema = JSON.parse(schemaText);
      const newUischema = JSON.parse(uischemaText);

      onFormStateChange({
        ...formState,
        schema: newSchema,
        uischema: newUischema,
      });

      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CommonHeader
        title="Schema Editor"
        description="View and edit the JSON schema and UI schema"
        icon={IconCode}
        showFormPreview={showFormPreview}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={showSchemaEditor}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={exportForm}
      />

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}

        <Box display="flex" gap={2} sx={{ flex: 1, mb: 2 }}>
          <Box flex={1} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" gutterBottom>
              JSON Schema
            </Typography>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                },
              }}
              InputProps={{
                style: {
                  fontFamily: 'Monaco, Courier New, monospace',
                  fontSize: '11px',
                  lineHeight: '1.4',
                },
              }}
            />
          </Box>

          <Box flex={1} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" gutterBottom>
              UI Schema
            </Typography>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={uischemaText}
              onChange={(e) => setUischemaText(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                },
              }}
              InputProps={{
                style: {
                  fontFamily: 'Monaco, Courier New, monospace',
                  fontSize: '11px',
                  lineHeight: '1.4',
                },
              }}
            />
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          <Button variant="contained" onClick={handleApply}>
            Apply Changes
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SchemaEditor;
