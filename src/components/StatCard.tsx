import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface StatCardProps {
  value: string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h3"
        component="div"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: 1,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "0.75rem",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
