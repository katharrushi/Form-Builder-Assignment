import React from "react";
import { Box, Typography, Button, ButtonGroup } from "@mui/material";
import { IconEye, IconCode } from "@tabler/icons-react";

const CommonHeader = ({
  title,
  description,
  icon,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
}) => {
  const Icon = icon;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: 1,
        borderColor: "grey.200",
        backgroundColor: "background.paper",
      }}
    >
      {/* Header Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            color: "primary.contrastText",
            p: 1,
            borderRadius: 2,
            backgroundColor: "primary.main", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={24} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "grey.600",
              fontSize: "0.875rem",
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* View Buttons Group */}
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              "& .MuiButton-root": {
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "none",
                px: 2,
                py: 0.75,
              },
            }}
          >
            <Button
              onClick={() => {
                const newShowPreview = !showFormPreview;
                setShowFormPreview(newShowPreview);
                if (newShowPreview) {
                  setShowSchemaEditor(false);
                }
              }}
              variant={showFormPreview ? "contained" : "outlined"}
              startIcon={<IconEye size={16} />}
            >
              Preview
            </Button>
            <Button
              onClick={() => {
                const newShowSchema = !showSchemaEditor;
                setShowSchemaEditor(newShowSchema);
                if (newShowSchema) {
                  setShowFormPreview(false);
                }
              }}
              variant={showSchemaEditor ? "contained" : "outlined"}
              startIcon={<IconCode size={16} />}
            >
              Schema
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
};

export default CommonHeader;
