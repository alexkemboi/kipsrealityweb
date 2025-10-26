import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Service } from './type';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
}

export default function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {service.icon && (
              <Typography variant="h5" component="span">
                {service.icon}
              </Typography>
            )}
            <Typography variant="h6" component="h4" fontWeight={600}>
              {service.name}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={0.5}>
            <IconButton 
              size="small" 
              onClick={() => onEdit(service)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => onDelete(service.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {service.description}
        </Typography>
        
        {service.features.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Features:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {service.features.map((feature, idx) => (
                <Chip 
                  key={idx} 
                  label={feature} 
                  size="small" 
                  variant="outlined"
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        )}
        
        {service.impact && (
          <Box
            sx={{
              bgcolor: 'success.light',
              color: 'success.dark',
              p: 1,
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Typography variant="caption" fontWeight={600}>
              Impact:
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {service.impact}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}