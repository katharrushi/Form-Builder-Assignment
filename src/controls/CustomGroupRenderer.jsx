import React from "react";
import { JsonFormsDispatch } from "@jsonforms/react";
import { withJsonFormsLayoutProps } from "@jsonforms/react";
import { Typography, Card, CardContent, Hidden } from "@mui/material";

const CustomGroupRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells, visible } = props;
  const elements = uischema.elements || [];
  const label = typeof uischema.label === "string" ? uischema.label : "";

  if (!visible) {
    return null;
  }

  return (
    <Hidden xsUp={!visible}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          {label && (
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              {label}
            </Typography>
          )}
          {elements.map((element, index) => (
            <JsonFormsDispatch
              key={`${path}-${index}`}
              uischema={element}
              schema={schema}
              path={path}
              enabled={enabled}
              renderers={renderers}
              cells={cells}
            />
          ))}
        </CardContent>
      </Card>
    </Hidden>
  );
};

const CustomGroupRendererWithProps =
  withJsonFormsLayoutProps(CustomGroupRenderer);

export default CustomGroupRendererWithProps;
