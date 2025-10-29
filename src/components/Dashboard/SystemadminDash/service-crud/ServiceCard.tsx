// ServiceCard.tsx
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
          boxShadow: 3,
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
          mb: 1.5,
          gap: { xs: 1, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 1.5 }, 
            flex: 1, 
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' }
          }}>
            {service.icon && (
              <Typography 
                variant="h5" 
                component="span" 
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '1.75rem' }, 
                  flexShrink: 0 
                }}
              >
                {service.icon}
              </Typography>
            )}
            <Typography 
              variant="h6" 
              component="h4" 
              fontWeight={700}
              sx={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                fontSize: { xs: '1rem', sm: '1.25rem' },
                wordBreak: 'break-word',
              }}
            >
              {service.name}
            </Typography>
          </Box>
          
          <Stack 
            direction="row" 
            spacing={0.5} 
            sx={{ 
              ml: { xs: 0, sm: 1 }, 
              flexShrink: 0,
              alignSelf: { xs: 'flex-end', sm: 'flex-start' }
            }}
          >
            <IconButton 
              size="small" 
              onClick={() => onEdit(service)}
              color="primary"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => onDelete(service.id)}
              color="error"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            lineHeight: 1.6,
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
            wordBreak: 'break-word',
          }}
        >
          {service.description}
        </Typography>
        
        {service.features.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight={600} 
              gutterBottom
              sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
            >
              Features:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {service.features.map((feature, idx) => (
                <Chip 
                  key={idx} 
                  label={feature} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    mb: 0.5, 
                    borderRadius: 1,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 24, sm: 28 }
                  }}
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
              p: { xs: 1.25, sm: 1.5 },
              borderRadius: 1,
              mt: 2,
              borderLeft: 3,
              borderColor: 'success.main',
            }}
          >
            <Typography 
              variant="caption" 
              fontWeight={600} 
              display="block"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              Impact:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5, 
                fontWeight: 500,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                wordBreak: 'break-word',
              }}
            >
              {service.impact}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}